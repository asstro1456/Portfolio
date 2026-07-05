# Apps Script 배포 흐름

## 구성

| 폴더 | 역할 |
| --- | --- |
| `career-hub-core` | 시트 생성, 적재, 중복 제거, 차트, 게임경험 처리 공통 라이브러리 |
| `career-hub-webapp` | Script Properties를 읽고 HTTP/편집기 실행을 코어로 전달하는 웹앱 |
| `qa-tc-webapp` | QA TC 시트 전용 HTTP/편집기 실행 웹앱 |

## 최초 연결

1. Google 계정에서 Apps Script API를 활성화한다.
2. `npm run gas:login`으로 인증한다.
3. 코어 라이브러리와 기존 웹앱 각각에 `.clasp.json`을 만들고 해당 Script ID를 설정한다.
4. `.gas-release.example.json`을 `.gas-release.local.json`으로 복사해 라이브러리 ID, 현재 운영 Deployment ID, 현재 `/exec` URL을 입력한다.
5. 웹앱 프로젝트의 Script Properties에 아래 값을 등록한다.

| 속성 | 값 |
| --- | --- |
| `TARGET_SPREADSHEET_ID` | 대상 Google Sheet ID |
| `WEBHOOK_SECRET` | 새로 발급한 요청 인증값 |
| `REFERENCE_SOURCE_IDS_JSON` | `experience`, `playHistory`, `careerLog` 원본 Sheet ID를 가진 JSON 문자열 |

기존 소스에 포함됐던 인증값은 재사용하지 않는다. 새 인증값을 웹앱 속성과 호출 자동화에 함께 반영한다.

현재 `취업 자료 수집` 웹앱의 초기 설정값은 다음과 같다. `WEBHOOK_SECRET`만 새 값으로 직접 등록한다.

```text
TARGET_SPREADSHEET_ID=1FJ-q13akZExmQUzZ3Tj8vHLoAWz7WxkdUjpBB1iVWUA
REFERENCE_SOURCE_IDS_JSON={"experience":"13I_5bjDPsswLKJ73cBgkfl-5SUxQA7JbRharzgpVsqI","playHistory":"1amUA_Llw3xH17OqYJfct2PmLmm44ZvyQf8-7DJhd2YI","careerLog":"1496qIzM2XKzLTc3qbY-7-5ZsNUgG2Hbebkqwjq7MG6U"}
```

## 명령

| 명령 | 동작 |
| --- | --- |
| `npm run gas:check` | 로컬 소스 문법 및 민감 설정 포함 여부 확인 |
| `npm run gas:push:core` | 코어 라이브러리 업로드만 수행 |
| `npm run gas:push:hub` | 웹앱 업로드만 수행 |
| `npm run gas:push:qa` | QA TC 웹앱 업로드만 수행 |
| `npm run gas:release:hub` | 웹앱 버전을 생성하고 임시 사전 검증 후 기존 Deployment를 갱신 |
| `npm run gas:release:qa` | QA TC 웹앱 버전을 생성하고 임시 사전 검증 후 기존 Deployment를 갱신 |
| `npm run gas:release:all` | 코어 버전 생성, 웹앱 참조 버전 갱신, 임시 사전 검증 후 기존 Deployment를 갱신 |
| `npm run gas:verify:hub` | 기존 URL에서 상태, 인증 차단, 읽기 전용 검증 요청 확인 |
| `npm run gas:verify:qa` | QA TC URL에서 상태, 인증 차단, 읽기 전용 검증 요청 확인 |
| `npm run gas:setup:qa` | QA TC URL에 `setupTcSheet`를 호출해 헤더, 상태 드롭다운, Hub 집계를 적용 |
| `npm run gamejob:weekly:dry-run` | GameJob 주간 payload를 백업만 하고 Google Sheets에는 전송하지 않음 |
| `npm run gamejob:weekly` | `GAMEJOB_AUTOMATION_SECRET` 환경 변수로 인증해 GameJob 주간 payload를 웹앱에 전송 |
| `npm run gamejob:backup-report` | 자동화 백업 JSON만 읽어 최신 주차 수동입력경력 이월 리포트를 출력 |

운영 릴리스와 검증을 실행할 때는 현재 셸 세션에 `CAREER_HUB_WEBHOOK_SECRET` 환경 변수를 설정한다. 이 값은 파일에 저장하지 않는다.
릴리스는 새 버전을 임시 URL에서 읽기 전용으로 검증한 뒤 운영 URL에 반영하며, 운영 확인에 실패하면 직전 버전으로 되돌린다.
GameJob 주간 수집 전송을 실행할 때는 현재 셸 세션에 `GAMEJOB_AUTOMATION_SECRET` 환경 변수를 설정한다. 드라이런은 이 값을 요구하지 않는다.
GameJob 백업은 기본적으로 `GAMEJOB_OUT_DIR` 또는 `C:\Users\User\.codex\automations\automation`의 `gamejob_payload_YYYY-MM-DD.json`, `gamejob_post_result_YYYY-MM-DD.json`을 사용한다. `gamejob:backup-report -- --date YYYY-MM-DD --write`로 `tmp/gamejob_backup_report_YYYY-MM-DD.json` 리포트를 만들 수 있다. 새 웹앱 응답은 `manualExperience.unmatchedManualRows`를 포함하므로, 다음 실행부터 시트 전체를 읽지 않고도 이월 실패 행을 백업 JSON에서 확인한다.

## 추가 누적 탭

| 탭 | 용도 |
| --- | --- |
| `관심회사모니터` | 프로젝트문 등 목표 회사의 채용 공고, 마감 상태, 지원 관점 메모 누적 |
| `업계자료` | 목표 회사 관련 기사와 지원 준비에 활용할 분석 자료 누적 |

`공고상세`는 목록 표기의 `경력구간` 외에 `표시경력`, `본문요구경력`, `수동입력경력`, `경력판정근거`를 추가로 기록한다. 목록에서 `경력무관`으로 표시되어도 상세 본문에 최소 연차가 확인되면 해당 연차 기준으로 분류한다. 자격요건이 이미지이거나 외부 지원 페이지라 자동 판정할 수 없는 경우에는 `수동입력경력`이 `확인 전`으로 시작하며, 드롭다운에서 확인 결과를 선택한다. `공고상세` 헤더 필터로 선택값별 정렬과 필터링을 할 수 있다.

프로젝트문 모니터 payload는 주간요약을 만들지 않고 다음 배열만 전송할 수 있다.

```json
{
  "companyMonitor": [],
  "industryMaterials": []
}
```

인증된 `{"action":"setup","secret":"..."}` 요청은 데이터 행을 추가하지 않고 필요한 탭과 서식만 만든다.

동일 기준일의 공고 결과를 새 분류 기준으로 다시 수집할 때는 `replaceCollectedRowsForDate: true`를 전송한다. 이 옵션은 해당 기준일의 `공고상세`와 `제외사례`만 삭제한 뒤 신규 결과로 교체한다.
