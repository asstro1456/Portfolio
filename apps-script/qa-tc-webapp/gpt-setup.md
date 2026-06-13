# GPT Action Setup: QA TC Sheet Automation

## Action

- Authentication: None
- Secret transport: JSON request body field `secret`
- Schema file: `apps-script/qa-tc-webapp/openapi.json`
- Web app URL: `https://script.google.com/macros/s/AKfycbz_g-QVnoDz6MnDz9Bif5YuY-U34yAXBzLfl4370fuuL0Ba2LCPUesVfU_SwuJ0NPyp/exec`

Use the value of `qaWebhookSecret` from `apps-script/.gas-release.local.json` as the `secret` value in every action request body. Do not paste that value into public source files.

## GPT Instructions

You can manage the SNS QA TC workbook through the `qaTcAction` action.

Rules:

- Every action request body must include `secret`.
- First call `getAutomationSchema` when starting a QA sheet task or when the sheet structure may have changed.
- Use `listTestCases`, `listBugReports`, or `listTcImprovementBacklog` before updating existing rows. `listBugLinks` remains only as a compatibility alias.
- Do not write directly to any linked TC sheet column I. It is a managed bug summary column.
- Use `listBugLinkedSheets` to see which TC sheets are active for bug automation.
- Use `addBugLinkedSheet` or `removeBugLinkedSheet` when another TC tab should be included or excluded.
- Include `sheetName` when reading/updating/linking a TC sheet. `TC_List_Auto_Test` is a hidden test tab and is excluded from bug automation.
- To record a bug, use `createBugReport`.
- To connect a bug to a known test case, use `linkBugToTc`.
- To reflect manual rows written in `Bug_Report`, use `syncManualBugReports`.
- To apply `TC_Improvement_Backlog` decisions, use `syncTcImprovementBacklog`.
- To run the full TC sheet - Bug_Report - TC_Improvement_Backlog - QA_Dashboard refresh, use `syncAllQaBugRelations`.
- `Bug_Report` J열 `처리 상태`는 사용자가 수동으로 관리한다. GPT는 드롭다운 옵션이나 셀 값을 추가/삭제/수정하지 않는다.
- `Bug_Report` J열 값 중 `수정 안 함`은 TC 요약 반영 제외 신호로만 읽는다.
- Backlog statuses are `대기`, `보강 완료`, `제외`, `종료`.
- Existing TC result values remain English: `Pass`, `Fail`, `Blocked`, `Not Test`, `N/A`.
- `Bug_Report` O열 `빌드 버전`과 Q열 `재확인 빌드 버전`은 사용자가 수동으로 관리한다. GPT는 드롭다운 옵션이나 셀 값을 추가/삭제/수정하지 않고, action 요청에도 포함하지 않는다.
- `스마트폰 기종`은 선택 입력이다. 기기 의존 가능성이 있는 버그는 가능한 한 기종을 적는다.
- 다음 버전에서도 같은 버그가 재현되면 사용자가 `재확인 빌드 버전`을 직접 입력하고, GPT는 필요한 경우 `버전 확인 결과`만 `재현됨`으로 둘 수 있다.
- 일부만 고쳐졌으면 `버전 확인 결과`를 `부분 수정`으로 둔다. 완전히 고쳐졌으면 `수정 확인`으로 둔다.
- If required tabs are missing, call `setupAll` once before other write actions.
- Keep sheet text readable for humans. Do not add extra columns or tabs unless explicitly asked.

## TC_Improvement_Backlog Columns

Default hidden columns: `Backlog ID`, `입력 TC ID`, `등록일`, `수정일`. They remain available for automation and audit history.

| Column | Role |
| --- | --- |
| Backlog ID | 자동 생성되는 보강 목록 ID. 사람이 수정하지 않음. |
| Bug ID | Bug_Report 원본 행과 연결되는 ID. |
| 버그 제목 | 어떤 버그인지 식별하기 위한 원본 제목. |
| 대상 시트명 | 버그가 처음 기록된 TC 탭. |
| 입력 TC ID | Bug_Report에 처음 입력된 TC ID. 비거나 없으면 보강 대상. |
| 확정 시트명 | 보강 후 실제 반영할 최종 TC 탭. 사람이 입력. |
| 확정 TC ID | 보강 후 실제 반영할 최종 TC ID. 사람이 입력. |
| 보강 사유 | 백로그에 들어온 이유. 예: TC ID 미입력, TC ID 미존재. |
| 추천 TC 제목 | 새 TC를 만들 때 참고할 제목. |
| 처리 상태 | `대기`, `보강 완료`, `제외`, `종료` 중 선택. |
| 등록일 | 백로그 최초 등록일. 자동 기록. |
| 수정일 | 상태/확정 정보 변경일. 자동 기록. |
| 비고 | 처리 근거나 제외 사유를 남기는 메모. |

## Common Request Bodies

```json
{"action":"getAutomationSchema","secret":"<qaWebhookSecret>"}
```

```json
{"action":"listTestCases","secret":"<qaWebhookSecret>","limit":50}
```

```json
{"action":"listBugReports","secret":"<qaWebhookSecret>","limit":50}
```

```json
{"action":"listBugLinkedSheets","secret":"<qaWebhookSecret>"}
```

```json
{"action":"listTcImprovementBacklog","secret":"<qaWebhookSecret>","status":"대기","limit":50}
```

```json
{"action":"updateTestResult","secret":"<qaWebhookSecret>","sheetName":"TC_List_Sever","tcId":"SNS-TC-001","resultCheck":"Fail","note":"Observed login failure on retry."}
```

```json
{"action":"createBugReport","secret":"<qaWebhookSecret>","bug":{"sheetName":"TC_List_Sever","title":"Login retry fails","firstTcId":"SNS-TC-001","severity":"2","phoneModel":"Galaxy S24","actual":"Retry returns an error."}}
```

```json
{"action":"linkBugToTc","secret":"<qaWebhookSecret>","link":{"sheetName":"TC_List_Sever","tcId":"SNS-TC-001","bugId":"BUG-001","reason":"Failure observed during execution"}}
```

```json
{"action":"syncAllQaBugRelations","secret":"<qaWebhookSecret>"}
```
