import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface LoginProps {
  onSwitchToSignup: () => void
}

export default function Login({ onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-bronze tracking-wider">THE CRUCIBLE</h1>
          <p className="text-parchment/70 mt-2 text-sm tracking-wide">Truth Before Talent.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
              className="w-full px-4 py-3 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze"
            />
          </div>

          {error && (
            <div className="text-ember text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-bronze text-charcoal font-medium rounded-lg hover:bg-bronze-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Enter The Crucible'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-parchment/60">
          Have an invite?{' '}
          <button onClick={onSwitchToSignup} className="text-bronze hover:underline">
            Join with invite code
          </button>
        </div>
      </div>
    </div>
  )
}
