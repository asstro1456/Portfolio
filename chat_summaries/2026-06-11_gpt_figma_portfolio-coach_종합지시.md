# Portfolio Coach Figma 수정 종합 지시서

## 1. 목적
- 현재 Figma의 `Desktop / 정보 입력 - Revision` 프레임을 기획 트랙 기본 화면으로 명확하게 정리한다.
- 기본 화면에는 실제 사용자가 보게 될 UI만 남기고, 조건부 상태 예시는 `02. component`의 `Input Workspace Components / State Examples`에만 보관한다.
- 사용자가 직접 만든 컴포넌트를 기준으로 화면을 구성하고, 새 컴포넌트가 필요하면 임의 생성하지 말고 먼저 요청한다.

## 2. 기준 자료
- Figma 파일: https://www.figma.com/design/fQDiHR0wWy3v2GFnHpWAu7/
- 기준 프레임: `Desktop / 정보 입력 - Revision`
- 컴포넌트 위치: `02. component`
- 상태 예시 위치: `02. component > Input Workspace Components / State Examples`
- 참고 저장소: https://github.com/asstro1456/codex-gpt
- 기존 검토 문서:
  - `figma/2026-06-11_portfolio-coach_figma_followup_instruction.md`
  - `figma/2026-06-11_portfolio-coach_figma_overlap_readability_check.md`

## 3. 현재 판단
- `Desktop / 정보 입력 - Revision`은 전반적으로 기획 트랙 기본 화면으로 읽힌다.
- 다만 기본 화면 안에 GitHub URL 조건부 레이어가 숨김 상태로 남아 있어 구현 기준으로 혼동될 수 있다.
- 이름/경력 입력 필드에 깨진 문자처럼 보이는 placeholder가 남아 있다.
- 하단 Submit 영역은 텍스트와 버튼 간격, 버튼 위치, 가독성 문제가 있어 실제 UI로 보기 어렵다.
- 일부 카드와 상태 예시는 인스턴스로 연결된 것으로 보이나, `full-width` 기본 화면용 변형과 `State Examples`용 예시가 명확히 분리되어야 한다.

## 4. 지적사항 반영 여부
| 항목 | 상태 | 판단 |
|---|---:|---|
| `Desktop / 정보 입력 - Revision`이 기획 트랙 기본 화면으로 읽히는지 | 부분 완료 | 큰 방향은 맞지만 조건부 레이어 잔존으로 혼동 가능 |
| 기획 기본 화면에서 GitHub URL 카드가 숨김 처리됐는지 | 부분 완료 | 시각적으로는 숨김이지만 레이어가 남아 있음 |
| GitHub URL 조건부 UI가 `State Examples`에만 남아 있는지 | 미완료 | 기본 화면의 숨김 레이어를 완전히 제거 필요 |
| 이름/경력 입력 placeholder 깨짐 여부 | 미완료 | 깨진 문자처럼 보이는 placeholder 교체 필요 |
| Upload Card / Pinned Job Slot / Submit Section 상태 컴포넌트 연결 | 부분 완료 | 연결은 보이나 기본 화면용 크기와 상태 예시용 크기 구분 필요 |
| 점선/가이드 레이어가 실제 UI로 오해되지 않는지 | 부분 완료 | `Guide / ...` 명명 또는 숨김 처리 필요 |
| Mobile / Tablet 프레임 신규 생성 여부 | 완료 | 새 프레임 생성 금지 유지 |

## 5. 수정 요청 사항
| 우선순위 | 항목 | 수정 내용 | 이유 |
|---|---|---|---|
| P0 | GitHub URL 조건부 레이어 | `Desktop / 정보 입력 - Revision`에서 GitHub URL 관련 숨김 레이어를 제거한다. GitHub URL UI는 `02. component > State Examples`에만 남긴다. | 기본 화면과 프로그래밍 트랙 조건부 화면이 섞이면 구현 기준이 불명확해진다. |
| P0 | 이름 입력 placeholder | 깨진 문자처럼 보이는 값을 `예: 이동헌` 또는 자연스러운 한국어 예시로 교체한다. | 실제 입력 필드처럼 보여야 하며 깨진 텍스트는 완성도 저하로 보인다. |
| P0 | 경력 입력 placeholder | 깨진 문자처럼 보이는 값을 `예: 신입 또는 1년 미만`처럼 명확한 예시로 교체한다. | 입력 목적이 즉시 이해되어야 한다. |
| P0 | Submit 영역 겹침 | 하단 텍스트와 버튼이 겹치거나 붙어 보이지 않게 간격을 조정한다. 버튼은 텍스트 오른쪽에 자연스럽게 배치하고 최소 32px 이상의 여백을 둔다. | 현재는 CTA가 좁고 불안정하게 보여 실제 화면 기준으로 부적합하다. |
| P1 | Submit 영역 폭 | 기본 화면에서는 Submit Section을 본문 폭 기준 full-width 영역으로 정리한다. 필요하면 컴포넌트 variant로 `layout=full-width`와 `layout=card`를 구분한다. | 기본 화면과 상태 예시 카드가 같은 크기로 보이면 구현자가 오해할 수 있다. |
| P1 | Upload Card | 기본 화면의 Upload Card는 준비된 컴포넌트 인스턴스를 사용하고, 상하 여백을 조정해 섹션 사이가 답답하지 않게 한다. | 업로드 영역이 하단에 밀리거나 좁아 보이면 사용 흐름이 끊긴다. |
| P1 | Pinned Job Slot | 기본 화면용 슬롯과 예시용 compact 슬롯을 구분한다. compact라면 레이어명에 `compact`를 명시한다. | 기본 화면에 들어갈 실제 크기인지 상태 예시인지 판단하기 어렵다. |
| P1 | 점선/가이드 | 실제 UI가 아닌 점선/가이드 레이어는 이름을 `Guide / ...`로 바꾸거나 export/implementation 대상에서 제외되도록 숨긴다. | 구현자가 점선을 실제 UI로 오해할 수 있다. |
| P2 | 보조 설명 텍스트 | 너무 작거나 대비가 낮은 설명문은 최소 가독 수준으로 조정한다. | Figma 화면 기준으로도 정보 위계가 흐려진다. |
| P2 | 상태 라벨 | `empty`, `uploaded` 같은 상태 표기는 기본 화면에 노출하지 않는다. State Examples 안에서만 라벨로 사용한다. | 실제 서비스 화면에 개발용 상태명이 보이는 것처럼 오해될 수 있다. |
| P2 | 하단 여백 | Submit CTA 아래 남는 여백이 과도하면 프레임 높이를 조정하거나 다음 섹션 의도를 명확히 한다. | 화면 완성도가 낮아 보이는 원인이 된다. |

## 6. 필요한 컴포넌트
| 컴포넌트 | 필요 여부 | 용도 | 상태/Variant |
|---|---:|---|---|
| Navigator | 기존 컴포넌트 사용 | 모든 프레임 공통 네비게이터 | 정보 입력 화면 기준 |
| Input Field | 기존 컴포넌트 사용 | 이름/경력/기타 입력 | placeholder 정상화 필요 |
| Upload Card | 기존 컴포넌트 사용 | 문서 업로드 영역 | empty/uploaded 등 상태 |
| Pinned Job Slot | 기존 컴포넌트 사용 | 고정 공고 슬롯 | default/compact 구분 필요 |
| Submit Section | 기존 컴포넌트 사용 또는 variant 요청 | 제출 CTA 영역 | full-width/card 구분 권장 |
| GitHub URL Conditional UI | State Examples에만 유지 | 프로그래밍 트랙 조건부 예시 | 기본 화면에서는 제거 |

## 7. 작업 제한
- 새 Mobile / Tablet 프레임은 만들지 않는다.
- 준비된 컴포넌트만 사용한다.
- 새 컴포넌트가 꼭 필요하면 작업 전 사용자에게 요청한다.
- `Desktop / 정보 입력 - Revision`은 기본 화면만 남긴다.
- 조건부 상태, 업로드 상태, 예시 상태는 `02. component > Input Workspace Components / State Examples`에만 둔다.
- 기본 화면에 숨김 레이어로 조건부 UI를 남기지 않는다.

## 8. 검증 기준
- [ ] `Desktop / 정보 입력 - Revision`에서 GitHub URL 관련 레이어가 완전히 제거되어 있다.
- [ ] GitHub URL 조건부 UI는 `02. component > State Examples`에서만 확인된다.
- [ ] 이름/경력 입력 필드 placeholder가 깨진 문자 없이 자연스럽다.
- [ ] 텍스트와 버튼이 겹치지 않고, 버튼 주변 여백이 충분하다.
- [ ] Submit Section이 기본 화면 폭에 맞게 정렬되어 있다.
- [ ] Upload Card / Pinned Job Slot / Submit Section이 준비된 컴포넌트 인스턴스 기준으로 연결되어 있다.
- [ ] 점선/가이드 레이어가 실제 UI로 오해되지 않는다.
- [ ] Mobile / Tablet 프레임이 새로 생성되지 않았다.

## 9. GPT에게 전달할 채팅
아래 기준으로 Figma를 수정해줘.

1. `Desktop / 정보 입력 - Revision`은 기획 트랙 기본 화면으로 확정한다.
2. 기본 화면 안에 남아 있는 GitHub URL 조건부 레이어는 숨김 상태라도 제거한다.
3. GitHub URL 조건부 UI는 `02. component > Input Workspace Components / State Examples`에만 남긴다.
4. 이름/경력 입력 필드의 깨진 placeholder를 자연스러운 한국어 예시로 교체한다.
5. 하단 Submit 영역에서 텍스트와 버튼이 겹치거나 너무 붙어 보이는 부분을 수정한다.
6. Upload Card / Pinned Job Slot / Submit Section은 준비된 컴포넌트 인스턴스를 사용한다.
7. Submit Section은 기본 화면용 full-width 형태와 예시용 card 형태가 헷갈리지 않게 정리한다.
8. 점선/가이드 레이어는 실제 UI로 오해되지 않도록 `Guide / ...`로 명명하거나 숨긴다.
9. Mobile / Tablet 프레임은 새로 만들지 않는다.
10. 새 컴포넌트가 필요하면 만들기 전에 먼저 질문한다.

완료 후에는 수정한 레이어, 제거한 레이어, 아직 판단이 필요한 항목을 짧게 보고해줘.
