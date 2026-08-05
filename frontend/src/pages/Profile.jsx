import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LogOut, Sun, Moon, User, Mail, Shield } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const { theme, setTheme, isDark } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 theme-text-primary">Profile</h1>

      {/* User Info Card */}
      <div className="theme-card rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-600/30">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold theme-text-primary">{user?.name || 'User'}</h2>
            <p className="text-sm theme-text-secondary capitalize">{user?.role || 'Member'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs theme-text-muted">Full Name</p>
              <p className="text-sm font-medium theme-text-primary">{user?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs theme-text-muted">Email</p>
              <p className="text-sm font-medium theme-text-primary">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs theme-text-muted">Role</p>
              <p className="text-sm font-medium theme-text-primary capitalize">{user?.role || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="theme-card rounded-2xl p-8 mb-6">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">Appearance</h3>
        <p className="text-sm theme-text-secondary mb-5">Choose your preferred color theme</p>
        <div className="flex gap-4">
          {/* Dark Theme Button */}
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
              ${isDark
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white'}`}>
              <Moon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-gray-700'}`}>
              Dark Black
            </span>
            {isDark && (
              <span className="text-xs text-emerald-400 font-medium">Active</span>
            )}
          </button>

          {/* Light Theme Button */}
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
              ${!isDark
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!isDark ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              <Sun className="w-6 h-6" />
            </div>
            <span className={`text-sm font-semibold ${!isDark ? 'text-emerald-600' : 'text-slate-400'}`}>
              Pure White
            </span>
            {!isDark && (
              <span className="text-xs text-emerald-500 font-medium">Active</span>
            )}
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors shadow-lg shadow-red-600/20"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  )
}
