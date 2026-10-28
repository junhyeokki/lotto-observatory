// scripts/update-lotto.mjs
// 동행복권에서 새 회차를 가져와 draws.json 에 추가합니다.
// 사용법: node scripts/update-lotto.mjs [draws.json 경로]  (경로 생략 시 저장소 최상위 draws.json)
// 형식: [회차, 'YYYYMMDD', [번호6개], 보너스, 1등 인원, 1등 1인당 당첨금]
import fs from 'node:fs/promises'

const FILE = process.argv[2] || 'draws.json'
const API = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd='

const draws = JSON.parse(await fs.readFile(FILE, 'utf8'))
const have = new Set(draws.map(d => d[0]))
let next = Math.max(...have) + 1
let added = 0

while (true) {
  const res = await fetch(API + next, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://www.dhlottery.co.kr/lt645/result'
    }
  })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const json = await res.json()
  const list = json?.data?.list ?? []
  for (const d of list) {
    if (have.has(d.ltEpsd)) continue
    draws.push([
      d.ltEpsd, d.ltRflYmd,
      [d.tm1WnNo, d.tm2WnNo, d.tm3WnNo, d.tm4WnNo, d.tm5WnNo, d.tm6WnNo],
      d.bnsWnNo, d.rnk1WnNope, d.rnk1WnAmt
    ])
    have.add(d.ltEpsd)
    added++
  }
  if (!list.some(d => d.ltEpsd === next)) break // 아직 추첨 전
  next++
}

draws.sort((a, b) => a[0] - b[0])
await fs.writeFile(FILE, JSON.stringify(draws))
console.log(added ? `+${added}회 추가 (최신 ${draws.at(-1)[0]}회)` : '새 회차 없음')
