# Portfolio Homepage Figma CSS Handoff

작성일: 2026-06-28  
대상 페이지: https://asstro1456.github.io/Portfolio/#hero  
기준 소스: 공개 URL `index.html`, `css/style.css?v=0.1.15`, `js/main.js?v=0.1.15`

확인 메모:

- 공개 URL의 CSS는 로컬 `css/style.css?v=0.1.16`과 스타일 값이 동일하다.
- 공개 URL과 로컬의 차이는 주로 버전 표기와 텍스트 콘텐츠다.
- 이 문서는 사용자가 제공한 공개 URL 기준으로 작성했다.

이 문서는 현재 GitHub Pages 포트폴리오 메인 페이지를 Figma로 옮길 때 필요한 CSS 값을 정리한 것이다. Figma 파일에 직접 적용할 때는 `figma-handoff/portfolio-homepage-tokens.json`을 먼저 변수로 옮긴 뒤, 아래 섹션/컴포넌트 순서대로 화면을 구성하면 된다.

## 1. Figma Canvas 기준

권장 프레임:

| 용도 | 프레임 |
| --- | --- |
| Desktop | 1440 x 900 |
| Tablet | 1024 x 900 |
| Mobile | 390 x 844 |

페이지 구조:

1. `Header`: sticky nav, 높이 기준 84px. Mobile은 74px.
2. `Hero`: viewport 전체 높이, header 높이만큼 위로 당겨져 첫 화면을 채움.
3. `What`: 카드 그리드.
4. `Why`: editorial split layout.
5. `How`: 3D carousel 카드.
6. `Vision`: 좁은 본문 패널.
7. `Portfolio`: tone background CTA.
8. `Modal`: 카드 클릭 시 뜨는 overlay.

공개 URL Hero 콘텐츠 스냅샷:

| 항목 | 텍스트 |
| --- | --- |
| Version | `Version 0.1.15` |
| Profile role | `게임기획 전공 · 게임 시스템 기획자 지망` |
| Tags | `플레이어 관찰`, `조건·예외 문서화`, `데이터 테이블`, `협업 정렬` |
| Hero H1 line 1 | `막히는 흐름을 구조로 바꾸는` |
| Hero H1 line 2 | `게임 시스템 기획자` |

Figma에서는 전체 페이지를 세로 Auto Layout으로 만들고, `Hero`만 100vh 성격의 고정 높이 프레임으로 잡는다. Desktop 캡처 기준은 `Hero` 높이 900px, Mobile 기준은 844px로 두면 실제 첫 화면에 가깝다.

## 2. Font

웹 폰트:

- Family: `Noto Sans KR`
- Weights: 400, 500, 700, 800
- Body fallback: `sans-serif`
- Body line-height: `1.65`

Figma Text Styles:

| Style | CSS 기준 | Desktop | Tablet | Mobile |
| --- | --- | ---: | ---: | ---: |
| Body | `16px / 1.65 / 400` | 16 / 26.4 | 16 / 26.4 | 16 / 26.4 |
| Section/H2 | `clamp(2rem, 3.4vw, 2.9rem)` | 46.4 / 53.8 | 34.8 / 40.4 | 32 / 37.1 |
| Card/H3 | `clamp(1.32rem, 2vw, 1.95rem)` | 28.8 / 33.4 | 21.1 / 24.5 | 21.1 / 24.5 |
| Hero/H1 Desktop | `clamp(1.2rem, 5.25vw, 6rem)` | 75.6 / 72.6 | 53.8 / 51.6 | - |
| Hero/H1 Mobile | `clamp(.95rem, 5.5vw, 2.8rem)` | - | - | 21.5 / 20.6 |
| Kicker | `.8rem / 700 / uppercase` | 12.8 | 12.8 | 12.8 |
| Nav | `.85rem / 700` | 13.6 | 13.6 | 12.8 |
| Caption | `.72rem / 700 / uppercase` | 11.5 | 11.5 | 11.5 |

주의:

- Hero H1 letter spacing은 `-0.04em`이다.
- Kicker letter spacing은 `.14em`, version/caption은 `.16em`이다.
- Figma에서 반응형 clamp는 자동으로 재현되지 않으므로 Desktop/Tablet/Mobile Text Style을 분리한다.

## 3. Core Variables

CSS `:root` 기준:

| Token | Value | 용도 |
| --- | --- | --- |
| `color/bg` | `#f3f5f8` | 전체 배경 |
| `color/surface` | `#ffffff` | 카드/모달 배경 |
| `color/surface-soft` | `#eef3f7` | 보조 surface |
| `color/surface-deep` | `#081520` | deep dark surface |
| `color/text` | `#161d26` | 기본 텍스트 |
| `color/muted` | `#637080` | 보조 텍스트 |
| `color/line` | `#d7dfe7` | 카드/패널 border |
| `color/accent` | `#0dd2ff` | cyan accent |
| `color/accent-soft` | `rgba(13, 210, 255, 0.14)` | accent wash |
| `color/accent-warm` | `#ff9a5c` | warm accent |
| `layout/max` | `1240px` | Desktop container max |
| `layout/header-height` | `84px` | Header 높이 |
| `layout/header-height-mobile` | `74px` | Mobile header 높이 |
| `layout/how-card-width` | `min(880px, 72vw)` | Desktop carousel card |

## 4. Breakpoints

| Breakpoint | 변경점 |
| --- | --- |
| Default | `--max: 1240px`, `--header-height: 84px`, desktop hero/nav/carousel |
| `max-width: 1180px` | `--max: 1080px`, tool grid 2 columns, process/case 2 columns, carousel는 단일 active 카드 표시 |
| `max-width: 980px` | nav horizontal scroll, editorial/resource/principle 1 column, process 1 column |
| `max-width: 640px` | `--header-height: 74px`, container side gutter 10px, nav max width 축소, hero background `auto 100%`, hero H1 mobile clamp |

Container width:

| Viewport | Container |
| ---: | ---: |
| 1440 | 1240 |
| 1180 | 1080 |
| 1024 | 992 |
| 980 | 948 |
| 640 | 620 |
| 390 | 370 |

## 5. Header / Navigation

Header:

- Position: sticky top 0
- Min height: 84px desktop, 74px mobile
- Z-index: 30
- Background: transparent
- Header inner: grid, `auto auto`, justify end, gap 16px

Nav pill:

- Display: flex, wrap desktop, nowrap + horizontal scroll under 980px
- Gap: 5.12px desktop, 4px mobile
- Padding: 6.08px desktop, 4.8px mobile
- Radius: 999px
- Border: `rgba(168, 205, 229, 0.38)`
- Fill: `rgba(7, 17, 27, 0.58)`
- Shadow: `0 14 32 rgba(3, 10, 18, 0.18)`
- Backdrop: blur 14px, saturate 130%

Nav item:

- Min height: 38px desktop, 34px mobile
- Padding: 8.8px 15.2px desktop, 7.2px 12px mobile
- Radius: 999px
- Text: `rgba(238, 247, 255, 0.95)`, 13.6px, 700
- Active/hover fill: `rgba(13, 210, 255, 0.24)`
- Active/hover text: `#ffffff`
- Hover transform: Y -1px

Guide toggle:

- Size: 40 x 40
- Radius: 12px
- Same glass fill/border/shadow as nav
- Three bars: 15 x 2, radius 999, fill `#edf6ff`

Guide panel:

- Width: 250px, mobile `min(240px, 100vw - 32px)`
- Padding: 16px
- Radius: 18px
- Border: `rgba(172, 194, 213, 0.28)`
- Fill: `rgba(9, 19, 30, 0.94)`
- Shadow: `0 22 42 rgba(3, 10, 18, 0.24)`
- Backdrop: blur 16px

## 6. Hero

Hero section:

- Background: `#07121d`
- Min height: 100vh
- Margin top: `-84px` desktop, `-74px` mobile

Hero visual:

- Absolute inset 0
- Background image: `assets/hero-system-flow.png`
- Desktop size: `min(94vw, 1680px) auto`
- Desktop position: `60% 48%`
- Mobile size: `auto 100%`
- Mobile position: `58% bottom`
- Base fill: `#07121d`

Hero visual overlay 1:

```css
linear-gradient(180deg,
  rgba(7, 16, 27, 0.04) 0%,
  rgba(7, 16, 27, 0.18) 58%,
  rgba(7, 16, 27, 0.46) 100%)
```

Hero visual overlay 2:

```css
linear-gradient(90deg,
  rgba(3, 10, 18, 0.68) 0%,
  rgba(3, 10, 18, 0.42) 24%,
  rgba(3, 10, 18, 0.08) 58%,
  rgba(3, 10, 18, 0.18) 100%)
```

Hero floor grid:

- Position: bottom, height 32%
- Overlay gradient: `rgba(3,10,18,0)` to `rgba(3,10,18,0.28)`
- Grid: cyan line `rgba(56,168,223,0.04)`, 1px every 88px
- Transform: perspective 900px, rotateX 80deg
- Opacity: .58

Hero overlay:

- Min height: 100vh
- Display: grid, align start
- Padding top desktop: `84px + 24.8px = 108.8px`
- Padding top mobile: `74px + 12.8px = 86.8px`
- Bottom padding: 24px desktop, 36px mobile

Profile card:

- Width: 100%, max width 430px
- Padding: 18.4px 20px 19.2px
- Radius: 22px
- Border: `rgba(155, 211, 241, 0.30)`
- Fill: `rgba(8, 18, 29, 0.82)`
- Shadow: `0 20 40 rgba(4, 10, 16, 0.32)`
- Backdrop: blur 16px, saturate 120%
- Text: `#f3f8ff`

Hero title:

- Max width: `min(860px, 72vw)`
- H1 color: `#f4f9ff`
- H1 line-height: .96
- H1 letter-spacing: `-0.04em`
- Text shadow: `0 10 30 rgba(0, 0, 0, 0.32)`
- Each title line: nowrap

## 7. Shared Components

Section:

- Padding Y: 80px
- Tone background: `#e9edf1`
- Section heading margin bottom: 28.8px
- Kicker margin bottom: 7.2px
- Lead max width: 58ch, color `#51606f`

Card:

- Border: `1px solid #d7dfe7`
- Radius: 18px
- Fill: `#ffffff`
- Padding: 19.2px
- Emphasis padding: 20.8px

Soft card fill used by tool/how/editorial/vision/resource/process/principle/case:

```css
linear-gradient(180deg,
  rgba(255, 255, 255, 0.98),
  rgba(243, 247, 251, 0.98))
```

Interactive card hover:

- Transform: Y -4px
- Border: `#8ca8c2`
- Shadow: `0 18 34 rgba(25, 40, 58, 0.10)`
- Transition: 180ms ease

Media slot:

- Aspect ratio: 16 / 9
- Margin bottom: 14.4px
- Radius: 14px
- Border: `#ccd7e2`
- Fill: `#f7fafc`
- Text: `#545b65`
- Image fit: contain, white background

Button / CTA:

- Min height: 44px
- Padding: 11.2px 16.8px
- Radius: 999px
- Border: `rgba(36, 74, 105, 0.24)`
- Fill: `#173a55`
- Text: `#f2f8ff`, 800

Badge:

- Min height: 28px
- Padding X: 10.4px
- Radius: 999px
- Fill: `rgba(36, 74, 105, 0.10)`
- Text: `#244a69`, 12.16px, 700

## 8. Section Layouts

What:

- Grid: 3 columns desktop, 2 columns <=1180px, 1 column <=640px
- Gap: 16px
- Tool card uses shared card + media slot

Why:

- Narrow container max: 980px
- Editorial story: grid `1.15fr .85fr`, gap 20px, align stretch
- <=980px: 1 column

Editorial visual:

- Min height: 420px
- Padding: 22.4px
- Radius: 24px
- Border: `rgba(71, 105, 136, 0.22)`
- Fill stack:
  - radial `rgba(13,210,255,0.22)` at 28% 30%, transparent 22%
  - linear 160deg `rgba(8,26,41,0.22)` to `rgba(8,26,41,0.72)`
  - linear 135deg `#15304a` 0%, `#09131d` 74%
- Shadow: `0 24 46 rgba(14, 23, 34, 0.12)`
- Text: `#edf6ff`

How:

- Group background: `linear-gradient(180deg, #e8edf1 0%, #f4f6f8 100%)`
- Padding Y: 80px
- Slider shell padding X: 56px desktop, 44px mobile
- Slider min height desktop: `clamp(560px, 58vw, 720px)`

How slide desktop:

- Absolute centered at left 50%
- Width: `min(880px, 72vw)`
- Radius: 24px
- Border: `rgba(127, 152, 176, 0.38)`
- Shadow inactive: `0 20 36 rgba(20, 31, 45, 0.12)`
- Shadow active: `0 28 54 rgba(20, 31, 45, 0.20)`
- Inactive opacity: .28, saturate .75
- Prev transform: `translateX(-62%) rotateY(38deg) scale(.92)`
- Next transform: `translateX(-30%) rotateY(-38deg) scale(.92)`
- Active transform: `translateX(-50%) scale(1) rotateY(0)`

How slide <=1180px:

- Relative position
- Width: 100%
- Only `.is-active` visible
- 3D transforms removed

Principle grid:

- 2 columns desktop, 1 column <=980px
- Gap: 16px
- Principle card min height: 220px
- Chip: min 40 x 30, radius 999, fill `#16344d`, text `#eff8ff`

Process:

- 4 columns desktop, 2 columns <=1180px, 1 column <=980px
- Step padding: 18.4px, radius 18px
- Number badge: min 42 x 42, radius 14px, fill `#0f2940`
- Connector line: 16 x 1, fill `#b8c7d3`

Cases:

- 4 columns desktop, 2 columns <=1180px, 1 column <=640px
- Uses shared card + media slot

Vision:

- Narrow container max: 980px
- Panel padding: 21.6px 22.4px
- Radius: 18px
- Border: `#d7dfe7`
- Soft card fill

Portfolio CTA:

- Section background: `#e9edf1`
- CTA uses button style

## 9. Modal

Backdrop:

- Fixed inset 0
- Display grid center
- Padding: 16px
- Fill: `rgba(17, 20, 24, 0.58)`
- Z-index: 99

Modal:

- Width: `min(100%, 740px)`
- Max height: 88vh
- Overflow: auto
- Padding: 19.2px
- Border: `#d7dfe7`
- Radius: 18px
- Fill: `#ffffff`

Close:

- Position: top 10.4px, right 10.4px
- Size: 34 x 34
- Radius: 999px
- Font size: 20px

Modal media:

- Min height: 170px
- Margin bottom: 12.8px
- Radius: 12px
- Border: 1.5px dashed `#aab0b8`
- Fill: repeating diagonal stripe `#f3f4f6` / `#ebeef1`

Modal body:

- Min height: 92px
- Padding: 14.4px
- Border: 1px dashed `#b6bcc5`
- Radius: 12px
- Fill: `#fafbfc`

## 10. Assets

Figma에 직접 배치할 이미지:

| 역할 | Local path | GitHub Pages URL |
| --- | --- | --- |
| Hero background | `assets/hero-system-flow.png` | `https://asstro1456.github.io/Portfolio/assets/hero-system-flow.png` |
| Data table card | `assets/images/data-table-reference.png` | `https://asstro1456.github.io/Portfolio/assets/images/data-table-reference.png` |
| Flow room card | `assets/images/flow-room-rules.png` | `https://asstro1456.github.io/Portfolio/assets/images/flow-room-rules.png` |
| Project BB thumbnail | `assets/images/project-bb-thumbnail.png` | `https://asstro1456.github.io/Portfolio/assets/images/project-bb-thumbnail.png` |
| Limbus prototype | `assets/images/limbus-prototype.png` | `https://asstro1456.github.io/Portfolio/assets/images/limbus-prototype.png` |
| Shop flow | `assets/images/flow-shop.png` | `https://asstro1456.github.io/Portfolio/assets/images/flow-shop.png` |
| Equipment flow | `assets/images/flow-equipment-upgrade.png` | `https://asstro1456.github.io/Portfolio/assets/images/flow-equipment-upgrade.png` |

이미지 프레임 기본값:

- Tool/Card media: aspect 16:9, object fit contain
- Hero: Figma에서는 이미지 fill을 `Fit` 또는 `Crop`으로 두고, Desktop 기준 가로 약 1354px로 배치한 뒤 overlay gradients를 위에 쌓는다.

## 11. Figma 적용 순서

1. `portfolio-homepage-tokens.json`에서 color, radius, spacing, shadow, typography를 Variables/Styles로 만든다.
2. Desktop frame 1440 x 900을 만들고 page frame을 세로 Auto Layout으로 구성한다.
3. Header glass nav 컴포넌트를 먼저 만든다.
4. Hero frame에 hero image, gradient overlays, floor grid, profile card, H1을 쌓는다.
5. Shared card, media slot, badge, CTA, modal 컴포넌트를 만든다.
6. What/Why/How/Vision/Portfolio 섹션을 순서대로 배치한다.
7. Tablet/Mobile frame은 breakpoint 표를 기준으로 Auto Layout 방향과 grid column 수만 바꾼다.

## 12. 직접 Figma로 옮길 때 확인할 것

- `Noto Sans KR`가 Figma에 로드되어 있는지 확인한다.
- Hero H1 두 줄은 nowrap이어야 하므로 Mobile에서 줄바꿈이 깨지지 않는지 확인한다.
- Header nav는 Desktop에서는 wrap 가능, Tablet/Mobile에서는 horizontal scroll처럼 보이도록 overflow frame으로 구성한다.
- How carousel의 3D 상태는 Figma에서 active/prev/next variant로 나누면 재현이 쉽다.
- Web의 backdrop blur는 Figma Effects에서 background blur 14~16px로 대체한다.
- CSS의 `clamp()` 값은 Figma에서 자동 반응하지 않으므로 프레임별 text style로 분리한다.
