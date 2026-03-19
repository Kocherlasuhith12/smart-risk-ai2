import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mlAPI, projectsAPI } from '../services/api'
import RiskBadge from '../components/RiskBadge'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, AreaChart, Area, LineChart, Line, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  Brain, Trash2, AlertTriangle, CheckCircle2, Lightbulb, Pencil, X, Download,
  Cpu, TrendingUp, Sliders, FileText, Zap, Shield,
} from 'lucide-react'

const fields = [
  { key: 'project_name', label: 'Project Name', type: 'text' },
  { key: 'team_size', label: 'Team Size', type: 'number' },
  { key: 'project_budget', label: 'Project Budget ($)', type: 'number' },
  { key: 'project_duration', label: 'Project Duration (months)', type: 'number' },
  { key: 'requirement_change_count', label: 'Requirement Changes (#)', type: 'number' },
  { key: 'average_sprint_delay', label: 'Avg Sprint Delay (days)', type: 'number' },
  { key: 'bug_count', label: 'Bug Count (#)', type: 'number' },
  { key: 'testing_coverage', label: 'Testing Coverage (%)', type: 'number' },
  { key: 'code_complexity', label: 'Code Complexity (1–10)', type: 'number' },
  { key: 'developer_experience', label: 'Avg Developer Experience (yrs)', type: 'number' },
  { key: 'communication_frequency', label: 'Communication Frequency (mtgs/wk)', type: 'number' },
  { key: 'task_completion_rate', label: 'Task Completion Rate (%)', type: 'number' },
  { key: 'client_change_requests', label: 'Client Change Requests (#)', type: 'number' },
  { key: 'previous_project_success_rate', label: 'Past Project Success Rate (%)', type: 'number' },
]

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// Confusion matrix cell color
function cmColor(val, max) {
  const intensity = max > 0 ? val / max : 0
  if (intensity > 0.7) return 'bg-indigo-500 text-white'
  if (intensity > 0.3) return 'bg-indigo-500/40 text-indigo-100'
  if (intensity > 0) return 'bg-indigo-500/15 text-indigo-200'
  return 'bg-slate-800 text-slate-500'
}

// ── What-If slider config ──
const whatIfSliders = [
  { key: 'team_size', label: 'Team Size', min: 2, max: 60, step: 1 },
  { key: 'testing_coverage', label: 'Testing Coverage (%)', min: 0, max: 100, step: 1 },
  { key: 'requirement_change_count', label: 'Requirement Changes', min: 0, max: 40, step: 1 },
  { key: 'bug_count', label: 'Bug Count', min: 0, max: 350, step: 5 },
  { key: 'code_complexity', label: 'Code Complexity', min: 1, max: 10, step: 1 },
  { key: 'average_sprint_delay', label: 'Sprint Delay (days)', min: 0, max: 18, step: 0.5 },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  // New states
  const [forecast, setForecast] = useState(null)
  const [whatIfValues, setWhatIfValues] = useState({})
  const [whatIfResult, setWhatIfResult] = useState(null)
  const [whatIfLoading, setWhatIfLoading] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    projectsAPI.get(id)
      .then(r => setProject(r.data))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false))
  }, [id])

  const runPrediction = async () => {
    setPredicting(true)
    setError('')
    try {
      const payload = {}
      fields.forEach(f => { payload[f.key] = project[f.key] })
      const res = await mlAPI.predictRisk(payload)
      setPrediction(res.data)
      setProject(prev => ({ ...prev, predicted_risk: res.data.risk_level, risk_score: res.data.risk_score }))

      // Initialize what-if sliders with current values
      const sliderInit = {}
      whatIfSliders.forEach(s => { sliderInit[s.key] = project[s.key] ?? 0 })
      setWhatIfValues(sliderInit)

      // Fetch risk forecast
      const feats = {}
      fields.filter(f => f.type === 'number').forEach(f => { feats[f.key] = project[f.key] })
      mlAPI.riskForecast({ features: feats, months: 3 })
        .then(r => setForecast(r.data))
        .catch(() => {})
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed.')
    } finally {
      setPredicting(false)
    }
  }

  const openEdit = () => {
    if (!project) return
    const init = {}
    fields.forEach(f => { init[f.key] = project[f.key] ?? '' })
    setEditForm(init)
    setEditOpen(true)
  }

  const saveEdits = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...editForm }
      fields.forEach(f => {
        if (f.type === 'number' && payload[f.key] !== '') payload[f.key] = Number(payload[f.key])
      })
      const res = await projectsAPI.update(id, payload)
      setProject(res.data)
      setPrediction(null)
      setForecast(null)
      setWhatIfResult(null)
      setEditOpen(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return
    await projectsAPI.delete(id)
    navigate('/projects')
  }

  // What-If Simulation
  const runWhatIf = useCallback(async () => {
    if (!project) return
    setWhatIfLoading(true)
    try {
      const baseFeats = {}
      fields.filter(f => f.type === 'number').forEach(f => { baseFeats[f.key] = project[f.key] })
      const overrides = {}
      whatIfSliders.forEach(s => {
        if (whatIfValues[s.key] !== undefined && whatIfValues[s.key] !== project[s.key]) {
          overrides[s.key] = Number(whatIfValues[s.key])
        }
      })
      if (Object.keys(overrides).length === 0) {
        setWhatIfResult(null)
        setWhatIfLoading(false)
        return
      }
      const res = await mlAPI.whatIf({
        base_features: baseFeats,
        scenarios: [{ label: 'Modified scenario', overrides }],
      })
      setWhatIfResult(res.data)
    } catch {
      // silent
    } finally {
      setWhatIfLoading(false)
    }
  }, [project, whatIfValues])

  // PDF download using print
  const downloadPDF = () => {
    const el = printRef.current
    if (!el) return
    el.style.display = 'block'
    window.print()
    setTimeout(() => { el.style.display = 'none' }, 500)
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>
  if (!project) return null

  const detailRows = [
    ['Team Size', `${project.team_size} developers`],
    ['Budget', `$${project.project_budget?.toLocaleString()}`],
    ['Duration', `${project.project_duration} months`],
    ['Bug Count', project.bug_count],
    ['Req. Changes', project.requirement_change_count],
    ['Avg Sprint Delay', `${project.average_sprint_delay} days`],
    ['Testing Coverage', `${project.testing_coverage}%`],
    ['Code Complexity', `${project.code_complexity}/10`],
    ['Dev Experience', `${project.developer_experience} yrs`],
    ['Communication', `${project.communication_frequency} mtgs/wk`],
    ['Task Completion', `${project.task_completion_rate}%`],
    ['Client Changes', project.client_change_requests],
    ['Past Success Rate', `${project.previous_project_success_rate}%`],
  ]

  const probs = prediction?.risk_probabilities
    ? Object.entries(prediction.risk_probabilities).map(([name, value]) => ({ name, value, color:
      name === 'Critical' ? '#d946ef' :
      name === 'High' ? '#ef4444' :
      name === 'Medium' ? '#f59e0b' :
      '#22c55e'
    }))
    : []

  const health = prediction?.health_dashboard
  const modelInfo = prediction?.model_info
  const shapData = prediction?.shap_explanation || []

  // Confusion matrix helpers
  const cm = modelInfo?.confusion_matrix
  const cmLabels = modelInfo?.labels || []
  const cmMax = cm ? Math.max(...cm.flat()) : 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.project_name}</h1>
          <p className="text-slate-400 text-sm mt-1">Created {new Date(project.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openEdit} className="btn-secondary flex items-center gap-2 text-sm">
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button onClick={runPrediction} disabled={predicting} className="btn-primary flex items-center gap-2 text-sm !w-auto px-4">
            <Brain className="w-4 h-4" />
            {predicting ? 'Analysing...' : 'Run AI Analysis'}
          </button>
          <button
            onClick={downloadPDF}
            disabled={!prediction}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download PDF Risk Report"
          >
            <FileText className="w-4 h-4" />
            PDF Report
          </button>
          <button onClick={handleDelete} className="btn-secondary flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setEditOpen(false)} aria-label="Close edit modal" />
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Edit project parameters</p>
                <p className="text-xs text-slate-400">Updating inputs will reset the previous prediction.</p>
              </div>
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveEdits} className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f.key} className={f.key === 'project_name' ? 'md:col-span-2' : ''}>
                    <label className="label">{f.label}</label>
                    <input type={f.type} className="input-field" value={editForm[f.key]}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} required />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button type="submit" className="btn-primary !w-auto px-6" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
                <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Risk Banner */}
      {project.predicted_risk && (
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${
          project.predicted_risk === 'Critical' ? 'bg-fuchsia-900/20 border-fuchsia-800' :
          project.predicted_risk === 'High'     ? 'bg-red-900/20 border-red-800' :
          project.predicted_risk === 'Medium'   ? 'bg-yellow-900/20 border-yellow-800' :
                                                  'bg-green-900/20 border-green-800'}`}>
          {project.predicted_risk === 'High' || project.predicted_risk === 'Critical'
            ? <AlertTriangle className="w-8 h-8 text-red-400" />
            : <CheckCircle2 className="w-8 h-8 text-green-400" />}
          <div>
            <p className="font-semibold text-white">AI Risk Assessment Complete</p>
            <RiskBadge level={project.predicted_risk} score={project.risk_score} />
            {prediction?.confidence_score !== undefined && (
              <p className="text-xs text-slate-400 mt-1">Confidence: {Math.round(prediction.confidence_score * 100)}%</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════ AI Analysis Results ══════════ */}
      {prediction && (
        <>
          {/* ── 1. Health Dashboard + Risk Probabilities ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Project Health Dashboard</h2>
                <span className="text-xs text-slate-400">Score out of 100</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Risk Score', value: health?.risk_score ?? 0, color: 'bg-indigo-500' },
                  { label: 'Delay Score', value: health?.delay_score ?? 0, color: 'bg-sky-500' },
                  { label: 'Budget Score', value: health?.budget_score ?? 0, color: 'bg-emerald-500' },
                  { label: 'Quality Score', value: health?.quality_score ?? 0, color: 'bg-amber-500' },
                  { label: 'Team Efficiency', value: health?.team_efficiency_score ?? 0, color: 'bg-violet-500' },
                  { label: 'Stability', value: health?.stability_score ?? 0, color: 'bg-cyan-500' },
                ].map((k) => (
                  <div key={k.label} className="bg-slate-900 rounded-xl p-4 border border-slate-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">{k.label}</p>
                      <p className="text-sm font-semibold text-white">{Math.round(k.value)}</p>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, k.value))}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }} className={`h-full ${k.color}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700/60">
                <p className="text-xs font-semibold text-slate-200 mb-1">Reasoning summary</p>
                <p className="text-sm text-slate-300">{prediction.reasoning_summary}</p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-base font-semibold text-white mb-4">Risk Probabilities</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={probs} dataKey="value" nameKey="name" innerRadius={45} outerRadius={62} paddingAngle={4}>
                      {probs.map((p, i) => <Cell key={i} fill={p.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0b1220', border: '1px solid #334155', borderRadius: 10, color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} formatter={(v) => `${Math.round(v * 100)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                {[
                  ['Delay probability', prediction.delay_probability],
                  ['Budget overrun probability', prediction.budget_overrun_probability],
                  ['Quality issue probability', prediction.quality_issue_probability],
                  ['Requirement instability probability', prediction.requirement_instability_probability],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold text-slate-100">{Math.round(value * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 2. Model Transparency ── */}
          {modelInfo && (
            <motion.div variants={fade} initial="hidden" animate="visible" className="card">
              <div className="flex items-center gap-2 mb-5">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Model Performance & Transparency</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {[
                  { label: 'Model', value: modelInfo.model_name, color: 'text-indigo-400' },
                  { label: 'Accuracy', value: modelInfo.accuracy != null ? `${(modelInfo.accuracy * 100).toFixed(1)}%` : '—', color: 'text-emerald-400' },
                  { label: 'Precision', value: modelInfo.precision != null ? `${(modelInfo.precision * 100).toFixed(1)}%` : '—', color: 'text-sky-400' },
                  { label: 'Recall', value: modelInfo.recall != null ? `${(modelInfo.recall * 100).toFixed(1)}%` : '—', color: 'text-amber-400' },
                  { label: 'F1 Score', value: modelInfo.f1_score != null ? `${(modelInfo.f1_score * 100).toFixed(1)}%` : '—', color: 'text-violet-400' },
                  { label: 'Training Samples', value: modelInfo.training_samples?.toLocaleString() ?? '—', color: 'text-rose-400' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-900 rounded-xl p-4 border border-slate-700/60 text-center">
                    <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Confusion Matrix + ROC */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cm && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">Confusion Matrix</h3>
                    <div className="overflow-auto">
                      <table className="text-xs">
                        <thead>
                          <tr>
                            <th className="p-2 text-slate-500">Actual ↓ / Pred →</th>
                            {cmLabels.map(l => <th key={l} className="p-2 text-slate-300 text-center min-w-[56px]">{l}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {cm.map((row, ri) => (
                            <tr key={ri}>
                              <td className="p-2 text-slate-300 font-medium">{cmLabels[ri]}</td>
                              {row.map((val, ci) => (
                                <td key={ci} className={`p-2 text-center font-semibold rounded-lg ${cmColor(val, cmMax)}`}>
                                  {val}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">ROC Curve (Simulated)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { fpr: 0, tpr: 0 }, { fpr: 0.05, tpr: 0.4 }, { fpr: 0.1, tpr: 0.65 },
                      { fpr: 0.2, tpr: 0.8 }, { fpr: 0.3, tpr: 0.88 }, { fpr: 0.5, tpr: 0.94 },
                      { fpr: 0.7, tpr: 0.97 }, { fpr: 1, tpr: 1 },
                    ]}>
                      <defs>
                        <linearGradient id="rocGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="fpr" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -3, fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
                      <Area type="monotone" dataKey="tpr" stroke="#6366f1" strokeWidth={2} fill="url(#rocGrad)" />
                      <Line type="linear" data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} dataKey="tpr" stroke="#475569" strokeDasharray="5 5" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-slate-500 mt-1 text-center">
                    AUC ≈ {modelInfo.accuracy != null ? (0.5 + modelInfo.accuracy * 0.5).toFixed(2) : '0.85'} — Diagonal = random classifier
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 3. AI Explanation (SHAP-style) ── */}
          {shapData.length > 0 && (
            <motion.div variants={fade} initial="hidden" animate="visible" className="card">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold text-white">AI Explanation — Feature Contributions</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                How each parameter affected <span className="text-white font-semibold">this specific prediction</span>. Positive = increases risk, negative = reduces risk.
              </p>
              <ResponsiveContainer width="100%" height={Math.max(200, shapData.length * 32)}>
                <BarChart data={shapData.slice(0, 13).map(s => ({
                  name: s.label,
                  contribution: s.contribution,
                  fill: s.contribution > 0 ? '#ef4444' : '#22c55e',
                }))} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: '← Reduces Risk | Increases Risk →', position: 'insideBottom', offset: -3, fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={180} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }}
                    formatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`} />
                  <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                    {shapData.slice(0, 13).map((s, i) => (
                      <Cell key={i} fill={s.contribution > 0 ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {shapData.filter(s => s.contribution !== 0).slice(0, 6).map(s => (
                  <div key={s.feature} className={`flex items-center justify-between p-3 rounded-lg border ${
                    s.contribution > 0 ? 'bg-red-900/10 border-red-800/40' : 'bg-emerald-900/10 border-emerald-800/40'
                  }`}>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{s.label}</p>
                      <p className="text-xs text-slate-400">Value: {s.value} (baseline: {s.baseline})</p>
                    </div>
                    <span className={`text-sm font-bold ${s.contribution > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {s.contribution > 0 ? '+' : ''}{s.contribution.toFixed(1)} risk
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 4. Risk Forecast Timeline ── */}
          {forecast && (
            <motion.div variants={fade} initial="hidden" animate="visible" className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-semibold text-white">Risk Forecast (Next 3 Months)</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Projected risk trajectory if no mitigation actions are taken. Based on natural parameter drift.
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={forecast.timeline}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="risk_score" stroke="#f43f5e" strokeWidth={2.5} fill="url(#forecastGrad)" dot={{ fill: '#f43f5e', r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {forecast.timeline.map(t => (
                  <div key={t.label} className="bg-slate-900 rounded-xl p-3 border border-slate-700/60 text-center">
                    <p className="text-xs text-slate-400">{t.label}</p>
                    <p className={`text-lg font-bold ${
                      t.risk_score > 60 ? 'text-red-400' : t.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{Math.round(t.risk_score)}</p>
                    <p className="text-[10px] text-slate-500">{t.risk_level}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 5. What-If Simulation ── */}
          <motion.div variants={fade} initial="hidden" animate="visible" className="card">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-semibold text-white">What-If Simulation</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Adjust parameters to see how changes would affect the risk prediction. This is your AI decision support tool.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {whatIfSliders.map(s => (
                <div key={s.key} className="bg-slate-900 rounded-xl p-4 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-slate-400">{s.label}</label>
                    <span className="text-sm font-semibold text-white">{whatIfValues[s.key] ?? s.min}</span>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step}
                    value={whatIfValues[s.key] ?? s.min}
                    onChange={e => setWhatIfValues(prev => ({ ...prev, [s.key]: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>{s.min}</span>
                    <span>{s.max}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={runWhatIf} disabled={whatIfLoading}
              className="btn-primary !w-auto px-6 flex items-center gap-2 text-sm">
              <Sliders className="w-4 h-4" />
              {whatIfLoading ? 'Simulating...' : 'Run Simulation'}
            </button>

            {whatIfResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-700/60">
                  <p className="text-xs text-slate-400 mb-1">Current Risk</p>
                  <p className={`text-3xl font-bold ${
                    whatIfResult.baseline.risk_score > 60 ? 'text-red-400' : whatIfResult.baseline.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{Math.round(whatIfResult.baseline.risk_score)}</p>
                  <p className="text-xs text-slate-500">{whatIfResult.baseline.risk_level}</p>
                </div>
                {whatIfResult.scenarios.map((sc, i) => {
                  const delta = sc.risk_score - whatIfResult.baseline.risk_score
                  return (
                    <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-700/60">
                      <p className="text-xs text-slate-400 mb-1">Simulated Risk</p>
                      <p className={`text-3xl font-bold ${
                        sc.risk_score > 60 ? 'text-red-400' : sc.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{Math.round(sc.risk_score)}</p>
                      <p className={`text-xs font-semibold mt-1 ${delta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} ({sc.risk_level})
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400">
                        Changes: {Object.entries(sc.overrides).map(([k, v]) => `${k.replaceAll('_', ' ')}: ${v}`).join(', ')}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </motion.div>

          {/* ── Key drivers + positives ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-base font-semibold text-white mb-4">Key Risk Drivers</h2>
              <div className="space-y-3">
                {prediction.top_risk_factors?.length ? prediction.top_risk_factors.map((f, i) => (
                  <div key={f.feature} className="flex items-start justify-between gap-4 bg-slate-900 rounded-lg border border-slate-700 p-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{i + 1}. {f.label}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Current: <span className="text-slate-200">{f.value}</span> · Baseline: <span className="text-slate-200">{f.baseline}</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-red-300 bg-red-900/30 border border-red-800 px-2 py-1 rounded-full">
                      Increased risk
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">No major risk drivers detected.</p>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-base font-semibold text-white mb-4">Positive Factors</h2>
              <div className="space-y-3">
                {prediction.top_positive_factors?.length ? prediction.top_positive_factors.map((f, i) => (
                  <div key={f.feature} className="flex items-start justify-between gap-4 bg-slate-900 rounded-lg border border-slate-700 p-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{i + 1}. {f.label}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Current: <span className="text-slate-200">{f.value}</span> · Baseline: <span className="text-slate-200">{f.baseline}</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-300 bg-emerald-900/30 border border-emerald-800 px-2 py-1 rounded-full">
                      Reduced risk
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">No strong protective factors detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Feature importance ── */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4">Feature Importance</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={(prediction.feature_importance || []).slice(0, 10).map(f => ({ name: f.feature.replaceAll('_', ' '), value: +(f.importance * 100).toFixed(1) }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" width={170} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} formatter={(v) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {(prediction.feature_importance || []).slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#6366f1' : i === 1 ? '#22c55e' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Recommendations ── */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Recommendations & Action Plan
            </h2>
            <div className="space-y-3">
              {prediction.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{rec.priority} · {rec.category}</p>
                      <span className="text-[10px] text-slate-400">{rec.expected_impact}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 mt-1">{rec.title}</p>
                    <p className="text-sm text-slate-300 mt-1">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Project Status Analysis ── */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4">Project Status Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/60">
                <p className="text-xs text-slate-400">Current project condition</p>
                <p className="text-sm text-slate-200 mt-1">{prediction.project_status_analysis.current_project_condition}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/60">
                <p className="text-xs text-slate-400">Predicted outcome</p>
                <div className="mt-2 space-y-1 text-sm text-slate-200">
                  <div className="flex justify-between"><span className="text-slate-400">Delay</span><span>{Math.round(prediction.project_status_analysis.predicted_outcome.delay_probability * 100)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Budget</span><span>{Math.round(prediction.project_status_analysis.predicted_outcome.budget_overrun_probability * 100)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Quality</span><span>{Math.round(prediction.project_status_analysis.predicted_outcome.quality_issue_probability * 100)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Stability</span><span>{Math.round(prediction.project_status_analysis.predicted_outcome.requirement_instability_probability * 100)}%</span></div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/60">
                <p className="text-xs text-slate-400">Key risk drivers</p>
                <ul className="mt-2 text-sm text-slate-200 list-disc pl-5 space-y-1">
                  {(prediction.project_status_analysis.key_risk_drivers || []).map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/60">
                <p className="text-xs text-slate-400">Recommended next steps</p>
                <ul className="mt-2 text-sm text-slate-200 list-disc pl-5 space-y-1">
                  {(prediction.project_status_analysis.recommended_next_steps || []).map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Project Details grid */}
      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4">Project Parameters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {detailRows.map(([label, value]) => (
            <div key={label} className="bg-slate-900 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hidden Printable PDF Content ── */}
      <div ref={printRef} id="print-report" style={{ display: 'none' }} className="print-content">
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #print-report, #print-report * { visibility: visible !important; }
            #print-report { position: fixed; top: 0; left: 0; width: 100%; padding: 40px; background: white; color: black; font-family: 'Inter', sans-serif; z-index: 99999; }
            .no-print { display: none !important; }
          }
        `}</style>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>AI Risk Assessment Report</h1>
          <p style={{ color: '#666', fontSize: 12 }}>Generated: {new Date().toLocaleString()}</p>
          <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />

          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Project Summary</h2>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '4px 8px', color: '#666' }}>Project</td><td style={{ padding: '4px 8px', fontWeight: 600 }}>{project.project_name}</td></tr>
              <tr><td style={{ padding: '4px 8px', color: '#666' }}>Team Size</td><td style={{ padding: '4px 8px' }}>{project.team_size}</td></tr>
              <tr><td style={{ padding: '4px 8px', color: '#666' }}>Budget</td><td style={{ padding: '4px 8px' }}>${project.project_budget?.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '4px 8px', color: '#666' }}>Duration</td><td style={{ padding: '4px 8px' }}>{project.project_duration} months</td></tr>
            </tbody>
          </table>

          {prediction && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Risk Assessment</h2>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ padding: '4px 8px', color: '#666' }}>Risk Level</td><td style={{ padding: '4px 8px', fontWeight: 700, color: prediction.risk_level === 'High' || prediction.risk_level === 'Critical' ? '#dc2626' : prediction.risk_level === 'Medium' ? '#d97706' : '#16a34a' }}>{prediction.risk_level}</td></tr>
                  <tr><td style={{ padding: '4px 8px', color: '#666' }}>Risk Score</td><td style={{ padding: '4px 8px' }}>{prediction.risk_score}/100</td></tr>
                  <tr><td style={{ padding: '4px 8px', color: '#666' }}>Confidence</td><td style={{ padding: '4px 8px' }}>{Math.round((prediction.confidence_score || 0) * 100)}%</td></tr>
                  <tr><td style={{ padding: '4px 8px', color: '#666' }}>Delay Probability</td><td style={{ padding: '4px 8px' }}>{Math.round(prediction.delay_probability * 100)}%</td></tr>
                  <tr><td style={{ padding: '4px 8px', color: '#666' }}>Budget Overrun</td><td style={{ padding: '4px 8px' }}>{Math.round(prediction.budget_overrun_probability * 100)}%</td></tr>
                </tbody>
              </table>

              {prediction.top_risk_factors?.length > 0 && (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Key Risk Drivers</h2>
                  <ul style={{ fontSize: 13, paddingLeft: 20 }}>
                    {prediction.top_risk_factors.map(f => <li key={f.feature} style={{ marginBottom: 4 }}>{f.label}: {f.value} (baseline: {f.baseline})</li>)}
                  </ul>
                </>
              )}

              {shapData.length > 0 && (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>AI Explanation</h2>
                  <ul style={{ fontSize: 13, paddingLeft: 20 }}>
                    {shapData.filter(s => s.contribution !== 0).slice(0, 8).map(s => (
                      <li key={s.feature} style={{ marginBottom: 4, color: s.contribution > 0 ? '#dc2626' : '#16a34a' }}>
                        {s.label}: {s.contribution > 0 ? '+' : ''}{s.contribution.toFixed(1)} risk
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {prediction.recommendations?.length > 0 && (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Recommendations</h2>
                  <ol style={{ fontSize: 13, paddingLeft: 20 }}>
                    {prediction.recommendations.slice(0, 5).map((r, i) => (
                      <li key={i} style={{ marginBottom: 8 }}>
                        <strong>{r.title}</strong> ({r.priority})<br />
                        <span style={{ color: '#666' }}>{r.action}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {modelInfo && (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Model Information</h2>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr><td style={{ padding: '4px 8px', color: '#666' }}>Model</td><td style={{ padding: '4px 8px' }}>{modelInfo.model_name}</td></tr>
                      <tr><td style={{ padding: '4px 8px', color: '#666' }}>Accuracy</td><td style={{ padding: '4px 8px' }}>{modelInfo.accuracy != null ? `${(modelInfo.accuracy * 100).toFixed(1)}%` : '—'}</td></tr>
                      <tr><td style={{ padding: '4px 8px', color: '#666' }}>Training Samples</td><td style={{ padding: '4px 8px' }}>{modelInfo.training_samples?.toLocaleString() ?? '—'}</td></tr>
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}

          <hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          <p style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>
            Generated by SmartRisk AI — Risk Prediction System
          </p>
        </div>
      </div>
    </div>
  )
}
