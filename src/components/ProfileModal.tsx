import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { X } from 'lucide-react'

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio: bio || null })
      .eq('id', profile.id)
    
    if (!error) {
      await refreshProfile()
      onClose()
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-charcoal-dark border border-bronze/30 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-bronze/20">
          <h2 className="text-xl font-serif text-bronze">Profile</h2>
          <button onClick={onClose} className="text-parchment/50 hover:text-parchment">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Display Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze"
            />
          </div>
          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-bronze text-charcoal font-medium rounded-lg hover:bg-bronze-light disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
