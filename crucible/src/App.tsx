import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import ChannelView from './pages/ChannelView'
import { supabase, type Channel } from './lib/supabase'

function App() {
  const { user, profile, loading } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    if (user && profile) {
      loadChannels()
    }
  }, [user, profile])

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (!error && data) {
      setChannels(data as Channel[])
      // Default to welcome or first channel
      const welcome = data.find(c => c.slug === 'welcome')
      setCurrentChannel(welcome || data[0] || null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <div className="text-parchment text-lg">Loading The Crucible...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  return (
    <Layout
      channels={channels}
      currentChannel={currentChannel}
      onSelectChannel={setCurrentChannel}
    >
      {currentChannel ? (
        <ChannelView channel={currentChannel} />
      ) : (
        <div className="flex items-center justify-center h-full text-parchment/70">
          Select a channel to begin
        </div>
      )}
    </Layout>
  )
}

export default App
