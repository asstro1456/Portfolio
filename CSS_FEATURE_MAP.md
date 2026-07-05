# CSS 기능 분류 문서

작성일: 2026-07-02  
기준 파일: `css/style.css`  
적용 화면: `index.html`, `portfolio.html`  
현재 사이트 CSS 버전: `0.1.16`

이 문서는 포트폴리오 사이트에 적용된 CSS를 기능 단위로 분류한 자료다. 실제 스타일 구현은 `css/style.css` 하나에 모여 있으며, `index.html`과 `portfolio.html`이 같은 CSS 파일을 공유한다.

## 1. 전역 토큰과 기본 설정

| 범위 | 주요 선택자 | 기능 | 비고 |
| --- | --- | --- | --- |
| 디자인 토큰 | `:root` | 배경, 표면, 텍스트, 라인, 포인트 컬러, 최대 너비, 헤더 높이, How 카드 너비를 변수로 관리 | 사이트 전체 색상과 레이아웃 기준 |
| 박스 모델 | `*` | 모든 요소에 `box-sizing: border-box` 적용 | width 계산 안정화 |
| 스크롤 | `html` | 앵커 이동 시 부드러운 스크롤 적용 | 내비게이션 섹션 이동용 |
| 기본 본문 | `body` | 기본 여백 제거, `Noto Sans KR`, 배경/텍스트 색상, 줄간격 설정 | 전체 타이포그래피 기반 |
| 기본 미디어 | `img` | 이미지 최대 너비 제한, block 처리 | 이미지 넘침 방지 |
| 링크 | `a` | 링크 색상을 부모 요소에서 상속 | CTA와 내비게이션 스타일 통일 |

## 2. 레이아웃 공통 구조

| 범위 | 주요 선택자 | 기능 | 사용 위치 |
| --- | --- | --- | --- |
| 기본 컨테이너 | `.container` | 화면 폭에서 좌우 여백을 뺀 뒤 최대 `--max` 너비로 중앙 정렬 | 헤더, 주요 섹션 |
| 좁은 컨테이너 | `.narrow` | 최대 980px의 읽기 중심 레이아웃 | Why, Vision |
| 섹션 간격 | `.section` | 섹션 위아래 여백 5rem 적용 | What, Why, Vision, Portfolio |
| 톤 배경 | `.tone` | 회색 계열 섹션 배경 | Portfolio 섹션 |
| 그리드 공통 | `.grid` | 카드 목록에 grid와 gap 적용 | What, Portfolio |

## 3. 타이포그래피와 섹션 헤더

| 범위 | 주요 선택자 | 기능 | 비고 |
| --- | --- | --- | --- |
| 제목 공통 | `h1`, `h2`, `h3` | 제목 기본 여백과 줄간격 정리 | 섹션별 제목 기반 |
| 섹션 제목 | `h2` | 반응형 제목 크기 `clamp()` 적용 | 데스크톱/모바일 자동 조정 |
| 카드 제목 | `h3` | 카드 내부 제목 크기 `clamp()` 적용 | 카드와 모달 공통 |
| 문단 | `p` | 하단 여백 통일 | 본문 리듬 유지 |
| 섹션 헤더 묶음 | `.section-heading` | 헤더 블록 하단 여백 | 각 섹션 도입부 |
| 키커 텍스트 | `.section-kicker` | 작은 대문자형 라벨 스타일 | What, Why, How, Vision 등 |
| 리드 문장 | `.section-lead` | 본문 폭 제한과 보조 텍스트 색상 | 섹션 설명문 |

## 4. 헤더와 내비게이션

| 범위 | 주요 선택자 | 기능 | 연결 동작 |
| --- | --- | --- | --- |
| 헤더 고정 | `.site-header` | 상단 sticky 헤더, 투명 배경, 높은 z-index | 모든 페이지 공통 |
| 헤더 내부 | `.site-header-inner` | 내비게이션과 가이드 버튼을 오른쪽으로 정렬 | header 내부 grid |
| 브랜드 영역 | `.site-brand`, `.site-version` | 브랜드/버전 표기용 스타일 | 현재 브랜드는 숨김 처리 |
| 내비게이션 바 | `.site-nav` | 반투명 글래스 pill 형태, blur, shadow 적용 | Main/What/Why/How/Vision/Portfolio |
| 내비게이션 링크 | `.site-link` | pill 버튼형 링크, hover/focus/active 상태 | `js/main.js`가 `.is-active` 토글 |
| 가이드 버튼 | `.nav-guide-toggle`, `.nav-guide-toggle span` | 40px 메뉴 버튼과 막대 아이콘 | `#navGuideToggle` 클릭 시 패널 표시 |
| 가이드 패널 | `.nav-guide-panel`, `.nav-guide-item` | 어두운 글래스 패널과 항목 구분선 | `hidden` 속성으로 열림/닫힘 제어 |

## 5. Hero 첫 화면

| 범위 | 주요 선택자 | 기능 | 비고 |
| --- | --- | --- | --- |
| Hero 섹션 | `.hero`, `.hero-stage` | 첫 화면을 100vh로 잡고 헤더 높이만큼 위로 당김 | 헤더가 Hero 위에 겹치는 구조 |
| 버전 표시 | `.hero-version` | Hero 상단 버전 텍스트 배치 | `Version 0.1.16` |
| 대표 비주얼 | `.hero-visual` | `assets/hero-system-flow.png`를 배경 이미지로 표시 | 배경 위치/크기 반응형 조정 |
| 오버레이 | `.hero-visual::before` | 배경 이미지 위 어두운 그라데이션 | 텍스트 가독성 확보 |
| 바닥 그리드 | `.hero-visual::after` | 원근감 있는 하단 grid 효과 | 시스템/플로우 분위기 연출 |
| Hero 내용 배치 | `.hero-overlay`, `.hero-overlay-inner` | 프로필 카드와 타이틀을 상단부터 배치 | viewport 높이 기준 |
| 프로필 카드 | `.hero-profile-card`, `.hero-card-*`, `.hero-mini-*` | 요약 프로필, 메타 정보, 태그, 링크 스타일 | 글래스 카드 UI |
| 메인 문장 | `.hero-copy`, `.hero-copy h1`, `.hero-title-line` | 큰 Hero 제목과 줄 단위 nowrap 처리 | 모바일에서는 글자 크기 축소 |

## 6. 카드, 미디어, 버튼 공통 컴포넌트

| 범위 | 주요 선택자 | 기능 | 사용 위치 |
| --- | --- | --- | --- |
| 카드 기본 | `.card`, `.card.emphasis`, `.card.compact` | border, radius, padding, 표면색 공통화 | What 카드, How 내부 카드 |
| 부드러운 카드 배경 | `.tool-card`, `.how-slide`, `.editorial-copy`, `.vision-panel`, `.resource-card`, `.process-step`, `.principle-card`, `.case-card` | 흰색에서 옅은 회색으로 이어지는 카드 배경 | 주요 콘텐츠 카드 전반 |
| 미디어 슬롯 | `.tool-media-slot`, `.card-media-slot` | 16:9 미디어 프레임, border, 배경, 중앙 정렬 | 이미지/영상/iframe 자리 |
| 미디어 콘텐츠 | `.tool-media-slot img`, `.card-media-slot img` 등 | 슬롯 안 미디어를 꽉 채우되 `object-fit: contain` 유지 | 구조도 이미지가 잘리지 않도록 처리 |
| CTA 링크 | `.resource-link` | pill 형태의 진한 버튼 링크 | Portfolio 이동, 프로토타입 열기 |
| 배지 | `.resource-badge` | 작은 pill 라벨 | Portfolio case 라벨 |
| 클릭 카드 | `.interactive-card` | hover/focus 시 상승, shadow, border 강조 | 모달을 여는 카드 전체 |
| 일반 버튼 | `button` | 기본 버튼 스타일 | 슬라이더 버튼, 모달 닫기 버튼 기반 |

## 7. What 섹션

| 범위 | 주요 선택자 | 기능 | 비고 |
| --- | --- | --- | --- |
| 섹션 위치 | `.section-evidence` | What 섹션 상단 여백 조정 | Hero 다음 섹션 |
| 도구 카드 그리드 | `.grid.tools` | 데스크톱 3열, 태블릿 2열, 모바일 1열 카드 배치 | 데이터 테이블, 플로우차트, 협업 문서 등 |
| 도구 카드 | `.tool-card`, `.tool-media-slot` | 카드 배경과 미디어 슬롯 구성 | `.open-modal`과 함께 사용 |

## 8. Why 섹션

| 범위 | 주요 선택자 | 기능 | 비고 |
| --- | --- | --- | --- |
| Editorial 레이아웃 | `.editorial-story` | 텍스트와 비주얼을 2열로 배치 | 980px 이하 1열 |
| Editorial 비주얼 | `.editorial-visual`, `.editorial-visual::before` | 어두운 그라데이션 패널과 내부 grid 장식 | Flow First 시각 영역 |
| Editorial 텍스트 | `.editorial-label`, `.editorial-copy` | 라벨과 설명 카드 스타일 | Why 설명문 |

## 9. How 섹션과 3D 캐러셀

| 범위 | 주요 선택자 | 기능 | 연결 동작 |
| --- | --- | --- | --- |
| How 배경 | `.how-group`, `.how-intro` | 별도 톤의 섹션 배경과 도입부 간격 | How 전체 |
| 슬라이더 외곽 | `.how-slider-shell`, `.slider-shell` | 3D perspective와 좌우 버튼 공간 확보 | 슬라이더 공통 껍데기 |
| 슬라이더 트랙 | `.slider-track`, `.how-slider` | 가로 흐름, scroll snap, 스크롤바 숨김 | `#howSlider` |
| 슬라이드 카드 | `.how-slide` | 데스크톱에서 absolute 중앙 배치, 비활성 opacity/filter 적용 | 기본 비활성 상태 |
| 활성 슬라이드 | `.how-slide.is-active` | 중앙 카드 표시, 높은 z-index, 진한 shadow | `js/main.js`가 토글 |
| 이전/다음 슬라이드 | `.how-slide.is-prev`, `.how-slide.is-next` | 좌우 카드에 rotateY와 scale 적용 | 3D 캐러셀 효과 |
| 슬라이더 버튼 | `.slider-nav`, `.slider-nav-prev`, `.slider-nav-next` | 좌우 원형 이동 버튼 | `data-slider-target`으로 연결 |
| 위치 점 | `.slider-dots`, `.scene-dot`, `.scene-dot.is-active` | 현재 슬라이드 표시 dot | JS가 dot 생성 및 active 제어 |

## 10. How 내부 콘텐츠

| 범위 | 주요 선택자 | 기능 | 비고 |
| --- | --- | --- | --- |
| 원칙 카드 | `.principle-grid`, `.principle-card`, `.principle-chip` | Principles 슬라이드의 2열 카드와 번호 chip | 980px 이하 1열 |
| 프로세스 플로우 | `.process-flow`, `.process-step`, `.process-number` | 4단계 프로세스와 번호 배지 구성 | 1180px 이하 2열, 980px 이하 1열 |
| 프로세스 연결선 | `.process-step:not(:last-child)::after` | 단계 사이의 선 표시 | 좁은 화면에서는 숨김 |
| 케이스 그리드 | `.case-grid`, `.case-card` | Cases 슬라이드의 사례 카드 배치 | 1180px 이하 2열, 640px 이하 1열 |

## 11. Vision과 Portfolio 상세 페이지

| 범위 | 주요 선택자 | 기능 | 사용 위치 |
| --- | --- | --- | --- |
| Vision 패널 | `.vision-panel` | 좁은 본문 안의 강조 패널 | `index.html#future` |
| Portfolio 그리드 | `.resource-grid` | 상세 자료 카드 2열 배치 | `portfolio.html`, index의 Portfolio CTA |
| Portfolio 카드 | `.resource-card` | 자료 카드 표면, padding, soft background | `portfolio.html#portfolio` |
| Portfolio 링크 | `.resource-link` | 상세 페이지/프로토타입 이동 버튼 | index, portfolio 공통 |
| Portfolio 배지 | `.resource-badge` | Case 구분 라벨 | portfolio 카드 |

## 12. 모달

| 범위 | 주요 선택자 | 기능 | 연결 동작 |
| --- | --- | --- | --- |
| 배경 레이어 | `.modal-backdrop` | 화면 전체 fixed overlay, 중앙 정렬, 반투명 배경 | `#modalBackdrop` |
| 숨김 상태 | `.modal-backdrop[hidden]` | hidden 상태에서 `display: none` 처리 | JS가 `hidden` 속성 제어 |
| 모달 박스 | `.modal` | 최대 740px, 88vh, 내부 스크롤, 카드형 패널 | 카드 상세 설명 |
| 닫기 버튼 | `.modal-close` | 우상단 원형 닫기 버튼 | `#modalClose` |
| 모달 미디어 | `.modal-media` | 점선/사선 패턴의 상세 이미지 자리 | 현재 플레이스홀더 |
| 모달 제목/본문 | `#modalTitle`, `#modalBody`, `.modal-description-label` | 상세 제목, 설명 라벨, 본문 박스 스타일 | JS가 텍스트 교체 |
| body 잠금 | `body.modal-open` | 모달 열림 시 본문 스크롤 방지 | JS가 class 추가/제거 |

## 13. 반응형 분기

| 브레이크포인트 | 주요 변경 |
| --- | --- |
| 기본 | 데스크톱 기준. `--max: 1240px`, 헤더 84px, What 3열, Process/Case 4열, How 3D 캐러셀 |
| `max-width: 1180px` | `--max: 1080px`, What 2열, Process/Case 2열, How 슬라이드는 활성 카드만 표시하는 단순 구조로 전환 |
| `max-width: 980px` | 내비게이션 가로 스크롤, Editorial/Resource/Principle 1열, Process 1열, 프로세스 연결선 숨김 |
| `max-width: 640px` | 헤더 74px, 컨테이너 좌우 여백 축소, 내비게이션 폭 축소, Hero 배경 세로 맞춤, Hero 제목 축소, What/Case 1열 |

## 14. JavaScript와 맞물리는 CSS 상태

| CSS 상태/선택자 | JS 연결 | 역할 |
| --- | --- | --- |
| `.site-link.is-active` | 스크롤 위치에 따라 `js/main.js`가 토글 | 현재 섹션 내비게이션 강조 |
| `.nav-guide-panel[hidden]` | 가이드 버튼 클릭, 외부 클릭, Escape 키 | 섹션 안내 패널 열림/닫힘 |
| `.open-modal` | 카드 클릭/Enter/Space 키 | 모달 데이터 호출 트리거 |
| `.modal-backdrop[hidden]` | 모달 열기/닫기 | 모달 표시 여부 |
| `body.modal-open` | 모달 열기/닫기 | 배경 스크롤 잠금 |
| `.how-slide.is-active` | 슬라이더 초기화, 버튼, dot, hash 이동 | 현재 How 카드 표시 |
| `.how-slide.is-prev`, `.how-slide.is-next` | 슬라이더 active index 계산 | 3D 좌우 카드 상태 |
| `.scene-dot.is-active` | 슬라이더 active index 계산 | 현재 슬라이드 dot 강조 |

## 15. 자산과 시각 효과

| 용도 | CSS/HTML 연결 | 자산 |
| --- | --- | --- |
| Hero 대표 배경 | `.hero-visual` background image | `assets/hero-system-flow.png` |
| What 카드 이미지 | `.tool-media-slot img` | `assets/images/*.png` |
| Case 카드 이미지 | `.card-media-slot img` | `assets/images/*.png` |
| Portfolio 상세 카드 | `.resource-card .card-media-slot img` | `assets/images/*.png` |
| 프로토타입 링크 | `.resource-link` | `assets/prototypes/limbus-roguelike-slot-prototype.html` |

## 16. 유지보수 메모

- 색상, 최대 너비, 헤더 높이, How 카드 폭은 `:root` 변수에서 먼저 조정한다.
- 섹션/카드/미디어 슬롯은 공통 선택자를 많이 공유하므로, 개별 섹션만 바꿀 때는 더 좁은 선택자를 추가하는 편이 안전하다.
- `.is-active`, `.is-prev`, `.is-next`, `.modal-open`, `[hidden]`은 JavaScript 동작과 직접 연결되어 있어 이름을 바꾸면 `js/main.js`도 함께 수정해야 한다.
- How 캐러셀은 데스크톱과 1180px 이하 동작이 다르다. 데스크톱 3D 효과를 바꿀 때는 1180px 이하 단순 표시 규칙도 같이 확인한다.
- Hero 제목은 `.hero-title-line`에 `white-space: nowrap`이 있어 문구가 길어지면 모바일에서 넘칠 수 있다.
- 이미지 슬롯은 `object-fit: contain` 기준이라 구조도와 프로토타입 캡처가 잘리지 않는 대신 여백이 생길 수 있다.
