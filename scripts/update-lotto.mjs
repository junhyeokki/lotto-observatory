// scripts/update-lotto.mjs
// 새 회차 당첨번호를 가져와 draws.json 에 추가합니다.
// 1순위: 동행복권 공식 사이트 / 2순위(접속 실패 시): 공개 미러 smok95.github.io/lotto
// 사용법: node scripts/update-lotto.mjs [draws.json 경로]  (경로 생략 시 저장소 최상위 draws.json)
// 형식: [회차, 'YYYYMMDD', [번호6개], 보너스, 1등 인원, 1등 1인당 당첨금]
import fs from 'node:fs/promises'

const FILE = process.argv[2] || 'draws.json'
const DH = no => `https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=${no}`
const MIRROR = no => `https://smok95.github.io/lotto/results/${no}.json`
const get = (url, headers = {}) => fetch(url, { headers, signal: AbortSignal.timeout(15000) })

async function fromDh(no) {
  const res = await get(DH(no), {
    'User-Agent': 'Mozilla/5.0',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: 'https://www.dhlottery.co.kr/lt645/result'
  })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const list = (await res.json())?.data?.list ?? []
  const d = list.find(x => x.ltEpsd === no)
  if (!d) return null // 아직 추첨 전
  return [d.ltEpsd, d.ltRflYmd, [d.tm1WnNo, d.tm2WnNo, d.tm3WnNo, d.tm4WnNo, d.tm5WnNo, d.tm6WnNo], d.bnsWnNo, d.rnk1WnNope, d.rnk1WnAmt]
}

async function fromMirror(no) {
  const res = await get(MIRROR(no))
  if (res.status === 404) return null // 아직 미러에 없음
  if (!res.ok) throw new Error('미러 HTTP ' + res.status)
  const d = await res.json()
  if (d.draw_no !== no) return null
  const first = d.divisions?.[0] ?? {}
  return [d.draw_no, String(d.date).slice(0, 10).replace(/-/g, ''), d.numbers, d.bonus_no, first.winners ?? 0, first.prize ?? 0]
}

function valid(row) {
  const nums = row[2]
  return Array.isArray(nums) && nums.length === 6 && new Set(nums).size === 6 &&
    [...nums, row[3]].every(n => Number.isInteger(n) && n >= 1 && n <= 45) && /^\d{8}$/.test(row[1])
}

const draws = JSON.parse(await fs.readFile(FILE, 'utf8'))
const have = new Set(draws.map(d => d[0]))
let next = Math.max(...have) + 1
let source = 'dh'
let added = 0

while (true) {
  let row = null
  if (source === 'dh') {
    try { row = await fromDh(next) } catch (e) {
      console.log(`동행복권 접속 실패 (${e.cause?.code || e.name || e.message}) → 공개 미러로 전환`)
      source = 'mirror'
    }
  }
  if (source === 'mirror') row = await fromMirror(next)
  if (!row) break
  if (!valid(row)) throw new Error(`${next}회 데이터 형식 이상: ${JSON.stringify(row)}`)
  draws.push(row); have.add(next); added++
  console.log(`${next}회 추가: ${row[2].join(', ')} + ${row[3]} (${source === 'dh' ? '동행복권' : '미러'})`)
  next++
}

draws.sort((a, b) => a[0] - b[0])
await fs.writeFile(FILE, JSON.stringify(draws))
console.log(added ? `+${added}회 추가 (최신 ${draws.at(-1)[0]}회)` : `새 회차 없음 (최신 ${draws.at(-1)[0]}회)`)
