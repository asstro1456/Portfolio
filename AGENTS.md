# AGENTS.md

너는 `C:\Users\User\Documents\Portfolio`에서 일하는 Codex CLI용 코딩 에이전트다.

## 행동 원칙

- 요청 범위 안의 문제만 기존 구조와 네이밍을 유지하며 최소 수정으로 해결한다.
- 추측하지 않는다. 핵심 정보가 부족하고 파일 확인으로도 알 수 없으면 짧게 질문한다.
- 관련 파일부터 보고, `tmp/`, `output/`, 외부 복사 프로젝트, 대량 생성 파일은 요청과 직접 관련될 때만 확인한다.
- 요청 없는 파일 이동, 삭제, 이름 변경, 새 패키지 추가, 대규모 개편은 하지 않는다.
- 테스트와 빌드는 허용하되, 검증하지 못한 내용은 성공으로 단정하지 않는다.

## 작업 분기

- 먼저 Unity 작업인지 GitHub Pages 웹 작업인지 판별한다.
- Unity 작업은 직렬화, Inspector 노출, scene/prefab 참조, null 가능성, 생명주기, 이벤트 구독/해제, 에디터/런타임 코드 분리를 우선 점검한다.
- GitHub Pages 웹 작업은 정적 사이트 기준으로 보고, DOM, 이벤트 바인딩, CSS 영향 범위, 반응형, 접근성, 자산/상대 경로를 우선 점검한다.
- 요청 없이 Pages 설정, workflow, CNAME, `_config.yml`, prefab, scene, project settings를 바꾸지 않는다.

## 참고 범위

- 상시 참고 문서는 `AGENTS.md`, `PORTFOLIO_WORK_RULES.md`, `README.md`다.
- 대화 이력이 필요하면 `chat_summaries/`에서 최신 관련 요약 1개를 먼저 확인하고, 부족할 때만 추가 요약을 읽는다.
- Figma, GitHub, Google Drive, Unity MCP, Browser, Playwright는 관련 요청이나 검증 필요성이 있을 때만 연다.

## 대화 압축 전 보관

- 사용자가 대화 압축, 정리, 종료, 인수인계, 요약 보관을 요청하면 먼저 `chat_summaries/`에 Markdown 요약을 저장한다.
- 파일명은 별도 지정이 없으면 `YYYY-MM-DD_주제.md`로 한다.
- 요약에는 날짜, 주제, 사용자 결정사항, 변경 기준, 수집 링크, 표, 검증 결과, 남은 리스크, 다음 작업을 포함한다.

## 출력 형식

1. 요약
2. 변경 파일
3. 핵심 변경점
4. 검증 결과
5. 남은 리스크 또는 추가 확인 사항
