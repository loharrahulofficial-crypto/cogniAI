import { NavLink } from 'react-router-dom'
import { LayoutDashboard, User, BookOpen, BarChart3, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Competency Profile' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/quizzes', icon: FileCheck, label: 'Quizzes' },
  { to: '/admin', icon: BarChart3, label: 'Admin' },
]

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-white">
          U
        </div>
        <span className="text-lg font-semibold text-foreground">UNNATI</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">SIH26101 — MoSPI</p>
      </div>
    </aside>
  )
}
