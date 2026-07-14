import { Upload, Plus, X, Sparkles } from "lucide-react";
import { useState } from "react";

const SKILL_OPTIONS = ["Figma", "Photoshop", "After Effects", "Blender", "Maya", "Unity", "Unreal Engine", "Illustrator"];
const ROLE_OPTIONS = ["UX/UI 디자이너", "그래픽 디자이너", "모션 그래픽", "3D 아티스트", "게임 아티스트", "영상 편집"];

export function InputWorkspace() {
  const [skills, setSkills] = useState(["Figma", "Photoshop", "After Effects"]);
  const [newSkill, setNewSkill] = useState("");

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">기본 정보</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">이름</label>
            <input
              defaultValue="김지수"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">지망 직무</label>
            <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none">
              {ROLE_OPTIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">경력 구분</label>
            <div className="flex gap-2">
              {["신입", "경력 1-3년", "경력 3년+"].map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-600">
                  <input type="radio" name="career" className="accent-indigo-600" defaultChecked={opt === "신입"} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">전공</label>
            <input
              defaultValue="시각디자인학과"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 스킬 태그 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">보유 스킬</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-700">
              {skill}
              <button onClick={() => setSkills(skills.filter((s) => s !== skill))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
          >
            <option value="">스킬 선택…</option>
            {SKILL_OPTIONS.filter((s) => !skills.includes(s)).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => { if (newSkill) { setSkills([...skills, newSkill]); setNewSkill(""); } }}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
      </section>

      {/* 자기소개 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">자기소개 / 지원동기</h2>
          <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
            <Sparkles className="h-3 w-3" />
            AI 초안 생성
          </button>
        </div>
        <textarea
          rows={5}
          defaultValue="저는 사용자 경험을 중심으로 생각하는 UX/UI 디자이너를 지망하고 있습니다. 대학교 재학 중 다수의 프로젝트를 통해 Figma와 Adobe 제품군에 익숙해졌으며, 실제 서비스를 직접 기획하고 디자인한 경험이 있습니다."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none resize-none"
        />
        <p className="mt-1.5 text-right text-xs text-slate-400">189 / 1000자</p>
      </section>

      {/* 파일 업로드 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">서류 파일 업로드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {["이력서 (PDF/DOCX)", "자기소개서 (PDF/DOCX)"].map((label) => (
            <div
              key={label}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <p className="text-xs">{label}</p>
              <p className="text-[10px] text-slate-300">클릭하거나 드래그하여 업로드</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">포트폴리오 파일이 있다면 함께 업로드해 주세요. (최대 50MB)</p>
      </section>

      {/* 강사 피드백 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">강사 피드백 메모</h2>
        <textarea
          rows={3}
          placeholder="강사에게 받은 피드백이나 특이사항을 기록해 두세요…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none resize-none"
        />
      </section>

      <div className="flex justify-end">
        <button className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          저장하기
        </button>
      </div>
    </div>
  );
}
