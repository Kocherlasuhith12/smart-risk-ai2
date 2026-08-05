import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import {
  LayoutDashboard, FolderOpen, PlusCircle,
  BarChart2, History, LogOut, Database, User
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
  const { isDark } = useTheme()
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
    logout()
    localStorage.setItem('prefill_email', acctEmail)
    navigate('/login')
  }

  return (
    <aside className={`w-64 min-h-screen flex flex-col relative border-r transition-colors duration-200
      ${isDark
        ? 'bg-slate-950 border-emerald-950/60'
        : 'bg-white border-gray-200'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-5 border-b transition-colors duration-200
        ${isDark ? 'border-emerald-950/60' : 'border-gray-200'}`}
      >
        <Logo size={36} />
        <div>
          <p className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>SmartRisk AI</p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Risk Prediction System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
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
                   ? isDark
                     ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                     : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                   : isDark
                     ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                     : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                 }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* User section */}
      <div className={`px-4 py-4 border-t transition-colors duration-200 ${isDark ? 'border-emerald-950/60' : 'border-gray-200'}`}>
        {/* Profile link */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 mb-2 w-full text-left rounded-lg px-2 py-2 transition-colors
             ${isActive
               ? isDark
                 ? 'bg-emerald-600/20 border border-emerald-600/30'
                 : 'bg-emerald-50 border border-emerald-200'
               : isDark
                 ? 'hover:bg-slate-900/70'
                 : 'hover:bg-gray-100'
             }`
          }
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate max-w-[120px] ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{user?.name}</p>
            <p className={`text-xs capitalize ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              {user?.role || 'Member'}
            </p>
          </div>
          <User className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
        </NavLink>

        {/* Account switcher */}
        <button
          type="button"
          onClick={() => setSwitcherOpen(v => !v)}
          className={`w-full text-left text-xs px-3 py-1.5 rounded-lg mb-2 transition-colors
            ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/70' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          Switch account
        </button>

        {switcherOpen && (
          <>
            <button
              type="button"
              aria-label="Close account switcher"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setSwitcherOpen(false)}
            />
            <div className={`absolute bottom-20 left-4 right-4 z-50 rounded-xl border shadow-xl backdrop-blur transition-colors duration-200
              ${isDark
                ? 'border-emerald-950/60 bg-slate-950/95 shadow-black/80'
                : 'border-gray-200 bg-white/95 shadow-gray-300/50'
              }`}
            >
              <div className={`px-3 py-2 border-b ${isDark ? 'border-emerald-950/60' : 'border-gray-200'}`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Accounts on this device</p>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {accounts.length} saved {accounts.length === 1 ? 'account' : 'accounts'}
                </p>
              </div>
              <div className="max-h-56 overflow-auto p-2">
                {accounts.length === 0 ? (
                  <div className={`px-2 py-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    No saved accounts yet. Log in to store accounts for quick switching.
                  </div>
                ) : (
                  accounts.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => switchToAccount(a.email)}
                      className={`w-full rounded-lg px-2 py-2 text-left transition-colors
                        ${isDark ? 'hover:bg-slate-900' : 'hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`truncate text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{a.name || a.email}</p>
                          <p className={`truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{a.email}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ring-1 capitalize
                          ${isDark
                            ? 'bg-slate-900 text-slate-300 ring-slate-800'
                            : 'bg-gray-100 text-gray-600 ring-gray-200'
                          }`}
                        >
                          {a.role || 'user'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className={`px-3 py-2 border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Select an account to switch (you'll be taken to the login screen).
                </p>
              </div>
            </div>
          </>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-sm w-full px-3 py-2 rounded-lg transition-colors
            ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-900' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
