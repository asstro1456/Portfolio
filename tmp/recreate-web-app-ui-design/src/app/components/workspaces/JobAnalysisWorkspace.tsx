import { BarChart3, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DEMAND_DATA = [
  { name: "Figma", count: 184 },
  { name: "UX Research", count: 142 },
  { name: "Prototyping", count: 131 },
  { name: "Adobe XD", count: 98 },
  { name: "Usability", count: 87 },
  { name: "Design System", count: 76 },
  { name: "Sketch", count: 54 },
  { name: "After Effects", count: 41 },
];

const ROLE_DATA = [
  { name: "UX/UI", value: 42, color: "#6366f1" },
  { name: "그래픽", value: 22, color: "#f59e0b" },
  { name: "모션", value: 15, color: "#10b981" },
  { name: "브랜딩", value: 12, color: "#ec4899" },
  { name: "기타", value: 9, color: "#94a3b8" },
];

const TRENDS = [
  { keyword: "Design Token", direction: "up", pct: "+34%" },
  { keyword: "AI Tool 활용", direction: "up", pct: "+28%" },
  { keyword: "Motion Design", direction: "up", pct: "+19%" },
  { keyword: "Print", direction: "down", pct: "-12%" },
  { keyword: "Flash / HTML 배너", direction: "down", pct: "-31%" },
];

export function JobAnalysisWorkspace() {
  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "분석 공고 수", value: "312" },
          { label: "평균 요구 스킬", value: "4.2개" },
          { label: "UX/UI 비율", value: "42%" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Skill demand chart */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-slate-700">채용 공고 스킬 수요 TOP 8</h2>
        </div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEMAND_DATA} layout="vertical" margin={{ left: 16, right: 24, top: 0, bottom: 0 }}>
              <XAxis key="x-axis" type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis key="y-axis" type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip key="tooltip" cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
              <Bar key="bar" dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Role distribution pie */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">직군 분포</h2>
        <div className="flex items-center gap-8">
          <div style={{ width: 160, height: 160, flexShrink: 0 }}>
            <PieChart width={160} height={160}>
              <Pie data={ROLE_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={2}>
                {ROLE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <ul className="space-y-2">
            {ROLE_DATA.map((r) => (
              <li key={r.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="text-slate-600">{r.name}</span>
                <span className="ml-auto font-medium text-slate-800">{r.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trend table */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-slate-700">키워드 트렌드</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="pb-2 text-left font-medium">키워드</th>
              <th className="pb-2 text-right font-medium">증감</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {TRENDS.map((t) => (
              <tr key={t.keyword}>
                <td className="py-2.5 text-slate-700">{t.keyword}</td>
                <td className={`py-2.5 text-right font-medium ${t.direction === "up" ? "text-emerald-600" : "text-red-500"}`}>
                  {t.pct}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
