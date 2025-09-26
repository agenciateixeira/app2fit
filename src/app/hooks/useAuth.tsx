'use client'

import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { User } from '@supabase/supabase-js'

interface AuthResult {
  error?: {
    message: string
  }
  user?: User
}

export const useAuth = () => {
  const { supabase, dispatch } = useApp()
  const [loading, setLoading] = useState(false)

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true })
        return { user: data.user }
      }

      return { error: { message: 'Erro desconhecido' } }
    } catch (_error) {
      return { error: { message: 'Erro de conexão' } }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true })
        return { user: data.user }
      }

      return { error: { message: 'Erro desconhecido' } }
    } catch (_error) {
      return { error: { message: 'Erro de conexão' } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { error }
      }

      dispatch({ type: 'SET_AUTHENTICATED', payload: false })
      return {}
    } catch (_error) {
      return { error: { message: 'Erro de conexão' } }
    } finally {
      setLoading(false)
    }
  }

  return {
    signUp,
    signIn,
    signOut,
    loading
  }
}