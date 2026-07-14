# 2026-06-12 Portfolio Coach Figma Handoff

## Date

- 2026-06-12
- Timezone: Asia/Seoul

## Topic

- Portfolio Coach Figma 수정 검토 및 GPT 협업용 작업 지시서 관리
- 다음 채팅에서 이어받을 핵심 대상: `Desktop / 추천 공고 - Revision`

## User Decisions

- Figma 작업은 실제 사이트 코드나 로직을 건드리지 않고 UI 레이아웃/인터랙션 설계 중심으로 진행한다.
- GPT/Figma 작업자와 협업할 때는 작업 지시서나 검토 내용을 Markdown 문서로 만들어 GitHub 저장소 `asstro1456/codex-gpt`에 업로드한다.
- 작업 지시서를 업로드할 때는 GPT에게 전달할 채팅 문구도 별도 Markdown 파일로 같이 만든다.
- 추천 공고 카드에 들어갈 내용, 데이터 구조, 기능 기준은 `asstro1456/Portfolio-Coach` 원본 파일 기준이다.
- 첨부된 추천 공고 카드 이미지는 전체 구조 기준이 아니라 카드 내부 정보 배치와 시각 표현 참고다.
- `YuriringClass` 이미지는 전체 구조 복제 기준이 아니라 클라이언트가 원하는 사이트 완성도 기준이다.
- 추천 공고 카드에 저장/핀/즐겨찾기 버튼은 추가하지 않는다.
- `n순위 지정`은 조작 가능한 버튼이 아니라 pinned 상태 배지로만 표현한다.
- pinned가 아닌 최상위 추천 카드에는 원본 기준으로 `Best Match` 상태가 필요하다.
- Mobile / Tablet Revision 프레임은 새로 만들지 않는다.
- 컨텍스트 압축, 대화 이전, 요약 보관 전에는 Markdown 파일로 먼저 보관한다.

## Change Rules Or Constraints

- 기준 저장소: `asstro1456/Portfolio-Coach`
- GPT 협업 문서 저장소: `asstro1456/codex-gpt`
- 대상 Figma 파일: `https://www.figma.com/design/fQDiHR0wWy3v2GFnHpWAu7/`
- 주요 대상 프레임:
  - `Desktop / 추천 공고 - Revision` (`70:1613`)
  - 이전 검토 대상: `Desktop / 서류 피드백 - Revision`, `Desktop / 포트폴리오 - Revision`, `Desktop / 정보 입력 - Revision`
- 원본 기능 구조 확인 파일:
  - `src/App.jsx`
  - `src/components/WorkspaceContent.jsx`
  - `src/components/JobsWorkspace.jsx`
- Figma 수정자는 원본 구조를 먼저 확인한 뒤 작업해야 한다.
- 코드에 없는 기능을 중심 UI처럼 추가하지 않는다.
- 기존 1120px 본문 폭과 Portfolio Coach의 밝은 정보형 톤을 유지한다.
- 준비된 컴포넌트가 있으면 우선 사용하고, 새 컴포넌트가 필요하면 먼저 질문한다.

## Collected Links

- Figma: `https://www.figma.com/design/fQDiHR0wWy3v2GFnHpWAu7/`
- GPT 협업 repo: `https://github.com/asstro1456/codex-gpt`
- 원본 repo: `https://github.com/asstro1456/Portfolio-Coach`
- 참고 사이트: `https://portfolio-coach-z0tc.onrender.com/`

## Tables Or Structured Facts

| 항목 | 현재 판단 |
|---|---|
| 추천 공고 카드 구조 | 이전 2열 카드에서 1열 리스트형 카드로 개선됨 |
| 카드 내부 정보 | 회사명, 공고명, 경력/직군, 태그, AI MATCH REASON, 강점/주의, 점수 breakdown, 직접 링크, CTA 반영 |
| 저장/핀/즐겨찾기 | 추가되지 않음. 현재 기준 통과 |
| 우선순위 표시 | `n순위 지정`이 상태 배지처럼 보임. pinned 조건 필요 |
| Best Match | 원본에는 조건부로 있음. Figma에는 아직 명확하지 않음 |
| 상단 매칭 실행 흐름 | 원본 `JobsWorkspace.jsx` 대비 누락됨 |
| 검색/필터 위치 | 현재는 별도 박스. 원본은 결과 섹션 내부 흐름 |
| 상태 예시 | 매칭 전/중/빈 결과/실패 상태 분리 필요 |
| Mobile/Tablet Revision | 새로 만들지 않는 기준 유지 |

## Files Changed Or Inspected

### GitHub에 업로드된 주요 문서

- `figma/2026-06-11_portfolio-coach_figma_review.md`
- `figma/2026-06-11_gpt_chat_portfolio-coach_figma_review.md`
- `figma/2026-06-11_portfolio-coach_figma_followup_instruction.md`
- `figma/2026-06-11_gpt_chat_portfolio-coach_figma_followup.md`
- `figma/2026-06-11_portfolio-coach_figma_overlap_readability_check.md`
- `figma/2026-06-11_portfolio-coach_followup_tabs_codex_answers.md`
- `figma/2026-06-11_gpt_chat_portfolio-coach_followup_tabs_answers.md`
- `figma/2026-06-11_portfolio-coach_three_revision_followup_instruction.md`
- `figma/2026-06-12_portfolio-coach_recommended_jobs_rebuild_instruction.md`
- `figma/2026-06-12_gpt_chat_portfolio-coach_recommended_jobs_rebuild.md`
- `figma/2026-06-12_portfolio-coach_recommended_jobs_current_review.md`
- `figma/2026-06-12_gpt_chat_portfolio-coach_recommended_jobs_current_review.md`

### 최근 업로드 커밋

- `af924b6a83dfa0e0cb7144255566621762c46053`
  - `figma/2026-06-12_portfolio-coach_recommended_jobs_current_review.md`
- `69b60db75fe8ea2a4efa0584af8abb6a89453220`
  - `figma/2026-06-12_gpt_chat_portfolio-coach_recommended_jobs_current_review.md`
- `cdf33e6a8881aeb3b24b3747cdf5e236bb41c4c7`
  - 추천 공고 명세서에 클라이언트 기대 완성도 기준 추가
- `717be35e112d92c36baf7410bf06c309bb0c6e56`
  - GPT 전달문에 클라이언트 기대 완성도 기준 추가

### Figma 검토에서 확인한 현재 레이어

- `Desktop / 추천 공고 - Revision` (`70:1613`)
- `Content / 추천 공고`
- `Filter / Sort Controls`
- `Overline / AI 추천 공고 목록`
- `Title / AI 추천 공고 목록`
- `Recommended Job Card / 2`
- `Recommended Job Card / 1`
- `Recommended Job Card / 3`
- 각 카드 내부:
  - `Company Pill`
  - `Priority Badge`
  - `Job Title`
  - `Meta`
  - `Keyword Tag`
  - `Total Score`
  - `AI Match Reason Box`
  - `Score Breakdown`
  - `Direct Link Field`
  - `Primary CTA / 공고 바로가기`
  - `Secondary CTA / 회사 정보 보기`

### 원본 코드에서 확인한 구조

- `src/App.jsx`
  - `activeTab === 'jobs'`
  - `jobsWorkspaceProps`
  - `matchedJobs`, `jobMatchState`, `scoreFilter`, `visibleJobs`
  - `pinnedSlots`
- `src/components/WorkspaceContent.jsx`
  - `activeTab === 'jobs'`일 때 `JobsWorkspace` 렌더링
- `src/components/JobsWorkspace.jsx`
  - KPI grid
  - `coach-jobs-overview-grid`
  - 개인 매칭 설명 영역
  - 프로필 스냅샷
  - `매칭하기` / `다시 매칭하기`
  - 최신 배치 메타데이터
  - `coach-jobs-results-shell`
  - 검색/점수 필터
  - 상태별 화면: 매칭 전, 매칭 중, 빈 결과, 결과 있음
  - 추천 카드: `Best Match`, pinned 배지, AI Match Reason, matchDetail, 직접 링크, CTA

## Validation Results

- Figma 최신 `Desktop / 추천 공고 - Revision` 스크린샷 확인 완료.
- 현재 추천 공고 카드 자체는 이전보다 훨씬 개선됨.
- 원본 `JobsWorkspace.jsx`와 비교해 상단 매칭 실행 흐름이 빠진 점을 확인함.
- GitHub 문서 업로드 완료:
  - 리뷰 문서 커밋: `af924b6a83dfa0e0cb7144255566621762c46053`
  - GPT 전달문 커밋: `69b60db75fe8ea2a4efa0584af8abb6a89453220`
- 실제 Figma 수정은 Codex가 직접 하지 않았고, GPT/Figma 작업자에게 전달할 검토 문서와 지시 문구를 업로드한 상태.

## Remaining Risks

- Figma 작업자가 추천 공고 카드만 보고 원본 `JobsWorkspace.jsx`의 상단 매칭 실행 흐름을 누락할 수 있다.
- 검색/필터가 결과 섹션 외부에 남으면 원본 구조와 어긋날 수 있다.
- `n순위 지정` 배지가 모든 카드에 고정되면 pinned 조건과 충돌할 수 있다.
- 매칭 전/중/빈 결과/실패 상태가 없으면 실제 서비스 플로우 검토가 어려워진다.
- `YuriringClass` 이미지를 팔레트나 전체 포털 구조로 오해해 복제할 위험이 있다. 해당 이미지는 완성도 기준일 뿐이다.

## Next Steps

1. 다음 채팅에서 `asstro1456/codex-gpt`의 최신 문서 두 개를 기준으로 시작한다.
   - `figma/2026-06-12_portfolio-coach_recommended_jobs_current_review.md`
   - `figma/2026-06-12_gpt_chat_portfolio-coach_recommended_jobs_current_review.md`
2. GPT/Figma 작업자에게 최신 GPT 전달문을 전달한다.
3. Figma 수정 후 다시 `Desktop / 추천 공고 - Revision`을 검토한다.
4. 검토 기준:
   - 원본 `JobsWorkspace.jsx`의 상단 매칭 실행 흐름 복구 여부
   - 검색/필터가 결과 섹션 내부로 정리되었는지
   - 상태 예시가 분리되었는지
   - 추천 공고 카드 완성도가 유지되었는지
   - 저장/핀/즐겨찾기 버튼이 추가되지 않았는지
   - `Best Match`와 pinned 배지가 조건별로 구분되는지
5. 검토 결과는 다시 Markdown 문서로 작성해 `asstro1456/codex-gpt`에 업로드한다.
