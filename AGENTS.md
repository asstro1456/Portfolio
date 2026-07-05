# AGENTS.md

이 문서는 `C:\Users\User\Documents\Portfolio` 혼합 작업공간의 프로젝트 전용 지침이다. 공통 행동·안전·검증 규칙은 전역 `C:\Users\User\.codex\AGENTS.md`를 따른다.

## 작업 유형 분기

요청과 관련 경로를 먼저 확인해 아래 유형을 판별하고, 다른 유형의 파일은 건드리지 않는다.

- GitHub Pages 포트폴리오: `index.html`, `portfolio.html`, `css/`, `js/`, `assets/`
- Google Apps Script·Sheets 자동화: `apps-script/`, `scripts/apps-script-release.mjs`
- QA·TC·버그 연동: `apps-script/qa-tc-webapp/`, `scripts/qa-tc-webapp-configure.mjs`
- 채용 공고 수집: `scripts/gamejob*.mjs`, Career Hub 관련 Apps Script
- Figma/GitHub 협업 문서: `Portfolio-Coach/`, `chat_summaries/` 및 외부 협업 문서

혼합 요청은 유형별 영향과 검증 결과를 분리해서 보고한다.

## 참고 범위

- 항상 이 파일을 먼저 확인한다.
- 포트폴리오 웹 작업은 `PORTFOLIO_WORK_RULES.md`와 `README.md`를 추가 확인한다.
- 대화 이력이 필요하면 `chat_summaries/`에서 최신 관련 요약 1개를 먼저 읽고, 부족할 때만 추가 요약을 확인한다.
- `tmp/`, `output/`, 외부 복사 프로젝트, 대량 생성 파일은 요청과 직접 관련될 때만 확인한다.
- Figma, GitHub, Google Drive, Browser, Playwright는 관련 요청이나 검증 필요성이 있을 때만 사용한다.

## GitHub Pages 웹

- 정적 사이트 기준으로 DOM, 이벤트 바인딩, CSS 영향 범위, 반응형, 접근성, 자산·상대 경로를 우선 점검한다.
- Pages 배포 방식은 먼저 확인하고, 요청 없이 Pages 설정, workflow, CNAME, `_config.yml`, 배포 방식을 바꾸지 않는다.
- 전역 스타일과 전체 마크업 구조를 광범위하게 바꾸지 않는다.
- UI 변경 후 가능한 범위에서 데스크톱·태블릿·모바일 폭, 콘솔 오류, 깨진 링크·이미지, 클릭 동작을 확인한다.

## Apps Script·Sheets·QA 자동화

- 기존 시트 데이터와 사용자 입력을 보존하고, 스키마·탭·컬럼 변경은 기존 연동과의 호환성을 점검한다.
- 비밀키와 운영 설정은 코드에 넣지 않고 Script Properties 또는 기존 로컬 비밀 설정 방식을 유지한다.
- 코드 업로드와 운영 배포를 분리한다. 운영 배포, Deployment ID 변경, 기존 `/exec` URL 변경은 사용자 승인 후 수행한다.
- 읽기 전용 점검과 최소 범위 검증을 먼저 하고, 자동화 실행이 실제 데이터를 변경하는지 구분해서 보고한다.

## Figma·협업 문서

- 실제 원본 코드와 데이터 구조를 기준으로 검토하고, 코드에 없는 기능을 중심 UI로 임의 추가하지 않는다.
- Figma 수정과 코드 수정을 별도 범위로 취급한다.
- 특정 프레임 ID, 커밋 해시, 일회성 다음 작업은 `AGENTS.md`가 아니라 `chat_summaries/`에 기록한다.

## 변경·보관 원칙

- 작업 전후 `git status --short`로 범위를 확인하고, 사용자가 커밋과 푸시를 직접 한다는 현재 원칙을 유지한다.
- 기존 미커밋·미추적 파일을 보존한다. 현재 추적되지 않은 `scripts/gamejob-weekly-collect.mjs`는 관련 요청이 없으면 수정하거나 포함하지 않는다.
- 지원 회사, 카드 이름, 버전, 색상, 레이아웃 같은 가변 제품 기준은 `PORTFOLIO_WORK_RULES.md`에 둔다.
- 압축·종료·인수인계·요약 보관 전에는 `preserve-chat-summary` 스킬을 사용해 전역 및 프로젝트 `chat_summaries/`에 Markdown 요약을 저장한다.

## 출력 형식

실제 변경 작업 결과는 다음 순서로 짧게 보고한다. 단순 질의와 설명에는 이 형식을 강제하지 않는다.

1. 요약
2. 변경 파일
3. 핵심 변경점
4. 검증 결과
5. 남은 리스크 또는 추가 확인 사항
