# Portfolio 작업 기준

이 문서는 `C:\Users\User\Documents\Portfolio`의 포트폴리오 웹 영역 기준만 정리한다. Codex 행동 규칙과 작업 유형 분기는 `AGENTS.md`를 따른다.

## 프로젝트 기준

- 포트폴리오 웹 영역은 GitHub Pages 정적 사이트다.
- 공개 흐름은 `Main / What / Why / How / Vision / Portfolio` 기준을 유지한다.
- 메인 페이지는 자기소개와 작업 방식에 집중하고, 상세 증거 자료는 `portfolio.html`에서 다룬다.
- 현재 방향은 `시스템을 이해하고 UX로 풀어내는 게임 UI/UX 기획자`다.
- 현재 지원 맞춤 방향은 `Limbus Company UI/UX 디자이너`다.

## 커밋과 버전

- 사용자가 커밋과 푸시를 직접 한다.
- 커밋 전에는 `git status --short`로 의도한 파일만 포함되는지 확인한다.
- `node_modules/`, `tmp/`, `output/`은 Git 추적 대상이 아니다.
- 검증 통과 후 patch 버전을 자동 증가한다.
- `index.html`의 hero version 표기와 CSS/JS 캐시 쿼리를 같은 버전으로 맞춘다.
- `portfolio.html`의 CSS/JS 캐시 쿼리도 같은 버전으로 맞춘다.
- 현재 기준 버전은 `0.1.16`이다.

## 검증

- 기본 UI 검증은 `npm run verify:ui`를 사용한다.
- 직접 실행이 필요하면 아래 명령을 사용한다.

```powershell
& 'C:\Program Files\nodejs\node.exe' .\scripts\verify-ui-flow.mjs 'file:///C:/Users/User/Documents/Portfolio/index.html'
```

- UI 변경 후에는 가능한 범위에서 데스크톱, 태블릿, 모바일 폭을 확인한다.
- 확인 항목은 nav 가독성, hero/title overflow, How 캐러셀 카드 잘림, Portfolio 페이지 이미지 로딩, 콘솔 에러다.

## 레이아웃과 콘텐츠

- 네비게이션은 상단 sticky 구조를 유지한다.
- 네비 패널은 목차 항목만 감싸고, 불필요한 빈 패널 폭을 만들지 않는다.
- How 캐러셀은 데스크톱에서 3D 카드 구도를 유지한다.
- 태블릿 이하에서는 내용이 잘리지 않도록 활성 슬라이드가 실제 콘텐츠 높이만큼 펼쳐지는 배치를 우선한다.
- Limbus Company 지원용 핵심 메시지는 시스템 조건을 UX 흐름과 UI 상태로 바꾸는 역량이다.
- Portfolio 4개 카드는 `Limbus 재학습 UX 분석`, `Limbus 슬롯 프로토타입`, `Unity UI 상태 설계`, `시스템 조건과 UX 흐름` 기준을 유지한다.
- AI/툴 사용은 결과물을 그대로 쓰는 방식보다 구조 검토와 질문 정리에 쓰는 방향으로 설명한다.

## 이미지와 자산

- 자기소개서 웹사이트 이미지는 캐릭터 원화보다 플로우차트, 데이터 구조도, 프로토타입 캡처를 우선한다.
- 큰 영상 파일은 우선 제외한다.
- 카드 이미지는 `assets/images/`에 둔다.
- Limbus 프로토타입 HTML은 `assets/prototypes/`에 둔다.
- 플로우차트와 데이터 구조도는 잘리지 않도록 `object-fit: contain` 기준으로 보여준다.
