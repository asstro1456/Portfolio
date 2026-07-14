# Portfolio Coach — Figma UI 시안 생성 계획

## Context

`asstro1456/Portfolio-Coach` GitHub 저장소의 React/Vite 앱을 Figma 디자인 시안으로 재현한다.  
목적은 코드 수정 전 실제 서비스 화면을 검토할 수 있는 UI 시안이다. 기능 구현이나 백엔드는 제외하고 화면 구조·디자인 시스템 중심으로 재현한다.

## 파악된 앱 구조

### 앱 쉘 레이아웃 (App.jsx 기준)
```
┌─────────────────────────────────────────────────────┐
│ WorkspaceCommandBar (상단 커맨드바, h-~40px)         │
│ 트랙명 | 현재탭명 | 섹션명 | 모델정보 | 가이드·설정  │
├──────────────────────────────────────────────────────┤
│ WorkspaceSidebar     │  [메인 콘텐츠 영역]           │
│ (좌측, w-~220px)     │  WorkspaceFeatureHeader       │
│                      │  WorkspaceMessages            │
│  내 준비             │  WorkspaceContent             │
│  ├ 정보 입력         │   (탭별 컴포넌트 렌더링)     │
│  ├ 서류 피드백       │                               │
│  └ 포트폴리오        │                               │
│                      │                               │
│  시장·공고           │                               │
│  ├ 공고 분석         │                               │
│  └ 추천 공고         │                               │
│                      │                               │
│  면접·마감           │                               │
│  ├ 면접 대비         │                               │
│  ├ 면접 기본 준비    │                               │
│  ├ 인성검사          │                               │
│  └ PDF 출력          │                               │
│                      │                               │
│  [트랙 전환]         │                               │
│  기획 / 프로그래밍 / │                               │
│  아트                │                               │
└──────────────────────────────────────────────────────┘
```

### 내비게이션 탭 9개
| id | label | icon | group | 예상 accent color |
|----|-------|------|-------|------------------|
| input | 정보 입력 | User | 내 준비 | indigo-600 |
| feedback | 서류 피드백 | FileText | 내 준비 | blue-600 |
| portfolio | 포트폴리오 | Image | 내 준비 | violet-600 |
| job-analysis | 공고 분석 | BarChart3 | 시장·공고 | amber-600 |
| jobs | 추천 공고 | Target | 시장·공고 | emerald-600 |
| interview | 면접 대비 | MessageSquare | 면접·마감 | cyan-600 |
| interview-basic | 면접 기본 준비 | Smile | 면접·마감 | pink-500 |
| personality-test | 인성검사 | ClipboardList | 면접·마감 | orange-500 |
| pdf-export | PDF 출력 | Download | 면접·마감 | slate-600 |

### 주요 컴포넌트 파일
- `InputWorkspace.jsx` (29KB) — 정보 입력: 이름/직무/경력/스킬/파일업로드/강사피드백
- `FeedbackWorkspace.jsx` (10KB) — 서류 피드백: 이력서/자소서 AI 분석 결과
- `PortfolioWorkspace.jsx` (9KB) — 포트폴리오 피드백 + 제출 패널
- `JobAnalysisWorkspace.jsx` (44KB) — 공고 분석: 차트/키워드/직군분포
- `JobsWorkspace.jsx` (26KB) — 추천 공고: 공고 리스트/매칭 점수/AI 매칭
- `InterviewWorkspace.jsx` (8KB) — 면접 대비: 예상질문/추천답변
- `InterviewReadinessWorkspace.jsx` (5KB) — 면접 기본 준비: 체크리스트
- `PersonalityTest.jsx` (8KB) — 인성검사: 문항/선택지
- `PdfExport.jsx` (23KB) — PDF 출력: 섹션 선택/미리보기
- `WorkspaceCommandBar.jsx` (3KB) — 상단 커맨드바
- `WorkspaceSidebar.jsx` (2.8KB) — 좌측 사이드바
- `WorkspaceMessages.jsx` (3.5KB) — 상태 메시지 (info/success/warning/error)
- `WorkspaceFeatureHeader.jsx` (1KB) — 피처 헤더 (제목/설명/힌트)
- `CompanyInfoModal.jsx` (3.4KB) — 기업 정보 모달
- `ModelSettingsModal.jsx` (6.7KB) — 모델/API 키 설정 모달
- `SettingsModal.jsx` (3.7KB) — 일반 설정 모달
- `UserGuideModal.jsx` (9.5KB) — 사용자 가이드 모달
- `TrackEntryGate.jsx` (3.5KB) — 트랙 선택 진입 화면

### 디자인 시스템 추정
- 배경: `slate-50` (#f8fafc)
- 주 텍스트: `slate-900` (#0f172a)
- 보조 텍스트: `slate-500` (#64748b)
- 테두리: `slate-200` (#e2e8f0)
- 흰색 패널: `white` + `shadow-sm`
- 탭별 포인트 컬러: `data-feature` 속성으로 CSS 변수 분기
- 폰트: system-ui / Pretendard sans 계열
- 반경: `rounded-lg` (8px), `rounded-xl` (12px)

## Figma 파일 구성 계획

### Page 1: Design System
- Colors (토큰 팔레트: slate 스케일 + 탭별 accent 9종)
- Typography (display/heading/body/caption/label)
- Spacing (4px grid 기준: 4/8/12/16/20/24/32/48)
- Buttons (primary / secondary / ghost / destructive × default/hover/disabled)
- Form Elements (input / textarea / select / checkbox / radio / toggle)
- Cards & Panels (flat panel, feature card, job card)
- Badges & Chips (상태 칩: success/warning/error/info, 스킬 태그, 점수 배지)
- Modals (기본 모달 구조)
- Navigation (사이드바 아이템, 커맨드바, 섹션 헤더)
- Status Messages (info / success / warning / error 배너)

### Page 2: Desktop Screens (1440px)
1. App Shell — 정보 입력 탭 (기본 화면)
2. 서류 피드백 탭
3. 포트폴리오 탭
4. 공고 분석 탭 (차트/테이블)
5. 추천 공고 탭 (공고 리스트)
6. 면접 대비 탭
7. 면접 기본 준비 탭
8. 인성검사 탭
9. PDF 출력 탭
10. 기업 정보 모달
11. 모델 설정 모달
12. 트랙 선택 진입 화면
13. 빈 상태 / 로딩 / 오류 상태

### Page 3: Mobile Screens (390px)
1. 정보 입력 (모바일 — 하단 탭 내비게이션)
2. 추천 공고 (모바일)
3. 면접 대비 (모바일)
4. 모바일 내비게이션 (collapsed sidebar → bottom nav)

### Page 4: Notes
- 코드 컴포넌트 ↔ Figma 컴포넌트 매핑표
- 실제 구현 시 확인 사항

## 구현 순서

1. `figma-generate-design` 스킬 로드
2. Figma 파일 새로 생성 (`create_new_file`)
3. Page 1 Design System 구성
4. Page 2 Desktop Screens — 앱 쉘 + 각 탭 화면
5. Page 3 Mobile Screens
6. Page 4 Notes

## 검증

- 생성된 Figma 파일 URL 공유
- 각 페이지(Design System / Desktop / Mobile / Notes)가 올바르게 생성되었는지 확인
- 9개 탭 화면이 모두 포함되어 있는지 확인
