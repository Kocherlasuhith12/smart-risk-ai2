import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsAPI } from '../services/api'
import RiskBadge from '../components/RiskBadge'
import { History as HistoryIcon } from 'lucide-react'

export default function History() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectsAPI.list().then(r => setProjects(r.data.filter(p => p.predicted_risk))).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prediction History</h1>
        <p className="text-slate-400 text-sm mt-1">All projects that have been AI-analysed</p>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-2">No predictions yet</p>
          <p className="text-slate-500 text-sm">Go to a project and click "Run AI Analysis"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card flex items-center justify-between hover:border-indigo-600/50 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold text-white">{p.project_name}</p>
                <div className="flex gap-4 text-xs text-slate-400 mt-1">
                  <span>Team: {p.team_size}</span>
                  <span>Budget: ${(p.project_budget / 1000).toFixed(0)}k</span>
                  <span>Duration: {p.project_duration}mo</span>
                  <span className="text-slate-600">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <RiskBadge level={p.predicted_risk} score={p.risk_score} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
