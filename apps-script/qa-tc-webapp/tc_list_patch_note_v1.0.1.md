# tc_list_patch note v 1.0.1

## 수정내용
- 수정 내용 1: TC_Improvement_Backlog 1행/2행 안내를 `자동 생성`, `사람 입력`, `처리 방향 선택`처럼 직관적인 문구로 변경.
- 수정 내용 2: TC_Improvement_Backlog 헤더에 각 컬럼별 역할 설명 메모 추가.
- 수정 내용 3: QA_Dashboard 차트 범례에 `Pass - 통과`, `대기 - TC 보강 필요`처럼 상태 의미를 함께 표시.
- 수정 내용 4: QA_Dashboard 차트 제목에 집계 기준을 함께 표시.

## 검증
- `npm run gas:check` 통과.
- `openapi.json` JSON 파싱 검증 통과.
- Apps Script QA 웹앱 버전 18 배포 완료.
- `formatBugSheets` 실행으로 `Bug_Report`, `TC_Improvement_Backlog`, `Bug_Linked_Sheets`, `QA_Dashboard` 갱신 완료.
- `QA_Dashboard` 갱신 확인: 활성 TC 시트 5개, 전체 TC 89건, 결과 입력 62건, 달성률 69.7%, 차트 4개, 표 4개 생성.
- `validateBugLinks` 확인: 오류 0건, 경고 24건.
