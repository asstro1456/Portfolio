# 현재 Figma 프레임 수정 사항 검토 보고서

## 1. 검토 대상

- Figma 파일: https://www.figma.com/design/fQDiHR0wWy3v2GFnHpWAu7/
- 주요 검토 프레임: `Desktop / 정보 입력 - Revision`
- 함께 확인한 프레임:
  - `Desktop / 서류 피드백 - Revision`
  - `Desktop / 포트폴리오 - Revision`
  - `Desktop / 추천 공고 - Revision`
- 기준 코드:
  - `src/components/InputWorkspace.jsx`
  - `src/App.jsx`
- 검토 방식:
  - Figma 직접 수정 없음
  - Figma 프레임/텍스트/인스턴스 구조 읽기 검토
  - 코드 구현 흐름과 이전 지적사항 기준 대조

---

## 2. 전체 요약

현재 `Desktop / 정보 입력 - Revision`은 이전에 지적했던 핵심 문제들이 대부분 반영되었습니다.

반영된 핵심 항목:

- `Instructor Feedback` 섹션 추가
- `GitHub 저장소 URL` 조건부 카드 추가
- `AI 분석 시작 및 저장` CTA를 별도 `Section / Submit`으로 분리
- Upload disabled / uploaded / multi 상태 보강
- Pinned Job loading / error / resolved 상태 보강
- Skill Input 빠른 추가 / 삭제 관련 요소 보강

현재 판단:

- `Desktop / 정보 입력 - Revision`은 구현 기준 후보로 볼 수 있음.
- 다만 상태 예시와 실제 기본 화면이 한 프레임 안에 섞여 있을 수 있어, 구현 전 정리가 필요함.
- 다른 탭 Revision은 아직 표준 헤더/네비게이터 정렬 수준에 가까우며, 실제 코드 상세 구조 반영은 부족함.

---

## 3. 현재 프레임 구조

`Desktop / 정보 입력 - Revision` 현재 구조:

```text
Desktop / 정보 입력 - Revision
├─ Navigator / 기준 인스턴스 유지
├─ Overline / Section Group
├─ Title / Page
├─ Description / Page
├─ Badge / Current Track
├─ Shell / Input Workspace
├─ Section / Documents Upload
├─ Section / Pinned Job
├─ Section / Instructor Feedback
├─ Section / Submit
├─ Desktop Handoff / Implementation Summary
└─ Desktop Final Audit / Implementation Check
```

프레임 크기:

- `1440 x 2550`

---

## 4. 지적사항 반영 여부

| 이전 지적사항 | 현재 반영 여부 | 판단 |
|---|---:|---|
| Navigator 기준 인스턴스 유지 | 반영됨 | 통과 |
| Summary Cards 필요 | 반영됨 | 통과 |
| Track Selection 필요 | 반영됨 | 통과 |
| Basic Profile Fields 필요 | 반영됨 | 통과 |
| Current Focus Panel 필요 | 반영됨 | 통과 |
| Skill Input 기본 구조 필요 | 반영됨 | 통과 |
| 빠른 추가 필요 | 반영됨 | 통과 |
| Skill chip 삭제/상태 필요 | 반영됨 | 통과 |
| GitHub URL 조건부 카드 필요 | 반영됨 | 통과 |
| Documents Upload 기본 구조 필요 | 반영됨 | 통과 |
| Upload Disabled 상태 필요 | 반영됨 | 통과 |
| Upload Complete 상태 필요 | 반영됨 | 통과 |
| Pinned Job 기본 구조 필요 | 반영됨 | 통과 |
| Pinned Job Loading 상태 필요 | 반영됨 | 통과 |
| Pinned Job Error 상태 필요 | 반영됨 | 통과 |
| Pinned Job Resolved 상태 필요 | 반영됨 | 통과 |
| Instructor Feedback 섹션 필요 | 반영됨 | 통과 |
| Submit Section 분리 필요 | 반영됨 | 통과 |
| AI Analysis Running 상태 필요 | 반영됨 | 통과 |

---

## 5. 좋아진 부분

### 5-1. 정보 입력 흐름이 코드에 가까워짐

이전에는 정보 입력 화면이 다음 구조까지만 있었습니다.

- 입력 shell
- documents upload
- pinned job

현재는 실제 코드 흐름에 맞게 다음이 추가되었습니다.

- `Section / Instructor Feedback`
- `Section / Submit`
- 상태 예시
- 구현 체크용 audit panel

이제 실제 `InputWorkspace.jsx`의 주요 하단 흐름을 대부분 포함합니다.

### 5-2. CTA 위치가 개선됨

이전 문제:

- `AI 분석 시작 및 저장` 버튼이 `Section / Pinned Job` 내부에 있었음.

현재:

- `Section / Submit`이 별도로 생김.
- CTA가 최종 실행 영역으로 분리됨.

판단:

- 코드 구조와 맞는 방향입니다.
- 실제 `InputWorkspace.jsx`에서도 `InstructorFeedbackForm` 이후 submit section이 나옵니다.

주의:

- 자동 검사상 아직 `submitOutsidePinned`이 false로 잡혔는데, 이는 텍스트/레이어 검색 방식상 Pinned Job과 Submit 텍스트가 같은 프레임 전체에서 함께 잡힌 영향일 가능성이 큽니다.
- 실제 top-level 구조 기준으로는 `Section / Submit`이 `Section / Pinned Job` 밖에 있으므로 큰 문제는 아닙니다.

### 5-3. Instructor Feedback 반영됨

현재 확인된 텍스트:

- `강사 피드백`
- `강사가 사전에 남긴 코멘트를 AI 분석 기준에 반영하는 입력 영역`
- `강사 피드백이 있으면 분석 프롬프트에 추가 컨텍스트로 전달됩니다.`

판단:

- 이전 P0 누락 사항이 해결됨.
- 실제 코드의 `InstructorFeedbackForm`을 완전히 세부 재현한 것은 아니지만, 구현 기준으로는 충분히 방향이 맞음.

추가로 있으면 좋은 것:

- Markdown preview 상태
- 템플릿 다운로드/초기화 상태
- 파일 import 상태

우선순위:

- P2

### 5-4. GitHub 조건부 카드 반영됨

현재 확인된 텍스트:

- `GitHub 저장소 URL`
- `프로그래밍 트랙에서만 노출`
- `https://github.com/username/project`
- `public repo 기준`
- `구조 설계·커밋·README를 분석 근거로 사용`

판단:

- 이전 P1 지적사항이 반영됨.
- 조건부 UI임을 명시한 점이 좋음.

주의:

- 현재 정보 입력 Revision은 기획 트랙 기준인데 GitHub 조건부 카드가 같은 프레임에 노출되어 있음.
- “프로그래밍 트랙에서만 노출”이라는 설명이 있으므로 작업용 예시로는 괜찮음.
- 구현 기준으로 넘길 때는 조건부 영역임을 더 명확히 해야 함.

권장 레이어명:

- `Conditional / GitHub URL / Programming Only`

### 5-5. Upload 상태 보강됨

현재 확인된 요소:

- Upload disabled warning
- Gemini 제공자 제한 안내
- uploaded 파일명 예시
- 삭제 텍스트
- 포트폴리오 최대 8개 / 첨부 2개 상태 예시

판단:

- 이전 P0 지적사항 반영됨.
- 실제 코드의 `fileUploadDisabled`, `resumeFile`, `coverLetterFile`, `portfolioFiles` 상태를 표현할 수 있는 기준이 생김.

주의:

- 현재 상태 예시가 기본 화면과 함께 들어가 있다면, 실제 기본 상태와 혼동될 수 있음.

권장:

- Upload 상태는 component variant 또는 `State Examples / Upload`로 분리.

필요 variant:

- `Upload Card / empty`
- `Upload Card / disabled`
- `Upload Card / uploaded`
- `Upload Card / multi-uploaded`

### 5-6. Pinned Job 상태 보강됨

현재 확인된 요소:

- loading 상태: `조회 중... 기존 데이터에 없으면 자동 크롤링`
- resolved 상태 관련 note
- rank slot 구조
- 조회 버튼
- 상태 표현

판단:

- 이전 P0 지적사항은 상당 부분 반영됨.
- 실제 코드의 `pinnedSlots` 상태 구조를 반영하기 시작함.

주의:

- loading/error/resolved가 같은 화면 안에 예시로 섞여 있으면 실제 동시 노출 상태처럼 보일 수 있음.
- 각 slot은 실제로 하나의 상태만 가짐.

권장:

- `Pinned Job Slot`은 반드시 variant로 정리.

필요 variant:

- `Pinned Job Slot / empty`
- `Pinned Job Slot / loading`
- `Pinned Job Slot / error`
- `Pinned Job Slot / resolved`

---

## 6. 아직 남은 문제

### 6-1. 작업용 레이어와 구현 대상 레이어가 섞여 있음

현재 다음 레이어는 실제 구현 UI가 아니라 작업용 가이드에 가깝습니다.

- `Desktop Handoff / Implementation Summary`
- `Desktop Final Audit / Implementation Check`
- `Handoff Note`
- `Layout Guide`
- `Header Cover / Standardized`
- `Status Tag / Desktop Revision`

문제:

- 구현자가 보면 실제 화면에 포함해야 하는 UI인지 헷갈릴 수 있음.

수정 제안:

- 구현하지 않을 레이어는 이름에 `_DO_NOT_IMPLEMENT` prefix를 붙이기.

예시:

- `_DO_NOT_IMPLEMENT / Desktop Handoff`
- `_DO_NOT_IMPLEMENT / Final Audit`
- `_DO_NOT_IMPLEMENT / Layout Guide`
- `_DO_NOT_IMPLEMENT / Revision Status Tag`

우선순위:

- P1

### 6-2. 기본 화면과 상태 예시가 한 프레임에 섞여 있음

현재 `Desktop / 정보 입력 - Revision`은 높이가 `2550px`까지 늘어났습니다.

문제:

- 실제 기본 화면인지 상태 모음인지 모호함.
- 구현자가 모든 상태를 한 화면에 동시에 구현하려고 오해할 수 있음.
- 특히 Upload, Pinned Job, Submit loading은 실제로 동시에 항상 보이는 UI가 아님.

수정 제안:

- 기본 화면과 상태 예시를 분리.

권장 구조:

```text
Desktop / 정보 입력 - Revision / Default
Desktop / 정보 입력 - Revision / States
```

또는 현재 프레임 안에서 명확히 구분:

```text
State Examples / Upload
State Examples / Pinned Job
State Examples / Submit Loading
```

우선순위:

- P1

### 6-3. Submit Section 상태 분리 필요

현재 Submit Section은 생겼고 AI running 관련 표현도 확인됩니다.

남은 문제:

- default / loading / disabled 상태가 구분되어야 구현이 쉬움.
- 실제 코드에서는 `loading`일 때 버튼 disabled 및 안내 박스가 나타남.

필요 상태:

- `Submit Section / default`
- `Submit Section / loading`
- `Submit Section / disabled`

우선순위:

- P1

### 6-4. GitHub 카드는 조건부 UI로 더 분명히 해야 함

현재 GitHub 카드가 들어간 것은 좋습니다.

문제:

- 현재 프레임은 기획 트랙 기준인데 GitHub 카드가 보임.
- 텍스트로 “프로그래밍 트랙에서만 노출”이라고 되어 있으나, 시각적으로는 기본 화면에 포함된 것처럼 보일 수 있음.

수정 제안:

- GitHub 카드 상단에 condition badge를 유지.
- 레이어명에 `Conditional` 명시.
- 가능하면 별도 상태 프레임으로 분리.

권장:

- `Desktop / 정보 입력 - Revision / Programming State`

우선순위:

- P2

---

## 7. 다른 Revision 프레임 검토

### 7-1. `Desktop / 서류 피드백 - Revision`

현재 상태:

- Navigator와 표준 헤더는 들어감.
- 기존 단순 피드백 화면이 대부분 유지됨.

부족한 점:

- 분석 이력 패널 없음.
- 공고별 자기소개서 피드백 없음.
- 결과 없음/분석 중/에러 상태 없음.
- 기존 헤더와 새 표준 헤더가 함께 있는 구조로 보여 레이어 정리가 필요함.

판단:

- 아직 구현 기준으로는 부족.
- 표준화 초안 정도로 봐야 함.

우선순위:

- P1

### 7-2. `Desktop / 포트폴리오 - Revision`

현재 상태:

- 기존 프로젝트 카드와 제출 패널 중심.
- Navigator와 표준 헤더 적용됨.

부족한 점:

- GitHub 분석 상세 없음.
- 기술 스택 / 구조 해석 / 프로젝트 하이라이트 / 면접 포인트 / 품질 신호 / 리스크 부족.
- 포트폴리오 제출 상태와 이력 구조 부족.

판단:

- 아직 실제 `PortfolioWorkspace.jsx` 기준으로는 부족.

우선순위:

- P1

### 7-3. `Desktop / 추천 공고 - Revision`

현재 상태:

- Job Match 카드 중심.
- Navigator와 표준 헤더 적용됨.

부족한 점:

- 검색창 없음.
- 점수 필터 없음.
- 매칭 전 상태 없음.
- 매칭 중 loading 없음.
- 빈 결과 없음.
- 오류 상태 없음.
- AI Match Reason 부족.

판단:

- 아직 실제 `JobsWorkspace.jsx` 기준으로는 부족.

우선순위:

- P1

---

## 8. 검증 결과

통과한 부분:

- [x] `Desktop / 정보 입력 - Revision` 생성
- [x] Navigator 기준 인스턴스 유지
- [x] Summary Cards 반영
- [x] Track Selection 반영
- [x] Basic Profile 반영
- [x] Current Focus 반영
- [x] Skill Input 반영
- [x] 빠른 추가 반영
- [x] Skill 삭제/상태 반영
- [x] GitHub URL 조건부 카드 반영
- [x] Documents Upload 반영
- [x] Upload Disabled 상태 반영
- [x] Upload Complete 상태 반영
- [x] Pinned Job 기본 구조 반영
- [x] Pinned Job Loading 반영
- [x] Pinned Job Error 반영
- [x] Pinned Job Resolved 반영
- [x] Instructor Feedback 반영
- [x] Submit Section 분리
- [x] AI Analysis Running 반영

추가 정리가 필요한 부분:

- [ ] 작업용 레이어에 `_DO_NOT_IMPLEMENT` 명시
- [ ] Default 화면과 State Examples 분리
- [ ] Pinned Job Slot variant화
- [ ] Upload Card variant화
- [ ] Submit Section 상태 분리
- [ ] 다른 탭 Revision 세부 상태 보강

---

## 9. 다음 지시 제안

### P0.5

- [ ] `Pinned Job Slot`을 variant 기준으로 정리한다.
  - empty
  - loading
  - error
  - resolved
- [ ] `Upload Card`를 variant 기준으로 정리한다.
  - empty
  - disabled
  - uploaded
  - multi-uploaded
- [ ] `Submit Section`을 상태별로 구분한다.
  - default
  - loading
  - disabled

### P1

- [ ] 구현하지 않을 작업용 레이어에 `_DO_NOT_IMPLEMENT` prefix를 붙인다.
- [ ] `Desktop / 정보 입력 - Revision`을 `Default`와 `States`로 분리할지 결정한다.
- [ ] `Desktop / 서류 피드백 - Revision`에 분석 이력/공고별 피드백을 추가한다.
- [ ] `Desktop / 포트폴리오 - Revision`에 GitHub 분석 상세를 추가한다.
- [ ] `Desktop / 추천 공고 - Revision`에 검색/필터/매칭 상태를 추가한다.

### P2

- [ ] Tablet 기준 프레임 추가.
- [ ] Mobile 기준 프레임 추가.
- [ ] 인성검사 intro/practice/result 상태 분리.
- [ ] GitHub 조건부 상태를 별도 프로그래밍 트랙 프레임으로 분리.

---

## 10. Codex 결론

`Desktop / 정보 입력 - Revision`은 이전보다 훨씬 좋아졌고, 주요 지적사항은 대부분 반영되었습니다.

현재 판단:

- 정보 입력 프레임은 구현 기준 후보로 사용 가능.
- 단, 상태 예시와 실제 기본 화면이 섞여 있으므로 구현 전 정리 필요.
- 다른 탭 Revision은 아직 구현 기준으로는 부족하며, 표준화 초안 수준입니다.

가장 먼저 정리할 것:

1. `Pinned Job Slot` variant화
2. `Upload Card` variant화
3. `Submit Section` 상태 분리
4. `_DO_NOT_IMPLEMENT` 레이어명 정리
5. 정보 입력 Default / States 분리 여부 결정

최종 판단:

- 정보 입력: 구현 기준 후보
- 다른 탭 Revision: 추가 리비전 필요
