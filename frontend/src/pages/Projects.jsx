import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsAPI } from '../services/api'
import RiskBadge from '../components/RiskBadge'
import { PlusCircle, Search } from 'lucide-react'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    projectsAPI.list().then(r => setProjects(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p =>
    p.project_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} total projects</p>
        </div>
        <Link to="/add-project" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircle className="w-4 h-4" /> Add Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          className="input-field pl-10 max-w-sm"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-400 mb-4">No projects found</p>
          <Link to="/add-project" className="btn-primary text-sm">Create your first project</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card hover:border-indigo-600/50 transition-colors cursor-pointer block">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white text-sm leading-tight max-w-[70%]">{p.project_name}</h3>
                {p.predicted_risk
                  ? <RiskBadge level={p.predicted_risk} />
                  : <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded-full">Unanalysed</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div><span className="text-slate-500">Team:</span> {p.team_size} devs</div>
                <div><span className="text-slate-500">Budget:</span> ${(p.project_budget / 1000).toFixed(0)}k</div>
                <div><span className="text-slate-500">Duration:</span> {p.project_duration} mo</div>
                <div><span className="text-slate-500">Bugs:</span> {p.bug_count}</div>
              </div>
              {p.risk_score && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Risk Score</span>
                    <span className={`font-bold ${p.predicted_risk === 'High' ? 'text-red-400' : p.predicted_risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {p.risk_score}/10
                    </span>
                  </div>
                  <div className="mt-1 bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${p.predicted_risk === 'High' ? 'bg-red-500' : p.predicted_risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${(p.risk_score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600 mt-3">{new Date(p.created_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
