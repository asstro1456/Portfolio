import { Target, ExternalLink, MapPin, Building2, Sparkles } from "lucide-react";
import { useState } from "react";

const JOBS = [
  {
    id: 1,
    company: "카카오",
    role: "UX/UI 디자이너",
    location: "판교",
    type: "정규직",
    deadline: "2024.12.20",
    match: 94,
    tags: ["Figma", "UX Research", "Design System"],
    highlight: "내 스킬 4/4 일치",
  },
  {
    id: 2,
    company: "라인플러스",
    role: "Product Designer",
    location: "분당",
    type: "정규직",
    deadline: "2024.12.15",
    match: 87,
    tags: ["Figma", "Prototyping", "B2C"],
    highlight: "내 스킬 3/4 일치",
  },
  {
    id: 3,
    company: "토스",
    role: "UX 리서처",
    location: "강남",
    type: "정규직",
    deadline: "2024.12.28",
    match: 81,
    tags: ["UX Research", "Usability Test", "Data Analysis"],
    highlight: "내 스킬 3/5 일치",
  },
  {
    id: 4,
    company: "쿠팡",
    role: "Visual Designer",
    location: "잠실",
    type: "계약직",
    deadline: "2024.12.10",
    match: 76,
    tags: ["Photoshop", "Illustrator", "E-commerce"],
    highlight: "내 스킬 2/4 일치",
  },
  {
    id: 5,
    company: "네이버",
    role: "모션 그래픽 디자이너",
    location: "분당",
    type: "정규직",
    deadline: "2025.01.05",
    match: 68,
    tags: ["After Effects", "Motion", "Premiere"],
    highlight: "내 스킬 2/4 일치",
  },
];

const MATCH_COLOR = (m: number) =>
  m >= 90 ? "bg-emerald-100 text-emerald-700 border-emerald-200"
  : m >= 80 ? "bg-blue-100 text-blue-700 border-blue-200"
  : m >= 70 ? "bg-amber-100 text-amber-700 border-amber-200"
  : "bg-slate-100 text-slate-600 border-slate-200";

export function JobsWorkspace() {
  const [selected, setSelected] = useState<number | null>(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
        <Sparkles className="h-4 w-4 text-emerald-600" />
        <p className="text-sm text-emerald-700">내 프로필 기준으로 매칭 점수를 계산했습니다. 스킬을 추가하면 정확도가 올라갑니다.</p>
      </div>

      <div className="space-y-3">
        {JOBS.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelected(job.id)}
            className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all ${
              selected === job.id ? "border-emerald-300 ring-1 ring-emerald-300" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">{job.company}</span>
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${job.type === "정규직" ? "border-slate-200 text-slate-500 bg-slate-50" : "border-orange-200 text-orange-600 bg-orange-50"}`}>
                    {job.type}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">{job.role}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  <span>마감 {job.deadline}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {job.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <span className={`rounded-lg border px-2.5 py-1 text-sm font-bold ${MATCH_COLOR(job.match)}`}>
                  {job.match}%
                </span>
                <span className="mt-1 text-[10px] text-slate-400">매칭</span>
              </div>
            </div>

            {selected === job.id && (
              <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <Target className="h-3 w-3" />
                  {job.highlight}
                </span>
                <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  공고 보기 <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
