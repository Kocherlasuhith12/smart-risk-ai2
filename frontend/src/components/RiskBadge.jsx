export default function RiskBadge({ level, score }) {
  const styles = {
    Critical: 'text-fuchsia-300 bg-fuchsia-900/30 border border-fuchsia-700/60',
    High:   'risk-high',
    Medium: 'risk-medium',
    Low:    'risk-low',
  }

  const dot =
    level === 'Critical' ? 'bg-fuchsia-300' :
    level === 'High' ? 'bg-red-400' :
    level === 'Medium' ? 'bg-yellow-400' :
    level === 'Low' ? 'bg-green-400' :
    'bg-slate-400'

  const scoreLabel =
    score === undefined || score === null
      ? ''
      : score > 10
        ? ` (${Math.round(score)}/100)`
        : ` (${score}/10)`

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${styles[level] || 'bg-slate-700 text-slate-300'}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {level} Risk{scoreLabel}
    </span>
  )
}
