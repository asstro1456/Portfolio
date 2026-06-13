# tc_list_patch note v 1.0.5

## 수정내용
- 수정 내용 1: 빌드 버전 허용값을 `0.0.1`, `1.0.0`에서 `0.1.0`, `1.0.0`으로 정정.
- 수정 내용 2: `Bug_Report`의 `빌드 버전`과 `재확인 빌드 버전` 드롭다운 모두 동일하게 `0.1.0`, `1.0.0` 사용.
- 수정 내용 3: 기존 `재확인 빌드 버전`에 입력되어 있던 `0.1.0`은 정상 허용값으로 처리.
- 수정 내용 4: GPT/OpenAPI 안내의 빌드 버전 허용값도 `0.1.0`, `1.0.0`으로 정정.

## 검증
- `npm run gas:check` 통과.
- `openapi.json` JSON 파싱 검증 통과.
- Apps Script QA 웹앱 버전 23 배포 완료.
- `formatBugSheets` 실행으로 실제 `Bug_Report` 빌드 드롭다운 적용 완료.
- `getAutomationSchema` 확인: `bugBuildVersion` enum은 `0.1.0`, `1.0.0`.
- `validateBugLinks` 확인: 오류 0건, 경고 26건.
- `UNLISTED_BUG_RECHECK_BUILD_VERSION` 경고 0건 확인.
