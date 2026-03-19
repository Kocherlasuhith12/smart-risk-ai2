import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FolderOpen, PlusCircle,
  BarChart2, History, LogOut, Brain, Database
} from 'lucide-react'

const links = [
  { to: '/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/projects',   label: 'My Projects',       icon: FolderOpen },
  { to: '/add-project',label: 'Add Project',       icon: PlusCircle },
  { to: '/reports',    label: 'Reports',           icon: BarChart2 },
  { to: '/analytics',  label: 'Dataset Analytics', icon: Database },
  { to: '/history',    label: 'History',           icon: History },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const accounts = useMemo(() => {
    try {
      const raw = localStorage.getItem('accounts')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter(a => a?.email) : []
    } catch {
      return []
    }
  }, [switcherOpen])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSwitcherOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const switchToAccount = (acctEmail) => {
    // Log out current session, then prefill email on login screen.
    logout()
    localStorage.setItem('prefill_email', acctEmail)
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-700 flex flex-col relative">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">SmartRisk AI</p>
          <p className="text-xs text-slate-500">Risk Prediction System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          // Simple role-based visibility on frontend
          if (label === 'Add Project' && !['admin', 'project_manager', 'team_lead'].includes(user?.role)) {
            return null
          }
          if (label === 'Reports' && !['admin', 'project_manager', 'risk_analyst'].includes(user?.role)) {
            return null
          }
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                   : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700">
        <button
          type="button"
          onClick={() => setSwitcherOpen(v => !v)}
          className="flex items-center gap-3 mb-3 w-full text-left hover:bg-slate-800/70 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 truncate max-w-[120px]">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role || 'Switch account'}
            </p>
          </div>
        </button>

        {switcherOpen && (
          <>
            <button
              type="button"
              aria-label="Close account switcher"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setSwitcherOpen(false)}
            />
            <div className="absolute bottom-16 left-4 right-4 z-50 rounded-xl border border-slate-700 bg-slate-950/95 shadow-xl shadow-slate-950/60 backdrop-blur">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-100">Accounts on this device</p>
                <p className="text-[11px] text-slate-400">
                  {accounts.length} saved {accounts.length === 1 ? 'account' : 'accounts'}
                </p>
              </div>
              <div className="max-h-56 overflow-auto p-2">
                {accounts.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-slate-400">
                    No saved accounts yet. Log in to store accounts for quick switching.
                  </div>
                ) : (
                  accounts.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => switchToAccount(a.email)}
                      className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-100">{a.name || a.email}</p>
                          <p className="truncate text-[11px] text-slate-400">{a.email}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 ring-1 ring-slate-800 capitalize">
                          {a.role || 'user'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-3 py-2 border-t border-slate-800">
                <p className="text-[11px] text-slate-400">
                  Select an account to switch (you’ll be taken to the login screen).
                </p>
              </div>
            </div>
          </>
        )}

        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm w-full px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
