import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { InviteCode, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { X, Copy, Check, UserX } from 'lucide-react'

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { profile } = useAuth()
  const [invites, setInvites] = useState<InviteCode[]>([])
  const [members, setMembers] = useState<Profile[]>([])
  const [newCode, setNewCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'invites' | 'members'>('invites')

  useEffect(() => {
    loadInvites()
    loadMembers()
  }, [])

  const loadInvites = async () => {
    const { data } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setInvites(data as InviteCode[])
  }

  const loadMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMembers(data as Profile[])
  }

  const generateInvite = async () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                 '-' + 
                 Math.random().toString(36).substring(2, 6).toUpperCase()
    
    const { error } = await supabase
      .from('invite_codes')
      .insert({
        code,
        created_by: profile?.id
      })
    
    if (!error) {
      setNewCode(code)
      loadInvites()
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(newCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const deactivateMember = async (_memberId: string) => {
    if (!confirm('Remove this member from the community?')) return
    alert('Member removal requires Supabase dashboard action for full auth revocation. Profile access can be restricted via RLS.')
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-charcoal-dark border border-bronze/30 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-bronze/20">
          <h2 className="text-xl font-serif text-bronze">Administration</h2>
          <button onClick={onClose} className="text-parchment/50 hover:text-parchment">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-bronze/20">
          <button
            onClick={() => setTab('invites')}
            className={`flex-1 py-3 text-sm ${tab === 'invites' ? 'text-bronze border-b-2 border-bronze' : 'text-parchment/60'}`}
          >
            Invites
          </button>
          <button
            onClick={() => setTab('members')}
            className={`flex-1 py-3 text-sm ${tab === 'members' ? 'text-bronze border-b-2 border-bronze' : 'text-parchment/60'}`}
          >
            Members
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'invites' && (
            <div className="space-y-4">
              <button
                onClick={generateInvite}
                className="w-full py-2.5 bg-bronze text-charcoal font-medium rounded-lg hover:bg-bronze-light"
              >
                Generate Invite Code
              </button>
              {newCode && (
                <div className="flex items-center gap-2 p-3 bg-charcoal-light rounded-lg">
                  <code className="flex-1 text-bronze font-mono">{newCode}</code>
                  <button onClick={copyCode} className="text-parchment/70 hover:text-parchment">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              )}
              <div className="space-y-2">
                {invites.map(inv => (
                  <div key={inv.code} className="flex justify-between text-sm py-2 border-b border-bronze/10">
                    <code className="text-parchment/80">{inv.code}</code>
                    <span className="text-parchment/40 text-xs">
                      {inv.used_by ? 'Used' : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'members' && (
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-bronze/10">
                  <div>
                    <div className="text-sm font-medium">{m.display_name}</div>
                    <div className="text-xs text-parchment/40 capitalize">{m.role}</div>
                  </div>
                  {m.role !== 'admin' && (
                    <button
                      onClick={() => deactivateMember(m.id)}
                      className="text-ember/70 hover:text-ember"
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
