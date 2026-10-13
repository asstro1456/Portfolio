# 압축 작성 계약

이 파일과 대응 JSON 골격만 읽고 작성한다. 원본 전체 계약은 오류 수리 시에만 연다.

## 1. 몬스터·보스 기획서

- profile: `system`
- kind: `monster-boss`
- profile 목적: 특정 기능의 사용자 경험, 게임 규칙, 상태와 기획 데이터를 개발·QA 협업에서 같은 의미로 해석하고 검증할 수 있게 작성한다. 기획서는 관찰 가능한 결과와 수용 기준을 결정하며 구현 구조는 확정하지 않는다.
- facets: data, states, exceptions, scenarios, telemetry, flow, result-feedback
- sections: definition, flow, rules, data, exceptions, balance, qa

### 요청 맥락

- 대상: 타래 언바운드 포트폴리오용 몬스터 보스 기획서
- 목표: 타래 언바운드 포트폴리오용 몬스터 보스 기획서. 조선 궁정 나례의 진자 창수 방상시를 적 패밀리로 재해석한 초안 HTML을 만든다. 진자는 군집과 채찍으로 이동과 회피를 유도한다. 창수는 주문과 몽둥이로 전방을 지휘하고 강화한다. 방상시는 창 방패 황금사목 가면으로 전방을 압박한다. 사료 사실과 창작 해석을 구분하고 각 적의 역할 행동 흐름 성공과 실패 피드백 조우 예시 검토할 가정을 포함한다. 구현 기술 구조는 제외한다.

### 문서 고유 계약

- 목적·독자: 적 행동·패턴·페이즈와 대응 단서 정의 · 전투·레벨·연출·애니메이션·QA 기획 및 개발 협업 담당
- 반드시 답할 결정: 감지·이동·공격·후퇴·페이즈 전환은 무엇으로 촉발되며 플레이어는 어떻게 읽고 대응하는가?
- 필수 산출물: 행동 상태 맵과 선택 조건, 패턴 타임라인, 텔레그래프 표, 페이즈·분노·리셋 규칙, 등장·이탈 조건
- 완료 조건: 모든 패턴에 진입 조건·예고·판정·회복·중단 규칙이 있고 무한 교착이 없으며 행동 구현 구조는 개발 협의 조건으로 남는다
- 상세 제외: 보상량, 레벨 내 최종 배치, 수치 튜닝
- 내부 커버리지: planning-intent, application-scope, operating-rules, schedule-and-ownership, data-contract, ui-touchpoints, exception-policy, telemetry-plan, completion-criteria, enemy-archetypes, stat-and-resistance-model, behavior-rules, attack-patterns, boss-phase-transition
- 인접 문서: dungeon-design, stage-design, combat-balance, reward-design
- 인접 문서 요약: 입력: combat-system · 출력: dungeon-design, stage-design, combat-balance, reward-design

### 선택 섹션 완료 조건

- `definition` · 정의와 범위: 목적, 사용자 가치, 인·아웃 스코프, 용어
- `flow` · 사용자·상태 흐름: 진입, 성공, 실패, 취소, 재진입 Mermaid
- `rules` · 상세 규칙: 발동 조건, 입력 의미, 우선순위, 상태 변화, 관찰 결과
- `data` · 상태와 기획 데이터: 상태 전이, 데이터 항목 의미, 단위·기본값·범위, 갱신·복구 조건
- `exceptions` · 예외와 악용 방지: 조건→시스템 반응→사용자 피드백 5개 이상
- `balance` · 파라미터와 조정: 공식, 변수 의미, 기본값, 범위, 상·하한, 조정 기준
- `qa` · QA·텔레메트리: 수용 조건, 테스트 케이스, 관찰 이벤트, 성공·실패 기준

### 프로필 경계

- 화면 배치·컴포넌트는 쓰지 않고 Screen ID와 필요한 피드백만 UI 문서로 넘긴다.
- balance는 시스템이 소비하는 파라미터 계약까지만 다룬다. 곡선·시뮬레이션·다구간 튜닝은 밸런스 문서로 넘긴다.
- 클라이언트·서버 분담, API, 저장소, 물리 스키마·타입, 트랜잭션·멱등·롤백 방식, 프레임·틱 처리 순서는 이 기획서가 확정하지 않는다. 필요한 사용자 결과, 상태 보존 조건, 일관성·복구 기준만 적고 구현 방식은 개발 협의 조건으로 넘긴다.
- 시장·사업, 콘텐츠 카탈로그, 제작 로드맵은 넣지 않는다.
- 사용자 행동 또는 게임 상태 흐름 Mermaid 1개가 필수다. 다이어그램은 역할별 관찰 결과를 보여 주되 런타임 배치나 내부 처리 순서를 설계하지 않는다.

### 작성·품질 규칙

- 표지에는 한국어 문서 종류를 한 번만 표시하고 canonical ID는 메타데이터에만 둔다.
- subtitle은 대상 기능과 문서 목적만 쓰고 summary는 비가시 메타 설명으로만 사용한다.
- 각 섹션은 배경보다 결정·조건·규칙·플레이어 결과·예외·검증 기준을 먼저 쓴다.
- 규칙에는 전제조건·입력·도메인 판정·관찰 결과·실패를, 흐름에는 성공·취소·재진입을 포함한다.
- kind 필수 산출물과 완료 조건을 실제 내용으로 충족하되 required_outputs·handoff 같은 내부 용어를 본문에 노출하지 않는다.
- 다른 문서가 소유한 상세는 복제하지 않고 한국어 문서명과 논리 참조 ID로 연결한다.
- 클래스·API·DB 물리 구조·서버/클라이언트 구조·알고리즘·트랜잭션·UUID·물리 타입·프레임워크·틱레이트를 확정하지 않는다.
- 기술 판단은 플레이어 관찰 결과와 측정 가능한 품질조건까지만 쓰고 구현 해법은 개발 협의로 남긴다.
- 사실·가정·제안·검토 필요를 구분하고 근거 없는 수치나 외부 사실을 만들지 않는다.
- 짧은 선언형과 한국어 라벨을 사용하고 AI의 해석·필터·생성 과정을 설명하지 않는다.
- Mermaid 최소 1개, 권장 1개.
- Chart 정책: optional.
- 허용 블록: lead{text}; paragraph{text}; bullets{items,ordered?}; table{columns,rows,caption?}; callout{title,text,tone}; cards{items}; metrics{items}; formula{label,expression,note}; mermaid{title,code,caption}; chart{title,chart_type,labels,datasets,caption}; timeline{items}; user_story{actor,want,reason,acceptance}

### 전달 전 확인

- 모든 선택 섹션에 최소 완료 조건을 충족하는 실질적 블록이 있다.
- kind 계약의 필수 결정·산출물·완료 조건이 본문에서 검토 가능하다.
- 성공뿐 아니라 관련 실패·취소·재시도·재진입 경로를 검토한다.
- 기획 권한 밖의 구현 방식과 내부 분류 용어가 사용자 본문에 없다.
- 근거 없는 수치는 예시·가정·검토 필요 중 하나로 명시한다.
- 렌더와 validate_gdd 검증 오류가 0개다.
