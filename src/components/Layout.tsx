import { ReactNode, useState } from 'react'
import { Channel } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut, Settings, Users } from 'lucide-react'
import ChannelList from './ChannelList'
import ProfileModal from './ProfileModal'
import AdminPanel from './AdminPanel'

interface LayoutProps {
  channels: Channel[]
  currentChannel: Channel | null
  onSelectChannel: (channel: Channel) => void
  children: ReactNode
}

export default function Layout({ channels, currentChannel, onSelectChannel, children }: LayoutProps) {
  const { profile, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <div className="flex h-screen bg-charcoal overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-charcoal-dark border-r border-bronze/20
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-bronze/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><img src="/images/app-icon.png" alt="" className="sidebar-mark" /><h1 className="text-xl font-serif text-bronze tracking-wider">THE CRUCIBLE</h1></div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-parchment/60 hover:text-parchment"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-parchment/50 mt-1 tracking-wide">Truth Before Talent.</p>
          </div>

          <ChannelList
            channels={channels}
            currentChannel={currentChannel}
            onSelect={(ch) => {
              onSelectChannel(ch)
              setSidebarOpen(false)
            }}
          />

          <div className="mt-auto p-4 border-t border-bronze/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-bronze/30 flex items-center justify-center text-sm font-medium">
                {profile?.display_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{profile?.display_name}</div>
                <div className="text-xs text-parchment/50 capitalize">{profile?.role}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProfile(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-parchment/70 hover:text-parchment hover:bg-charcoal-light rounded"
              >
                <Settings size={14} />
                Profile
              </button>
              {profile?.role === 'admin' && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-parchment/70 hover:text-parchment hover:bg-charcoal-light rounded"
                >
                  <Users size={14} />
                  Admin
                </button>
              )}
              <button
                onClick={signOut}
                className="p-2 text-parchment/50 hover:text-ember hover:bg-charcoal-light rounded"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-bronze/20 bg-charcoal-dark">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-parchment/70 hover:text-parchment"
          >
            <Menu size={22} />
          </button>
          <div>
            <div className="font-medium text-bronze">#{currentChannel?.name || 'Select channel'}</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  )
}
