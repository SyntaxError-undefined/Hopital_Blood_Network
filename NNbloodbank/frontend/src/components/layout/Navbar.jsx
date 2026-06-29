import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, Search, LogOut, ChevronDown, Settings } from 'lucide-react'
import { getUnreadCount } from '@/services/notifications'
import { getProfile } from '@/services/auth'
import { useAuth } from '@/hooks'
import { cn } from '@/utils'

export function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [profile, setProfile] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    getUnreadCount().then(setUnreadCount)
    getProfile().then(setProfile)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/90 px-4 shadow-navbar backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-text-muted transition-colors hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-text">{profile?.hospital?.name || 'Selected Hospital'}</h2>
          <p className="text-xs text-text-muted">{profile?.hospital?.location || 'Network'}</p>
        </div>
      </div>

      <div className="hidden items-center md:flex">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            placeholder="Quick search..."
            className="h-9 w-56 rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-4 text-sm text-text placeholder:text-text-light transition-all focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 lg:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden text-right lg:block">
          <p className="text-xs font-medium text-text">{formattedDate}</p>
          <p className="text-xs text-text-muted">{formattedTime}</p>
        </div>

        <button
          onClick={() => navigate('/alerts')}
          className="relative rounded-xl p-2.5 text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={cn(
              'flex items-center gap-2 rounded-xl p-1.5 transition-colors',
              showProfile ? 'bg-gray-100' : 'hover:bg-gray-100'
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {initials(profile?.name || 'Blood Bank Manager')}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight text-text">{profile?.name || 'Blood Bank Manager'}</p>
              <p className="text-[11px] text-text-muted">{profile?.role || 'Blood Bank Manager'}</p>
            </div>
            <ChevronDown className={cn('hidden h-4 w-4 text-text-muted transition-transform md:block', showProfile && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-elevated"
                >
                  <button
                    onClick={() => { navigate('/profile'); setShowProfile(false) }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text transition-colors hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 text-text-muted" />
                    Profile & Settings
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-critical transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BB'
}
