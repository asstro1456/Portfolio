# tc_list_patch note v 1.0.4

## 수정내용
- 수정 내용 1: `Bug_Report`에 `스마트폰 기종` 컬럼 추가.
- 수정 내용 2: `스마트폰 기종`은 `빌드 버전` 바로 뒤에 배치.
- 수정 내용 3: `스마트폰 기종`은 자유 입력 선택값으로 처리하고 기존 데이터는 자동 덮어쓰지 않음.
- 수정 내용 4: `createBugReport` API에서 `phoneModel`, `deviceModel`, `스마트폰 기종` 입력을 지원.
- 수정 내용 5: GPT 안내 문서와 예시 요청에 `phoneModel` 사용법 추가.

## 검증
- `npm run gas:check` 통과.
- `openapi.json` JSON 파싱 검증 통과.
- Apps Script QA 웹앱 버전 22 배포 완료.
- `formatBugSheets` 실행으로 `Bug_Report`의 `스마트폰 기종` 컬럼 적용 완료.
- `Bug_Report` 헤더 확인: `빌드 버전`, `스마트폰 기종`, `재확인 빌드 버전`, `버전 확인 결과`, `비고` 순서 적용.
- `validateBugLinks` 확인: 오류 0건, 경고 36건.
- 빌드 버전 허용값 정정 전에는 `0.1.0`을 목록 외 값으로 경고 처리했으나, 실제 허용 버전은 `0.1.0`, `1.0.0`으로 정정 필요.
