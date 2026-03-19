import { useEffect, useState } from 'react'
import { mlAPI } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { Database, TrendingUp, Users, DollarSign, Bug, Clock, Shield } from 'lucide-react'

const RISK_COLORS = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444', Critical: '#d946ef' }
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81']

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function DatasetAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    mlAPI.datasetStats()
      .then(r => setStats(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load dataset statistics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-slate-400 text-center py-20">Loading dataset analytics...</div>
  if (error) return <div className="text-red-400 text-center py-20">{error}</div>
  if (!stats) return null

  const feats = stats.features || {}
  const riskDist = stats.risk_distribution || {}
  const pieData = Object.entries(riskDist).map(([name, value]) => ({
    name, value, color: RISK_COLORS[name] || '#6366f1',
  }))

  const summaryCards = [
    { label: 'Total Projects Analyzed', value: stats.total_projects?.toLocaleString(), icon: Database, color: 'text-indigo-400' },
    { label: 'Average Team Size', value: feats.team_size?.mean, icon: Users, color: 'text-sky-400' },
    { label: 'Average Budget', value: feats.project_budget ? `$${Math.round(feats.project_budget.mean).toLocaleString()}` : '—', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Avg Duration (months)', value: feats.project_duration?.mean, icon: Clock, color: 'text-amber-400' },
    { label: 'Average Bug Count', value: feats.bug_count?.mean, icon: Bug, color: 'text-rose-400' },
    { label: 'Avg Testing Coverage', value: feats.testing_coverage ? `${feats.testing_coverage.mean}%` : '—', icon: Shield, color: 'text-violet-400' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div variants={fade} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Database className="w-6 h-6 text-indigo-400" />
          Dataset Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Comprehensive insights from the training dataset powering the AI model
        </p>
      </motion.div>

      {/* Summary stat cards */}
      <motion.div variants={fade} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card !p-5 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
            <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Row 1: Risk distribution + Bug count distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
          <h2 className="text-base font-semibold text-white mb-4">Risk Level Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
          <h2 className="text-base font-semibold text-white mb-4">Bug Count Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.histograms?.bug_count || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(stats.histograms?.bug_count || []).map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2: Project duration + Team size distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
          <h2 className="text-base font-semibold text-white mb-4">Project Duration Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.histograms?.project_duration || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
          <h2 className="text-base font-semibold text-white mb-4">Team Size Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.histograms?.team_size || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3: Team size vs risk + Budget vs success */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            Team Size vs Delay Risk
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.team_vs_risk || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="team_range" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 4]} label={{ value: 'Avg Risk Level', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey="avg_risk" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Budget vs Success Rate
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.budget_vs_success || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="budget_range" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} formatter={(v) => `${v}%`} />
              <Bar dataKey="avg_success" radius={[4, 4, 0, 0]} fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Feature Statistics Table */}
      <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
        <h2 className="text-base font-semibold text-white mb-4">Feature Statistics Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                {['Feature', 'Mean', 'Median', 'Min', 'Max', 'Std Dev'].map(h => (
                  <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {Object.entries(feats).map(([feat, s]) => (
                <tr key={feat} className="text-slate-300">
                  <td className="py-2 pr-4 font-medium text-white capitalize">{feat.replaceAll('_', ' ')}</td>
                  <td className="py-2 pr-4">{s.mean}</td>
                  <td className="py-2 pr-4">{s.median}</td>
                  <td className="py-2 pr-4">{s.min}</td>
                  <td className="py-2 pr-4">{s.max}</td>
                  <td className="py-2 pr-4">{s.std}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
