import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
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

// Default role mapping for @learningmodels.com.gt emails
const getDefaultRole = (email: string): 'admin' | 'editor' | 'therapist' => {
  // Mónica is admin and director
  if (email === 'monica@learningmodels.com.gt') {
    return 'admin'
  }
  // Fernanda is editor
  if (email === 'fernanda@learningmodels.com.gt') {
    return 'editor'
  }
  // All others default to therapist
  return 'therapist'
}

// Check if user is director (only Mónica)
const isDirector = (email: string): boolean => {
  return email === 'monica@learningmodels.com.gt'
}

// Create or update user in Firestore
const createOrUpdateUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userDoc = await getDoc(userRef)
  
  if (userDoc.exists()) {
    // User exists, return existing data
    const userData = userDoc.data()
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: userData.name || firebaseUser.displayName || '',
      role: userData.role || 'therapist',
      isDirector: isDirector(firebaseUser.email || '')
    }
  } else {
    // New user, create document
    const email = firebaseUser.email || ''
    const role = getDefaultRole(email)
    const newUser: User = {
      uid: firebaseUser.uid,
      email: email,
      name: firebaseUser.displayName || email.split('@')[0],
      role: role,
      isDirector: isDirector(email)
    }
    
    // Save to Firestore
    await setDoc(userRef, {
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: new Date().toISOString()
    })
    
    return newUser
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
          // Create or update user in Firestore
          const userData = await createOrUpdateUser(firebaseUser)
          setUser(userData)
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

  const loginWithGoogle = async () => {
    const isDevelopmentMode = auth.app.options.apiKey === 'your-api-key'
    
    if (isDevelopmentMode) {
      throw new Error('Google Sign-In no está disponible en modo desarrollo. Usa las credenciales de demo.')
    }

    // Production mode - use Google Sign-In
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Validate email domain
      const email = result.user.email || ''
      if (!email.endsWith('@learningmodels.com.gt') && !email.endsWith('@gmail.com')) {
        // Sign out the user if not from allowed domain
        await signOut(auth)
        throw new Error('Solo se permiten cuentas de @learningmodels.com.gt o administradores autorizados.')
      }
      
      // User will be created/updated automatically by onAuthStateChanged
    } catch (error: any) {
      console.error('Google Sign-In error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Inicio de sesión cancelado')
      }
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
    loginWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
