import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkAdminRole(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !data || data.role !== 'admin') {
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await checkAdminRole(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
      setIsAdmin(false)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

