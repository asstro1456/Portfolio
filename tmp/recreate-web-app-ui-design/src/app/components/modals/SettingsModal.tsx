import { X } from "lucide-react";
import { useState } from "react";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [lang, setLang] = useState("ko");
  const [theme, setTheme] = useState("light");
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">설정</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">언어</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">테마</label>
            <div className="flex gap-2">
              {[{ id: "light", label: "라이트" }, { id: "dark", label: "다크" }, { id: "system", label: "시스템" }].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs transition-colors ${
                    theme === t.id ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">자동 저장</p>
              <p className="text-xs text-slate-400">입력 내용을 자동으로 저장합니다</p>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative h-6 w-11 rounded-full transition-colors ${autoSave ? "bg-indigo-600" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform ${autoSave ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="rounded-lg border border-red-100 bg-red-50/50 p-3">
            <p className="mb-2 text-xs font-medium text-red-600">데이터 초기화</p>
            <p className="mb-2 text-xs text-slate-500">모든 입력 정보와 분석 결과가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            <button className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-100">
              초기화하기
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
