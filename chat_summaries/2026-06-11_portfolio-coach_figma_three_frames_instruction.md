# Portfolio Coach Figma 3개 Revision 프레임 재수정 지시서

## 1. 작업 범위

- 대상은 Figma UI 레이아웃과 인터랙션 표현뿐이다.
- 사이트 코드, 실제 로직, 데이터 구조는 수정하지 않는다.
- 코드에 없는 새 기능을 중심 UI처럼 추가하지 않는다.
- 새 컴포넌트가 필요하면 만들기 전에 사용자에게 먼저 질문한다.

## 2. 대상 프레임

```text
Desktop / 서류 피드백 - Revision
Desktop / 포트폴리오 - Revision
Desktop / 추천 공고 - Revision
```

## 3. 현재 통과한 기준

- 세 프레임 모두 1120px 본문 폭 기준을 대체로 유지하고 있다.
- 카드와 섹션 제목의 큰 중첩은 보이지 않는다.
- 서류 피드백은 점수 중심 목업에서 수정 우선순위/이력서/자소서/공고별 맞춤 피드백 구조로 바뀌었다.
- 추천 공고 카드에는 저장/핀 버튼이 들어가지 않았다.
- 추천 공고는 점수 breakdown과 AI Match Reason을 포함한다.
- 포트폴리오 탭에서 GitHub 분석은 하단 보조 조건부 안내로 내려가 있다.

## 4. 반드시 반영할 수정 지시

### P0. 포트폴리오 상단 KPI에서 GitHub 기본 지표 제거

수정 대상:

```text
Desktop / 포트폴리오 - Revision
Content / 포트폴리오
Metric / GitHub 분석
Label: GitHub 분석
Value: 조건부
```

지시:

- 상단 KPI에서는 GitHub가 기획 기본 화면의 핵심 판단 요소처럼 보이면 안 된다.
- `Metric / GitHub 분석`은 문서 포트폴리오 중심 지표로 교체한다.
- 권장 문구:

```text
Metric name: Metric / 문서 완성도
Label: 문서 완성도
Value: 보강 필요
```

- GitHub 조건부 안내는 하단 보조 카드로만 유지한다.

주의:

- `Conditional Note / GitHub Analysis`는 삭제하지 않아도 된다.
- 단, 상단 요약 KPI나 핵심 섹션에는 GitHub를 올리지 않는다.

### P0. 포트폴리오 요약 칩 문구 조정

수정 대상:

```text
Chip / Github
Label: GitHub는 조건부 보조
```

지시:

- 요약 칩에서도 GitHub가 먼저 읽히지 않도록 문서 중심 문구로 바꾼다.
- 권장 문구:

```text
Chip name: Chip / Document First
Label: 문서 중심 검토
```

### P1. Navigator 인스턴스 상태 확인

수정 대상:

```text
Navigator
Navigator 내부 overlay / dropdown / nav item 관련 레이어
```

지시:

- 세 프레임에서 Navigator가 정보 입력 Revision의 기준 인스턴스와 같은 상태인지 확인한다.
- 실제 화면에서 드롭다운이 열린 상태처럼 보이는 레이어가 있으면 숨김 처리한다.
- 단, 현재 스크린샷상 큰 UI 침범은 보이지 않으므로 불필요한 구조 변경은 하지 않는다.

### P1. 서류 피드백 세부 겹침 재확인

수정 대상:

```text
Desktop / 서류 피드백 - Revision
피드백 기준
공고별 맞춤 피드백
```

지시:

- `피드백 기준` 영역과 `공고별 맞춤 피드백` 영역이 서로 겹치지 않는지 다시 확인한다.
- 현재 기준에서는 겹침이 보이지 않으므로, 불필요하게 위치를 크게 바꾸지 않는다.
- 카드 내부 태그와 본문 텍스트가 너무 붙어 보이면 태그를 오른쪽 끝으로 정렬하거나 본문 폭을 줄인다.

### P1. 추천 공고 저장/핀 액션 금지 유지

수정 대상:

```text
Desktop / 추천 공고 - Revision
추천 공고 카드
```

지시:

- 추천 공고 카드에는 저장/핀 버튼을 넣지 않는다.
- 허용되는 CTA:

```text
공고 바로가기
회사 정보 보기
```

- 우선 공고 지정은 정보 입력 탭의 `Pinned Job Slot` 흐름과 연결되는 것으로 유지한다.

### P2. 기존 Mobile 프레임은 건드리지 않기

확인된 기존 Mobile 프레임:

```text
Mobile / 정보 입력
Mobile / 추천 공고
Mobile / 인성검사
```

지시:

- 새 Mobile / Tablet Revision 프레임을 만들지 않는다.
- 기존 Mobile 프레임은 이번 작업 범위가 아니므로 수정하지 않는다.

## 5. 완료 후 보고 형식

```text
수정한 프레임:
수정한 레이어:
삭제/숨김 처리한 레이어:
컴포넌트 인스턴스 유지 여부:
아직 사용자 확인이 필요한 항목:
```

## 6. GPT에게 바로 보낼 채팅

아래 기준으로 Figma를 수정해줘.

이번 작업은 사이트 코드나 로직 수정이 아니라 Figma UI 레이아웃/인터랙션 표현 정리만 해당한다.

대상 프레임:

```text
Desktop / 서류 피드백 - Revision
Desktop / 포트폴리오 - Revision
Desktop / 추천 공고 - Revision
```

우선 수정할 것:

1. `Desktop / 포트폴리오 - Revision`의 상단 KPI에서 `Metric / GitHub 분석`을 제거하거나 문서 포트폴리오 지표로 교체한다.
   - 권장: `Metric / 문서 완성도`
   - Label: `문서 완성도`
   - Value: `보강 필요`

2. `Chip / Github`도 GitHub 중심 문구가 아니라 문서 중심 문구로 바꾼다.
   - 권장: `Chip / Document First`
   - Label: `문서 중심 검토`

3. `Conditional Note / GitHub Analysis`는 하단 보조 조건부 안내로만 유지한다.
   - 상단 KPI나 핵심 섹션에는 GitHub를 올리지 않는다.

4. 세 프레임의 Navigator가 정보 입력 Revision과 같은 기본 상태인지 확인한다.
   - 드롭다운/overlay가 열린 상태처럼 보이면 숨긴다.
   - 불필요한 구조 변경은 하지 않는다.

5. 서류 피드백의 `피드백 기준`과 `공고별 맞춤 피드백`은 현재 겹치지 않으므로 큰 재배치는 하지 않는다.
   - 카드 내부 태그와 본문이 붙어 보이는 곳만 미세 조정한다.

6. 추천 공고 카드에는 저장/핀 버튼을 추가하지 않는다.
   - 허용 CTA는 `공고 바로가기`, `회사 정보 보기`만 둔다.

7. 새 Mobile / Tablet 프레임은 만들지 않는다.
   - 기존 Mobile 프레임은 이번 작업 범위가 아니므로 건드리지 않는다.

완료 후에는 수정한 프레임, 수정한 레이어, 숨김/삭제한 레이어, 사용자 확인이 필요한 항목만 짧게 보고해줘.
