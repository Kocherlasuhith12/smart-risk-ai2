import { useEffect, useState } from 'react'
import { projectsAPI, predictionsAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#6366f1']

export default function Reports() {
  const [projects, setProjects] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([projectsAPI.list(), predictionsAPI.summary()])
      .then(([p, s]) => { setProjects(p.data); setSummary(s.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-slate-400 text-center py-20">Loading reports...</div>

  const pieData = summary ? [
    { name: 'High Risk',   value: summary.high_risk },
    { name: 'Medium Risk', value: summary.medium_risk },
    { name: 'Low Risk',    value: summary.low_risk },
    { name: 'Unanalysed', value: summary.unpredicted },
  ].filter(d => d.value > 0) : []

  const analysed = projects.filter(p => p.risk_score)

  const budgetRisk = analysed.map(p => ({
    name: p.project_name.substring(0, 10),
    budget: Math.round(p.project_budget / 1000),
    score: p.risk_score,
    risk: p.predicted_risk
  }))

  const teamRisk = analysed.map(p => ({
    team: p.team_size,
    score: p.risk_score,
    name: p.project_name.substring(0, 10)
  })).sort((a, b) => a.team - b.team)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Insights across all your projects</p>
      </div>

      {/* Summary numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: summary?.total_projects, color: 'text-indigo-400' },
          { label: 'High Risk',      value: summary?.high_risk,      color: 'text-red-400' },
          { label: 'Medium Risk',    value: summary?.medium_risk,    color: 'text-yellow-400' },
          { label: 'Low Risk',       value: summary?.low_risk,       color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-3xl font-bold ${color}`}>{value ?? 0}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Risk Score by Project</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetRisk.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {budgetRisk.slice(0, 8).map((p, i) => (
                  <Cell key={i} fill={p.risk === 'High' ? '#ef4444' : p.risk === 'Medium' ? '#f59e0b' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team size vs risk */}
      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4">Team Size vs Risk Score</h2>
        {teamRisk.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={teamRisk}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="team" label={{ value: 'Team Size', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-slate-500 text-sm text-center py-8">Add more projects to see trends</p>}
      </div>

      {/* Project table */}
      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4">All Projects Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                {['Project', 'Team', 'Budget', 'Duration', 'Bugs', 'Testing%', 'Risk Level', 'Score'].map(h => (
                  <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {projects.map(p => (
                <tr key={p.id} className="text-slate-300">
                  <td className="py-2 pr-4 font-medium text-white max-w-[140px] truncate">{p.project_name}</td>
                  <td className="py-2 pr-4">{p.team_size}</td>
                  <td className="py-2 pr-4">${(p.project_budget / 1000).toFixed(0)}k</td>
                  <td className="py-2 pr-4">{p.project_duration}mo</td>
                  <td className="py-2 pr-4">{p.bug_count}</td>
                  <td className="py-2 pr-4">{p.testing_coverage}%</td>
                  <td className="py-2 pr-4">
                    {p.predicted_risk
                      ? <span className={`text-xs font-semibold ${p.predicted_risk === 'High' ? 'text-red-400' : p.predicted_risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>{p.predicted_risk}</span>
                      : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                  <td className="py-2">{p.risk_score || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
