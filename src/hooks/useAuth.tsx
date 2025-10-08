import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
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

// Demo users for development mode
const DEMO_USERS = {
  'admin@learningmodels.com': {
    uid: 'demo-admin',
    email: 'admin@learningmodels.com',
    name: 'Mónica de Aguilar',
    role: 'admin' as const,
    isDirector: true
  },
  'editor@learningmodels.com': {
    uid: 'demo-editor',
    email: 'editor@learningmodels.com',
    name: 'Fernanda Muñoz',
    role: 'editor' as const
  },
  'therapist@learningmodels.com': {
    uid: 'demo-therapist',
    email: 'therapist@learningmodels.com',
    name: 'Miranda Navas',
    role: 'therapist' as const
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we're in development mode (Firebase config has placeholder values)
    const isDevelopmentMode = auth.app.options.apiKey === 'your-api-key'
    
    if (isDevelopmentMode) {
      // Development mode - check localStorage for demo user
      const savedUser = localStorage.getItem('demo-user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      setLoading(false)
      return
    }

    // Production mode - use Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const isDirector = firebaseUser.email === 'monica@learningmodels.com.gt'
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || '',
              role: userData.role || 'therapist',
              isDirector
            })
          } else {
            // If user document doesn't exist, create a default one
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: 'therapist'
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    // Check if we're in development mode
    const isDevelopmentMode = auth.app.options.apiKey === 'your-api-key'
    
    if (isDevelopmentMode) {
      // Development mode - use demo users
      const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS]
      if (demoUser && password === 'demo123') {
        setUser(demoUser)
        localStorage.setItem('demo-user', JSON.stringify(demoUser))
        return
      } else {
        throw new Error('Credenciales inválidas. Usa: admin@learningmodels.com, editor@learningmodels.com, o therapist@learningmodels.com con contraseña: demo123')
      }
    }

    // Production mode - use Firebase
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    const isDevelopmentMode = auth.app.options.apiKey === 'your-api-key'
    
    if (isDevelopmentMode) {
      // Development mode
      setUser(null)
      localStorage.removeItem('demo-user')
      return
    }

    // Production mode
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
