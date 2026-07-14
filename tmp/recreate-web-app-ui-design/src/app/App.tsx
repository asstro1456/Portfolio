import { useState } from "react";
import { CommandBar } from "./components/CommandBar";
import { Sidebar } from "./components/Sidebar";
import { FeatureHeader } from "./components/FeatureHeader";
import { StatusMessage } from "./components/StatusMessage";
import { TrackEntryGate } from "./components/TrackEntryGate";
import { ModelSettingsModal } from "./components/modals/ModelSettingsModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { InputWorkspace } from "./components/workspaces/InputWorkspace";
import { FeedbackWorkspace } from "./components/workspaces/FeedbackWorkspace";
import { PortfolioWorkspace } from "./components/workspaces/PortfolioWorkspace";
import { JobAnalysisWorkspace } from "./components/workspaces/JobAnalysisWorkspace";
import { JobsWorkspace } from "./components/workspaces/JobsWorkspace";
import { InterviewWorkspace } from "./components/workspaces/InterviewWorkspace";
import { InterviewReadinessWorkspace } from "./components/workspaces/InterviewReadinessWorkspace";
import { PersonalityTestWorkspace } from "./components/workspaces/PersonalityTestWorkspace";
import { PdfExportWorkspace } from "./components/workspaces/PdfExportWorkspace";
import { User, FileText, Image, Target, MessageSquare } from "lucide-react";

const MOBILE_NAV = [
  { id: "input", label: "정보", icon: User },
  { id: "feedback", label: "서류", icon: FileText },
  { id: "portfolio", label: "포폴", icon: Image },
  { id: "jobs", label: "공고", icon: Target },
  { id: "interview", label: "면접", icon: MessageSquare },
];

const FEATURE_META: Record<string, { title: string; description: string; hint?: string; accent: string }> = {
  input: {
    title: "분석 재료를 한곳에 모아요",
    description: "이름·직무·스킬·서류 파일을 입력하면 모든 분석의 기반이 됩니다.",
    hint: "파일 업로드 후 저장해야 분석이 시작됩니다.",
    accent: "text-indigo-600",
  },
  feedback: {
    title: "서류 문장을 채용자 관점으로 봅니다",
    description: "이력서와 자기소개서를 AI가 채용 담당자 시각으로 분석합니다.",
    hint: "정보 입력 탭에서 파일을 먼저 업로드해 주세요.",
    accent: "text-blue-600",
  },
  portfolio: {
    title: "포트폴리오를 실무 언어로 번역합니다",
    description: "각 프로젝트의 강점과 개선 포인트를 구체적으로 짚어줍니다.",
    accent: "text-violet-600",
  },
  "job-analysis": {
    title: "시장 흐름과 채용 언어를 따로 봅니다",
    description: "최신 공고 데이터를 기반으로 스킬 수요와 직군 분포를 분석합니다.",
    accent: "text-amber-600",
  },
  jobs: {
    title: "내 프로필 기준 공고 매칭만 봅니다",
    description: "입력한 스킬·경력 기준으로 가장 잘 맞는 채용 공고를 추천합니다.",
    hint: "스킬을 추가할수록 매칭 정확도가 높아집니다.",
    accent: "text-emerald-600",
  },
  interview: {
    title: "공고별 면접 대응을 만듭니다",
    description: "지원 공고 기준 예상 질문과 추천 답변을 생성합니다.",
    accent: "text-cyan-600",
  },
  "interview-basic": {
    title: "면접 기본 태도를 정리합니다",
    description: "복장, 서류 준비물, 면접 전 체크리스트를 확인합니다.",
    accent: "text-pink-500",
  },
  "personality-test": {
    title: "인성검사 응답 경향을 확인합니다",
    description: "인성 문항에 일관된 방식으로 응답하는 연습을 합니다.",
    accent: "text-orange-500",
  },
  "pdf-export": {
    title: "필요한 결과만 문서로 묶습니다",
    description: "원하는 섹션을 선택해 PDF로 저장하거나 공유합니다.",
    accent: "text-slate-600",
  },
};

function WorkspaceContent({ tab }: { tab: string }) {
  switch (tab) {
    case "input": return <InputWorkspace />;
    case "feedback": return <FeedbackWorkspace />;
    case "portfolio": return <PortfolioWorkspace />;
    case "job-analysis": return <JobAnalysisWorkspace />;
    case "jobs": return <JobsWorkspace />;
    case "interview": return <InterviewWorkspace />;
    case "interview-basic": return <InterviewReadinessWorkspace />;
    case "personality-test": return <PersonalityTestWorkspace />;
    case "pdf-export": return <PdfExportWorkspace />;
    default: return <div className="text-sm text-slate-400">준비 중입니다.</div>;
  }
}

export default function App() {
  /* MARKER-MAKE-KIT-INVOKED */
  const [track, setTrack] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("input");
  const [showModelModal, setShowModelModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [dismissedMsg, setDismissedMsg] = useState(false);

  if (!track) {
    return <TrackEntryGate onSelect={(t) => setTrack(t)} />;
  }

  const meta = FEATURE_META[activeTab];

  const trackLabel =
    track === "planning" ? "기획" : track === "programming" ? "프로그래밍" : "아트";

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <CommandBar
        track={trackLabel}
        activeTab={activeTab}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenGuide={() => {}}
        onOpenModel={() => setShowModelModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          track={trackLabel}
          onTrackChange={(t) => {
            const map: Record<string, string> = {
              기획: "planning",
              프로그래밍: "programming",
              아트: "art",
            };
            setTrack(map[t] ?? t);
          }}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-3xl">
            <FeatureHeader
              title={meta.title}
              description={meta.description}
              hint={meta.hint}
              accentColor={meta.accent}
            />

            {!dismissedMsg && activeTab === "feedback" && (
              <StatusMessage
                type="info"
                message="분석 결과는 AI 모델 기준으로 생성됩니다. 최종 판단은 직접 확인해 주세요."
                onDismiss={() => setDismissedMsg(true)}
              />
            )}

            <WorkspaceContent tab={activeTab} />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden flex border-t border-slate-200 bg-white shrink-0">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors ${
                active ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {showModelModal && <ModelSettingsModal onClose={() => setShowModelModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </div>
  );
}
