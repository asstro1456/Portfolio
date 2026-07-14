# Codex 전역 지침과 Portfolio AGENTS 정리

## Date

- 2026-06-21
- Workspace: `C:\Users\User\Documents\Portfolio`
- Branch: `main`

## Topic

- Codex 전역 지침과 `Portfolio/AGENTS.md`의 역할을 분리하고 중복을 제거한다.
- `Portfolio`를 GitHub Pages, Apps Script·Sheets, QA 자동화, 채용 수집, Figma 협업이 공존하는 혼합 작업공간으로 정의한다.

## User decisions

- 전역 지침에는 모든 프로젝트에 공통인 행동·검증·안전 규칙만 둔다.
- 프로젝트 `AGENTS.md`는 혼합 작업공간의 작업 유형 분기와 영역별 제약을 담당한다.
- 포트폴리오 콘텐츠·버전·레이아웃 기준은 `PORTFOLIO_WORK_RULES.md`에 유지한다.
- Unity 상세 규칙은 각 Unity 프로젝트의 `AGENTS.md`로 분리한다.
- 사용자가 커밋과 푸시를 직접 수행한다는 현재 원칙을 유지한다.

## Change rules or constraints

- 기존 구조와 네이밍을 유지하며 문서만 최소 수정한다.
- 실제 코드, 공개 API, 실행 동작, Pages 설정, Apps Script 배포는 변경하지 않는다.
- 기존 미커밋·미추적 파일을 보존한다.
- 단순 질의에는 5개 항목 결과 형식을 강제하지 않는다.

## Collected links

- 없음.

## Tables or structured facts

| 구분 | 담당 내용 |
| --- | --- |
| 전역 `C:\Users\User\.codex\AGENTS.md` | 공통 범위, 수정 권한, 검증, Unity·웹 기본 점검, 대화 보관 |
| 프로젝트 `AGENTS.md` | 혼합 작업공간 분기, 웹·Apps Script·QA·Figma 제약 |
| `PORTFOLIO_WORK_RULES.md` | 포트폴리오 콘텐츠, 버전, 검증, 레이아웃, 자산 기준 |
| `chat_summaries/` | 프레임 ID, 커밋 해시, 일회성 결정과 다음 작업 |

## Files changed or inspected

- 변경 예정/수행: `C:\Users\User\.codex\AGENTS.md`
- 변경: `C:\Users\User\Documents\Portfolio\AGENTS.md`
- 변경: `C:\Users\User\Documents\Portfolio\PORTFOLIO_WORK_RULES.md`
- 추가: `C:\Users\User\Documents\Portfolio\chat_summaries\2026-06-21_codex-agents-지침-정리.md`
- 확인: `README.md`, `package.json`, 기존 대화 요약, 관련 Apps Script 및 수집 스크립트 경로
- 보존: `scripts/gamejob-weekly-collect.mjs`

## Validation results

- 전역 지침 파일 위치가 `C:\Users\User\.codex\AGENTS.md`임을 확인했다.
- 저장소가 웹 외에도 Apps Script·QA·채용 수집 작업을 포함함을 `package.json`과 디렉터리 구조로 확인했다.
- 전역·프로젝트 지침을 UTF-8로 다시 읽고, Git diff와 전역·프로젝트 요약 파일 존재 여부를 확인했다.
- 코드·빌드·브라우저 검증은 문서 전용 변경이라 대상이 아니다.

## Remaining risks

- `scripts/gamejob-weekly-collect.mjs`는 기존 미추적 파일이므로 이번 작업에 포함하지 않는다.

## Next steps

1. 이후 작업에서 전역 공통 규칙과 프로젝트 작업 유형 분기가 의도대로 적용되는지 확인한다.
2. 제품 기준이 바뀌면 `AGENTS.md`가 아니라 `PORTFOLIO_WORK_RULES.md`를 갱신한다.
