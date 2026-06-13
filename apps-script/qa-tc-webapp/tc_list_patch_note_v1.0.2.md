# tc_list_patch note v 1.0.2

## 수정내용
- 수정 내용 1: TC_Improvement_Backlog에서 자동화/이력용 컬럼을 기본 숨김 처리.
- 수정 내용 2: 숨김 컬럼은 `Backlog ID`, `입력 TC ID`, `등록일`, `수정일`.
- 수정 내용 3: 사람이 판단해야 하는 `Bug ID`, `버그 제목`, `대상 시트명`, `보강 사유`, `추천 TC 제목`, `확정 시트명`, `확정 TC ID`, `처리 상태`, `비고`는 계속 표시.
- 수정 내용 4: GPT 안내 문서에 보강 백로그 기본 숨김 컬럼 정책 추가.

## 검증
- `npm run gas:check` 통과.
- `openapi.json` JSON 파싱 검증 통과.
- Apps Script QA 웹앱 버전 19 배포 완료.
- `formatBugSheets` 실행으로 `TC_Improvement_Backlog` 기본 숨김 컬럼 적용 완료.
- `QA_Dashboard` 갱신 확인: 활성 TC 시트 5개, 전체 TC 89건, 결과 입력 62건, 달성률 69.7%, 차트 4개, 표 4개 생성.
- `validateBugLinks` 확인: 오류 0건, 경고 24건.
