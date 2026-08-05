import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const { isDark } = useTheme()

  return (
    <div className={`flex min-h-screen transition-colors duration-200
      ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}
    >
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
