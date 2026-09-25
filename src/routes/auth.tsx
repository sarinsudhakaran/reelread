import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { isConfigured } from '../lib/supabase'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const { session, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      navigate({ to: '/library' })
    }
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Reelread</h1>
            <p className="text-[#F2F2F0]/60">Read PDFs like Instagram Reels</p>
          </div>
          <div className="bg-[#1A1A1D] rounded-lg p-6 border border-[#F4B860]/30">
            <p className="text-sm text-[#F2F2F0] mb-4">
              ⚙️ To get started, set up your Supabase project:
            </p>
            <ol className="text-xs text-[#F2F2F0]/70 space-y-2 list-decimal list-inside">
              <li>Create a Supabase project at supabase.com</li>
              <li>Run the SQL schema from SUPABASE_SCHEMA.sql in your project</li>
              <li>Create a storage bucket named "documents"</li>
              <li>Copy your URL and Anon Key to .env</li>
              <li>Restart the dev server</li>
            </ol>
            <div className="mt-4 p-3 bg-[#0E0E10] rounded text-xs font-mono text-[#F2F2F0]/50">
              VITE_SUPABASE_URL=<br />
              VITE_SUPABASE_ANON_KEY=
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Reelread</h1>
          <p className="text-[#F2F2F0]/60">Read PDFs like Instagram Reels</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1A1A1D] border border-[#F2F2F0]/10 focus:outline-none focus:border-[#F4B860]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1A1A1D] border border-[#F2F2F0]/10 focus:outline-none focus:border-[#F4B860]"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#F4B860] text-[#0E0E10] font-semibold rounded-lg hover:bg-[#F4B860]/80 disabled:opacity-50"
          >
            {loading
              ? 'Loading...'
              : isSignUp
                ? 'Sign Up'
                : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 py-2 text-sm text-[#F2F2F0]/60 hover:text-[#F2F2F0]"
        >
          {isSignUp ? 'Have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  )
}
