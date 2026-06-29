import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ArrowLeftRight,
  Map,
  Bell,
  BarChart3,
  Settings,
  Droplets,
  X,
} from 'lucide-react'
import { cn } from '@/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/network', icon: Map, label: 'Network' },
  { to: '/alerts', icon: Bell, label: 'Alerts', badge: true },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: Settings, label: 'Settings' },
]

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Droplets className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight text-text">JeevanSetu</h1>
              <p className="text-[10px] font-medium text-text-light">Blood Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/[0.08] text-primary'
                    : 'text-text-muted hover:bg-gray-50 hover:text-text'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
                  )}
                  <item.icon
                    className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-primary' : 'text-text-light group-hover:text-text-muted')}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-light">Powered by AI</p>
            <p className="mt-1 text-sm font-semibold text-text">Hospital Blood Network</p>
            <p className="mt-2 text-[11px] text-text-light">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
