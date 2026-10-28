# 번호 관측소

로또 6/45 역대 당첨번호를 우주 관측소처럼 탐구하고, 매주 추천 번호 5줄과 근거를 보여 주는 웹사이트예요.
GitHub Pages로 무료 배포되고, GitHub Actions가 매주 토요일 밤 당첨번호를 자동으로 갱신해요.

## 폴더 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 사이트 본체 (화면, 3D 추첨기, 추천 로직 전부 포함) |
| `draws.json` | 역대 당첨번호 데이터 (자동 갱신 대상) |
| `scripts/update-lotto.mjs` | 동행복권에서 새 회차를 가져와 `draws.json`에 추가 |
| `.github/workflows/update-and-deploy.yml` | 매주 자동 갱신 + 사이트 배포 |

## 자동 갱신

- 매주 토요일 22시, 일요일 9시(한국 시간)에 새 회차를 가져오고 사이트를 다시 배포해요.
- 사이트의 "이번 주" 탭 번호도 새 회차 기준으로 자동으로 바뀌어요.
- 결과는 `Actions` 탭에서 확인할 수 있어요. 직접 돌리려면 `Actions` → `로또 데이터 갱신 및 배포` → `Run workflow`.

## 자동 갱신이 안 될 때 (PC/맥에서 직접 갱신)

동행복권이 해외 서버(GitHub) 접속을 막으면 자동 갱신이 실패할 수 있어요. 그래도 사이트는 기존 데이터로 계속 떠 있어요.

1. nodejs.org 에서 **LTS** 버전 설치 (처음 한 번)
2. 저장소의 `scripts/update-lotto.mjs` 와 `draws.json` 을 내려받아 같은 구조로 둔 뒤 터미널에서:
   - 맥: `node scripts/update-lotto.mjs draws.json`
   - 윈도우: `node scripts\update-lotto.mjs draws.json`
   `+1회 추가 (최신 1248회)` 같은 문구가 나오면 성공
3. 저장소 → `Add file` → `Upload files` → 새 `draws.json` 끌어다 놓기 → `Commit changes` (커밋하면 자동으로 다시 배포돼요)

## 내 컴퓨터에서 미리 보기

`index.html` 을 더블클릭하면 브라우저에서 바로 열려요. (인터넷 연결 필요, 파일 안에 든 데이터로 동작)
