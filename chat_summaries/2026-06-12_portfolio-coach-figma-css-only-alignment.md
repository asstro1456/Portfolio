# 2026-06-12 Portfolio Coach Figma CSS-only Alignment Summary

## Date

- 2026-06-12
- Workspace: `C:\Users\User\Documents\Portfolio`
- Active task type: Figma/UI planning and Markdown handoff, not local site code changes

## Topic

- Portfolio Coach Figma work continuity.
- Current focus changed from direct Figma review/upload work to preserving context before compression.
- Latest product task before preservation: plan how to correct the Figma UI so it can map to the original `asstro1456/Portfolio-Coach` code with CSS-level adjustments only.

## User Decisions

- The source of truth is always the original `asstro1456/Portfolio-Coach` code.
- Do not modify actual app code or logic for this Figma planning phase.
- Figma UI must be adjusted to the original code, not the other way around.
- If an item cannot be implemented with CSS-only changes, mark it as out of scope or a separate approval candidate.
- GPT/Figma collaboration instructions must be uploaded as Markdown to `asstro1456/codex-gpt`.
- When a work instruction is uploaded, create a separate GPT chat prompt Markdown file as well.
- `Desktop / 추천 공고 - Revision` remains the main Figma frame for recommended jobs.
- Mobile/Tablet Revision frames should not be newly created.
- Recommended job cards must not add save/pin/favorite buttons.
- `n순위 지정` is a pinned-state badge only, not an interactive control.
- Non-pinned top recommendation needs a `Best Match` state.
- Score Breakdown colors in Figma are currently too strong and should be softened.
- Before context compression, save a Markdown summary to prevent context loss.

## Change Rules Or Constraints

- Scope is documentation and Figma guidance only unless the user explicitly asks for code changes.
- CSS-only alignment means:
  - Keep JSX, rendering conditions, data shape, and app logic unchanged.
  - Use existing class hooks and scoped CSS overrides where possible.
  - Do not assume extra DOM, extra buttons, new cards, or new interactive states.
- Avoid global utility overrides such as `.bg-blue-500 { ... }`.
- Prefer scoped CSS examples, for example:
  - `.coach-jobs-workspace .coach-jobs-results-shell .bg-blue-500 { ... }`
  - `.coach-shell[data-feature="jobs"] .coach-stage { max-width: 1120px; }`
- Figma state examples should map one-to-one to original conditional UI states.
- Representative screens must show a single valid state, not multiple conditional states at the same time.
- Local repository files in `C:\Users\User\Documents\Portfolio` were not intentionally modified for app behavior.

## Collected Links

- Figma file: `https://www.figma.com/design/fQDiHR0wWy3v2GFnHpWAu7/`
- Original source repository: `asstro1456/Portfolio-Coach`
- GPT collaboration document repository: `asstro1456/codex-gpt`
- Main target frame: `Desktop / 추천 공고 - Revision` (`70:1613`)
- Login frame reviewed: `Desktop / Login - Revision` (`113:1030`)
- Auth state examples frame reviewed: `Auth Gate / State Examples` (`113:1146`)
- Jobs state examples frame reviewed: `Jobs Workspace / State Examples` (`111:1457`)

## Tables Or Structured Facts

| Area | Original code basis | Figma/CSS-only implication |
| --- | --- | --- |
| Login | `src/components/AuthGate.jsx` | Keep login, loading, error, config error, and submitting states aligned with existing JSX. Remove or annotate UI not present in code. |
| Jobs | `src/components/JobsWorkspace.jsx` | Keep KPI, overview, matching action, profile snapshot, results shell, filters, state panels, and recommendation cards aligned with original conditional flow. |
| Login note | Not present in original JSX | Remove from Figma or keep only as annotation, not production UI. |
| Login icons | Original uses lucide icons | Figma should show actual icon shapes, not text glyph placeholders such as `↳`. |
| Config error values | Original renders missing env values as one text span | Figma should not imply separate row/card structure unless code change is approved. |
| Matching button | Original renders one button with conditional label | Results state should show only `다시 매칭하기`; pre-match state should show `매칭하기`. |
| Success/error alerts | Original renders them conditionally | Do not show success and failure together in a representative screen. |
| Score Breakdown | Original uses fixed Tailwind color utilities | Soften colors through scoped CSS override or Figma visual tokens, not JSX changes. |
| Width | Original stage max width may differ from Figma 1120px | If 1120px is required, plan a scoped jobs-only CSS override. |

## Files Changed Or Inspected

### Markdown files uploaded to `asstro1456/codex-gpt`

- `figma/2026-06-12_portfolio-coach_recommended_jobs_revision_followup_review.md`
  - Commit: `03ee422208e8e7a5be57ae8fb249cfbb87041137`
- `figma/2026-06-12_gpt_chat_portfolio-coach_recommended_jobs_revision_followup.md`
  - Commit: `5084c14da6b2aea112a4dc0ad53e9dbdbbeae86d`
- `figma/2026-06-12_portfolio-coach_login_screen_instruction.md`
  - Commit: `ed05af6e35ccb8220b2eff20d98289055c258d12`
- `figma/2026-06-12_gpt_chat_portfolio-coach_login_screen.md`
  - Commit: `99cea2632265acf495e958c27a3b7d41083bfa2f`
- `figma/2026-06-12_portfolio-coach_login_jobs_figma_feedback.md`
  - Commit: `e187f0c5f97f2dae816a43b7765be9496d164da4`
- `figma/2026-06-12_portfolio-coach_login_jobs_figma_feedback_addendum.md`
  - Commit: `8a1fa12de317ba1c577efe546ca799ca8fc3ec72`
- `figma/2026-06-12_gpt_chat_portfolio-coach_login_jobs_feedback.md`
  - Commit: `ee6159d285ce619689e87f64ee5ca4d0d8ec80d6`
- `figma/2026-06-12_portfolio-coach_code_connection_compatibility_review.md`
  - Commit: `402ddd822dd35b8259bbc1b40c61efe787fb3ed2`
- `figma/2026-06-12_portfolio-coach_css_only_figma_alignment_plan.md`
  - Commit: `185bdb66eeee24dc889d8417715a19269a667a4d`

### Pending file

- `figma/2026-06-12_gpt_chat_portfolio-coach_css_only_figma_alignment.md`
  - Status: not yet uploaded at the time this summary was saved.
  - Purpose: concise GPT/Figma worker prompt for CSS-only Figma alignment.

### Original files inspected through GitHub connector

- `asstro1456/Portfolio-Coach/src/App.jsx`
- `asstro1456/Portfolio-Coach/src/components/WorkspaceContent.jsx`
- `asstro1456/Portfolio-Coach/src/components/JobsWorkspace.jsx`
- `asstro1456/Portfolio-Coach/src/components/AuthGate.jsx`
- `asstro1456/Portfolio-Coach/src/styles/workspace.css`
- `asstro1456/Portfolio-Coach/src/lib/firebase-client.js`
- `asstro1456/Portfolio-Coach/src/hooks/useFirebaseSession.js`
- `asstro1456/Portfolio-Coach/src/data/skills.js`

### Local file added for context preservation

- `C:\Users\User\Documents\Portfolio\chat_summaries\2026-06-12_portfolio-coach-figma-css-only-alignment.md`

## Validation Results

- Figma frames were inspected with Figma MCP in prior steps.
- Original source files were inspected through the GitHub connector in prior steps.
- The CSS-only alignment plan was uploaded to `asstro1456/codex-gpt`.
- Local app code was not changed or tested because the current scope is Figma planning/documentation.
- Browser/runtime validation was not run for this preservation step.
- At the time this file was written, the global summary copy still needed to be created in `C:\Users\User\.codex\chat_summaries\`.

## Remaining Risks

- The GPT chat prompt paired with the CSS-only alignment plan still needs to be uploaded.
- The current Figma state after any external GPT/Figma edits must be re-reviewed before assuming alignment.
- CSS-only feasibility remains a planning assessment until applied against the actual codebase and visually tested.
- If the Figma design expects DOM changes, those items must be explicitly separated as non-CSS-only or require user approval.
- Global summary save may require filesystem approval because it is outside the workspace write root.

## Next Steps

1. Copy this summary to `C:\Users\User\.codex\chat_summaries\`.
2. Upload `figma/2026-06-12_gpt_chat_portfolio-coach_css_only_figma_alignment.md` to `asstro1456/codex-gpt`.
3. Report both Markdown files and commit hashes to the user.
4. After GPT/Figma worker updates the Figma file, re-review:
   - Login screen against `AuthGate.jsx`.
   - Recommended jobs screen against `JobsWorkspace.jsx`.
   - Score Breakdown color softness.
   - Whether all requested changes can still be handled with scoped CSS only.
