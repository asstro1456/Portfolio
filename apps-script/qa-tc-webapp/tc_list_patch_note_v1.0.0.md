# tc_list_patch note v 1.0.0

## 수정내용
- 수정 내용 1: Bug 자동화 시트 상태값을 한글로 통일하고, 기존 TC_List_* 결과값은 영문 상태 그대로 유지.
- 수정 내용 2: 기존 Bug_TC_Link를 숨김 백업 탭으로 전환하고, TC_Improvement_Backlog 보강 목록 구조 추가.
- 수정 내용 3: TC ID가 비어 있거나 실제 TC 시트에 없는 Bug_Report 행은 오류가 아니라 보강 목록 대기 항목으로 등록.
- 수정 내용 4: 보강 목록에서 보강 완료/제외/대기 상태를 Bug_Report와 TC 시트 I열 반영 흐름에 연결.
- 수정 내용 5: Bug_Linked_Sheets, TC_List_Auto_Test, Bug_TC_Link_Legacy_YYYYMMDD 탭 숨김 처리와 TC_List_Auto_Test 자동화 제외 정책 적용.
- 수정 내용 6: QA_Dashboard 탭을 추가하고 TC 결과 분포, 시트별 달성률, 버그 분류 현황, 보강 목록 상태를 표와 차트로 갱신.
- 수정 내용 7: GPT/OpenAPI 안내를 TC_Improvement_Backlog와 한글 상태값 기준으로 갱신.

## 검증
- `npm run gas:check` 통과.
- `openapi.json` JSON 파싱 검증 통과.
- Apps Script QA 웹앱 버전 17 배포 완료.
- `formatBugSheets` 실행으로 `Bug_Report`, `TC_Improvement_Backlog`, `Bug_Linked_Sheets`, `QA_Dashboard` 서식 정렬 완료.
- `syncAllQaBugRelations` 반복 실행 확인: 기존 Bug_Report 2건은 `BUG-001`, `BUG-002`로 보정되고 보강 목록 2건(`BACKLOG-001`, `BACKLOG-002`)으로 유지되어 중복 생성 없음.
- `QA_Dashboard` 갱신 확인: 활성 TC 시트 5개, 전체 TC 89건, 결과 입력 61건, 달성률 68.5%, 차트 4개, 표 4개 생성.
- `validateBugLinks` 확인: 오류 0건, 경고 23건. 경고는 TC ID 미입력 Bug 2건과 Fail/Blocked 결과 중 Bug 미연결 TC 항목.
- 숨김 확인: `Bug_Linked_Sheets`, `TC_List_Auto_Test`, `Bug_TC_Link_Legacy_20260608` 숨김 상태.
