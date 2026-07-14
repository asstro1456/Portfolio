# 자기소개서 Figma 구조 수정 메모

## 1. 목적

- 기존 자기소개서/포트폴리오 구조에서 품질이 낮은 과거 Limbus 사례를 제외한다.
- 자기소개서와 프로젝트 경험 문서의 역할을 분리한다.
- Figma에서 만들 화면 구조가 `자기소개서 본문`, `프로젝트 경험 상세`, `포트폴리오 연결 자료`를 혼동하지 않도록 정리한다.

## 2. 기준 자료

- GitHub 커밋: `asstro1456/codex-gpt` `185ed5172e3a8ade439f2ce1abebcd3e1a1d16b4`
- 사이트 기준: `C:\Users\User\Documents\Portfolio\PORTFOLIO_WORK_RULES.md`
- 현재 포트폴리오: `C:\Users\User\Documents\Portfolio\index.html`
- 프로젝트 상세 후보: `C:\Users\User\Documents\Portfolio\assets\docs\system-design-project-summary-2026-06-18.md`
- 자기소개서 작성 자료:
  - `C:\Users\User\Documents\Portfolio\notion-game-planner-cover-letter-guide.md`
  - `C:\Users\User\Documents\Portfolio\notion-cover-letter-step-by-step.md`
  - `C:\Users\User\Documents\Portfolio\notion-cover-letter-3c4p.md`
  - `C:\Users\User\Documents\Portfolio\notion-cover-letter-persuasive-writing.md`

## 3. 현재 상태

- 기존 구조는 Limbus UI/UX 지원용 포트폴리오에 맞춰져 있다.
- 자기소개서 목차 검토 메모에는 `프로젝트 기반 기획 경험`, `컨셉과 시스템 연결`, `교육 경험`, `AI 검수 경험`이 포함되어 있다.
- 사용자는 Limbus 문서 품질이 낮다고 판단했으므로 Figma 구조에서도 Limbus를 핵심 사례로 사용하지 않는다.
- 프로젝트 경험은 자기소개서에 길게 넣기보다 별도 프로젝트 경험 문서로 분리하는 방향이 적절하다.

## 4. 지적사항 반영 여부

| 항목 | 상태 | 판단 |
|---|---:|---|
| Limbus 사례 제외 | 반영 필요 | 자기소개서와 Figma 메인 구조에서 제거 |
| 프로젝트 경험 상세 분리 | 반영 필요 | 자기소개서 본문과 프로젝트 상세 프레임을 분리 |
| 교육 경험 위치 조정 | 유지 | 메인 후킹이 아니라 사용자 관찰의 출처로만 사용 |
| AI 활용 위치 조정 | 유지 | 도구 사용 능력이 아니라 검수 루프로 표현 |
| 자기소개서와 포트폴리오 역할 분리 | 반영 필요 | 자기소개서는 사고방식, 프로젝트 문서는 증거 자료 |

## 5. 수정 요청 사항

| 우선순위 | 항목 | 수정 내용 | 이유 |
|---|---|---|---|
| 1 | 첫 화면 구조 | `Limbus Company UI/UX Portfolio` 또는 Limbus 중심 제목을 제거하고 `시스템 조건과 사용자 흐름을 구조화하는 게임 기획자` 방향으로 변경 | 품질 낮은 과거 사례가 첫인상을 점유하지 않게 함 |
| 1 | 자기소개서 메인 프레임 | 6개 목차를 모두 카드로 나열하지 말고 `정체성 → 대표 근거 → 관찰 방식 → 검수 방식 → 입사 후 목표` 흐름으로 재배치 | 자기소개서 화면은 읽는 흐름이 중요함 |
| 1 | 프로젝트 상세 프레임 | `Project_BB`, `비주얼노벨 데이터 구조 분리`, `Unity UI 상태 설계`, `AI/툴 검토 루프`를 별도 섹션 또는 별도 페이지로 분리 | 자소서 본문이 프로젝트 설명서처럼 무거워지는 문제 방지 |
| 2 | 프로젝트 요약 카드 | 자기소개서 안에는 프로젝트별 1문장 요약만 배치 | 자소서는 사고방식의 증거만 제시하고 상세는 링크/별도 문서로 이동 |
| 2 | 교육 경험 카드 | 교육 경험은 `출발점` 또는 `관찰 습관` 섹션에 작게 배치 | 게임 기획자로서의 첫인상이 교육자로 보이는 문제 방지 |
| 2 | AI 활용 카드 | `AI 결과물 생성`이 아니라 `검수 기준`, `값의 흐름 확인`, `호출 순서 확인`, `기획 의도 반영`으로 표현 | AI 사용자보다 기획 판단자가 앞에 보이게 함 |
| 3 | 상세 문서 연결 | 프로젝트 경험 문서, 포트폴리오, 자기소개서 초안을 서로 연결하는 링크 영역 추가 | 채용 담당자/실무자가 원하는 깊이만 선택해 볼 수 있게 함 |

## 6. 필요한 컴포넌트

| 컴포넌트 | 필요 여부 | 용도 | 상태/Variant |
|---|---:|---|---|
| Cover Letter Hero | 필요 | 자기소개서 첫인상. 핵심 정체성 한 문장 표시 | Default |
| Section Navigator | 필요 | 자기소개서, 프로젝트 경험, 포트폴리오 증거 자료 이동 | Active / Default |
| Resume Thesis Block | 필요 | `나는 어떤 기획자인가`를 2~3문장으로 제시 | Text only |
| Evidence Summary Card | 필요 | 프로젝트를 자소서 안에서 짧게 요약 | Project_BB / VN Data / Unity UI / AI Review |
| Project Detail Card | 필요 | 별도 프로젝트 경험 문서용 상세 카드 | Problem / Role / Action / Output / Lesson |
| Process Flow | 필요 | 관찰 → 기준화 → 구조화 → 검수 흐름 표현 | 4-step |
| Source Note | 선택 | 교육 경험, AI 활용처럼 보조 근거 표시 | Compact |
| Link CTA | 필요 | 프로젝트 경험 문서 또는 포트폴리오 상세로 이동 | Primary / Secondary |

## 7. 권장 Figma 프레임 구조

```text
Cover Letter System
  01_CoverLetter_Main
    Hero_Identity
    Thesis_3Lines
    Evidence_Summary_Projects
    Observation_Source_Education
    Review_Loop_AI_Tools
    Future_Goal

  02_Project_Experience_Index
    Project_BB_System_Documentation
    VisualNovel_Data_Structure
    Unity_UI_State_Design
    AI_Tool_Review_Loop

  03_Project_Detail_Template
    Problem
    My_Role
    Decision_Criteria
    Actions
    Outputs
    Result_or_Lesson
    Portfolio_Link

  04_Portfolio_Connection
    Website_Link
    Document_Link
    Asset_or_Screenshot_Reference
```

## 8. 자기소개서 화면에서 남길 내용

- 핵심 정체성: 시스템 조건과 사용자 흐름을 구조화하는 게임 기획자
- 대표 근거: Project_BB처럼 조건, 예외, 판정 기준을 문서화한 경험
- 차별점: 컨셉을 감상으로 두지 않고 UI, 규칙, 상태값, 데이터 구조로 옮기는 습관
- 보조 근거: 교육 경험에서 얻은 사용자 관찰 방식
- 보조 역량: AI와 툴 결과물을 기획 의도에 맞게 검수한 경험
- 목표: 작은 기능도 목적, 규칙, 예외, QA 기준까지 문서화하는 기획자

## 9. 자기소개서 화면에서 뺄 내용

- Limbus Company 명시 사례
- Limbus 슬롯 프로토타입
- Limbus 재학습 UX 분석
- 품질 검증이 끝나지 않은 과거 이미지/프로토타입
- 프로젝트별 세부 설명 전체
- AI로 무엇을 만들었다는 식의 도구 중심 어필

## 10. 구현 리스크

- 프로젝트 상세를 메인 자기소개서에 많이 넣으면 자기소개서가 프로젝트 설명서처럼 보일 수 있다.
- 교육 경험을 앞에 두면 게임 기획자 전환의 근거가 약해 보일 수 있다.
- AI 활용을 크게 강조하면 기획 역량보다 도구 사용 능력이 중심으로 보일 수 있다.
- Limbus 관련 이미지가 남아 있으면 사용자가 제외하려는 낮은 품질의 과거 사례가 다시 첫인상을 만들 수 있다.

## 11. 검증 기준

- [ ] 첫 화면에서 Limbus가 보이지 않는다.
- [ ] 첫 문장에서 게임 기획자 정체성이 드러난다.
- [ ] 프로젝트는 자기소개서 안에서 1~2문장 근거로만 쓰인다.
- [ ] 프로젝트 상세는 별도 프레임이나 별도 문서 구조로 분리되어 있다.
- [ ] 교육 경험은 `사용자 관찰 방식의 출처`로만 보인다.
- [ ] AI 경험은 `결과물 생성`이 아니라 `검수와 판단 기준`으로 보인다.
- [ ] Figma 프레임 이름만 봐도 자기소개서와 프로젝트 경험 문서의 역할이 구분된다.

## 12. 다음 작업

- 자기소개서 Figma 프레임에서는 Limbus 관련 카드와 문구를 제거한다.
- 프로젝트 경험 문서용 Figma 프레임을 별도로 만든다.
- 프로젝트 상세 템플릿은 `문제 → 내 역할 → 판단 기준 → 행동 → 산출물 → 배운 점` 순서로 고정한다.
- 자기소개서 초안은 프로젝트 상세 문서를 완성한 뒤, 핵심 근거 1~2개만 가져와 압축한다.
