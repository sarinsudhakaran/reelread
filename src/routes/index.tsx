import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../lib/auth-context'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      navigate({ to: session ? '/library' : '/auth', replace: true })
    }
  }, [session, loading, navigate])

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-[#F2F2F0]/60">Loading...</p>
    </div>
  )
}
