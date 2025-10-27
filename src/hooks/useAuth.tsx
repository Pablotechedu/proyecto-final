import React, { createContext, useContext, useEffect, useState } from 'react'
import api, { handleApiError } from '../services/api'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  // Helper functions para verificar permisos
  hasPermission: (permission: keyof User['permissions']) => boolean
  hasAnyPermission: (permissions: Array<keyof User['permissions']>) => boolean
  hasAllPermissions: (permissions: Array<keyof User['permissions']>) => boolean
  isAdmin: boolean
  isEditor: boolean
  isTherapist: boolean
  isDirector: boolean
  canEdit: boolean
  canDelete: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar si hay un usuario guardado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        try {
          // Verificar que el token siga siendo válido
          const response = await api.get('/auth/me')
          setUser(response.data.data)
        } catch (error) {
          // Token inválido o expirado
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await api.post('/auth/login', {
        email,
        password
      })

      const { token, user: userData } = response.data.data
      
      // Guardar token y usuario
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      setUser(null)
      setError(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions para verificar permisos
  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return user?.permissions?.[permission] === true
  }

  const hasAnyPermission = (permissions: Array<keyof User['permissions']>): boolean => {
    return permissions.some(permission => user?.permissions?.[permission] === true)
  }

  const hasAllPermissions = (permissions: Array<keyof User['permissions']>): boolean => {
    return permissions.every(permission => user?.permissions?.[permission] === true)
  }

  // Computed properties para acceso rápido
  const isAdmin = user?.permissions?.isAdmin === true
  const isEditor = user?.permissions?.isEditor === true
  const isTherapist = user?.permissions?.isTherapist === true
  const isDirector = user?.permissions?.isDirector === true
  const canEdit = isAdmin || isEditor
  const canDelete = isAdmin

  const value = {
    user,
    loading,
    login,
    logout,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isEditor,
    isTherapist,
    isDirector,
    canEdit,
    canDelete
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
