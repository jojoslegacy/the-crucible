import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface SignupProps {
  onSwitchToLogin: () => void
}

export default function Signup({ onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          invite_code: inviteCode
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-shell min-h-screen flex items-center justify-center px-4">
        <div className="auth-content w-full max-w-md text-center">
          <h2 className="text-2xl font-serif text-bronze mb-3">Check your email</h2>
          <p className="text-parchment/70 text-sm">
            We sent a confirmation link to {email}. Click it to finish joining The Crucible.
          </p>
          <button onClick={onSwitchToLogin} className="mt-6 text-bronze hover:underline text-sm">
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center px-4">
      <div className="auth-content w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-bronze tracking-wider">THE CRUCIBLE</h1>
          <p className="text-parchment/70 mt-2 text-sm tracking-wide">Truth Before Talent.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Invite Code</label>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              className="w-full px-4 py-3 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze uppercase"
              placeholder="XXXX-XXXX"
            />
          </div>
          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze"
            />
          </div>
          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze"
            />
          </div>
          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze"
            />
          </div>

          {error && <div className="text-ember text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-bronze text-charcoal font-medium rounded-lg hover:bg-bronze-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Join The Crucible'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-parchment/60">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-bronze hover:underline">
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
