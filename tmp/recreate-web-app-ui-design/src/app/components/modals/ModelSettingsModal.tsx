import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const MODELS = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", desc: "가장 강력한 멀티모달 모델" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", desc: "빠르고 저렴한 경량 모델" },
  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic", desc: "뛰어난 글쓰기 및 분석 능력" },
  { id: "gemini-1-5-pro", label: "Gemini 1.5 Pro", provider: "Google", desc: "긴 컨텍스트 처리에 강함" },
];

interface ModelSettingsModalProps {
  onClose: () => void;
}

export function ModelSettingsModal({ onClose }: ModelSettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••••••••••••••••••");
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">모델 설정</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Model selector */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">AI 모델 선택</label>
            <div className="space-y-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selectedModel === m.id
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedModel === m.id ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                    {selectedModel === m.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{m.label}</p>
                    <p className="text-xs text-slate-400">{m.provider} · {m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">API 키</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">API 키는 로컬에만 저장되며 외부로 전송되지 않습니다.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            취소
          </button>
          <button onClick={onClose} className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
