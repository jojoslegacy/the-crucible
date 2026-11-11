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

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            invite_code: inviteCode.trim().toUpperCase()
          }
        }
      })

      if (signupError) throw signupError
      if (!data.user) throw new Error('Supabase did not confirm account creation. Please try again.')

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account. Check your invitation code and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-shell min-h-screen flex items-center justify-center px-4">
        <div className="auth-content text-center max-w-md">
          <img src="/images/app-icon.png" alt="The Crucible forge emblem" className="auth-mark" />
          <h2 className="text-2xl font-serif text-bronze mb-4">Welcome to The Crucible</h2>
          <p className="text-parchment/80 mb-6">
            Your account has been created. Check your email to confirm your account, then return here to sign in.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="px-6 py-2.5 bg-bronze text-charcoal rounded-lg font-medium"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center px-4">
      <div className="auth-content w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/app-icon.png" alt="The Crucible forge emblem" className="auth-mark" />
          <h1 className="text-4xl font-serif text-bronze tracking-wider">THE CRUCIBLE</h1>
          <p className="text-parchment/70 mt-2 text-sm">Join with your invite code</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="XXXX-XXXX"
              className="w-full px-4 py-3 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze uppercase tracking-wider"
            />
          </div>

          <div>
            <label className="block text-sm text-parchment/80 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={60}
              autoComplete="name"
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
              autoComplete="email"
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
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze"
            />
          </div>

          {error && <div role="alert" className="text-ember text-sm break-words">{error}</div>}

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
