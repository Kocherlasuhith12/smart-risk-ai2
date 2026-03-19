import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsAPI } from '../services/api'

const fields = [
  { key: 'project_name',                 label: 'Project Name',                  type: 'text',   placeholder: 'e.g. E-Commerce Platform' },
  { key: 'team_size',                    label: 'Team Size',                      type: 'number', placeholder: '1–50', min: 1, max: 100 },
  { key: 'project_budget',              label: 'Project Budget ($)',              type: 'number', placeholder: 'e.g. 250000', min: 0 },
  { key: 'project_duration',            label: 'Project Duration (months)',       type: 'number', placeholder: '1–36', min: 1, max: 60 },
  { key: 'requirement_change_count',    label: 'Requirement Changes (#)',         type: 'number', placeholder: '0–50', min: 0 },
  { key: 'average_sprint_delay',        label: 'Avg Sprint Delay (days)',         type: 'number', placeholder: '0–15', min: 0, step: '0.1' },
  { key: 'bug_count',                   label: 'Bug Count (#)',                   type: 'number', placeholder: '0–300', min: 0 },
  { key: 'testing_coverage',            label: 'Testing Coverage (%)',            type: 'number', placeholder: '0–100', min: 0, max: 100 },
  { key: 'code_complexity',             label: 'Code Complexity (1–10)',          type: 'number', placeholder: '1–10', min: 1, max: 10 },
  { key: 'developer_experience',        label: 'Avg Developer Experience (yrs)',  type: 'number', placeholder: '0.5–20', min: 0, step: '0.1' },
  { key: 'communication_frequency',     label: 'Communication Frequency (mtgs/wk)', type: 'number', placeholder: '1–10', min: 1, max: 10 },
  { key: 'task_completion_rate',        label: 'Task Completion Rate (%)',        type: 'number', placeholder: '0–100', min: 0, max: 100 },
  { key: 'client_change_requests',      label: 'Client Change Requests (#)',      type: 'number', placeholder: '0–30', min: 0 },
  { key: 'previous_project_success_rate', label: 'Past Project Success Rate (%)', type: 'number', placeholder: '0–100', min: 0, max: 100 },
]

const defaultForm = {}
fields.forEach(f => defaultForm[f.key] = '')

export default function AddProject() {
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      // Convert numbers
      fields.forEach(f => {
        if (f.type === 'number') payload[f.key] = Number(payload[f.key])
      })
      const res = await projectsAPI.create(payload)
      navigate(`/projects/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add New Project</h1>
        <p className="text-slate-400 text-sm mt-1">Enter project details to enable AI risk prediction</p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.key === 'project_name' ? 'md:col-span-2' : ''}>
                <label className="label">{f.label}</label>
                <input
                  type={f.type}
                  className="input-field"
                  placeholder={f.placeholder}
                  min={f.min}
                  max={f.max}
                  step={f.step || (f.type === 'number' ? '1' : undefined)}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Hint */}
      <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-800 rounded-xl text-sm text-indigo-300">
        💡 After creating the project, you can run the AI risk analysis from the project detail page.
      </div>
    </div>
  )
}
