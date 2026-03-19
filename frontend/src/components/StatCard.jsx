export default function StatCard({ label, value, icon: Icon, color = 'indigo' }) {
  const colors = {
    indigo: 'text-indigo-400 bg-indigo-900/30',
    red:    'text-red-400 bg-red-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
    green:  'text-green-400 bg-green-900/30',
    slate:  'text-slate-400 bg-slate-700',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  )
}
