# tc_list_patch note v 1.0.6

## 수정내용
- 수정 내용 1: GPT Action 인증 방식을 query parameter `secret`에서 JSON body field `secret` 방식으로 변경.
- 수정 내용 2: `openapi.json`에서 query API key security 설정 제거.
- 수정 내용 3: `QaTcRequest`의 필수 필드에 `secret` 추가.
- 수정 내용 4: `gpt-setup.md`를 body secret 방식 기준으로 재정리.
- 수정 내용 5: GPT 요청 예시를 모두 `{"secret":"<qaWebhookSecret>"}` 포함 형태로 수정.

## 검증
- `openapi.json` JSON 파싱 검증 통과.
- `QaTcRequest.required` 확인: `action`, `secret`.
- query API key `securitySchemes` 제거 확인.
- `npm run gas:check` 통과.
- Apps Script 코드는 이미 `payload.secret`을 지원하므로 코드 배포는 불필요.
