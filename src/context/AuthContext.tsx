import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from '@react-native-firebase/auth'
import { auth } from '../lib/firebase'
import type { UsuarioAutenticado } from '../types'

interface ContextoAuth {
  user: UsuarioAutenticado | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<ContextoAuth | null>(null)

/** Reduce un usuario de Firebase a los datos mínimos que usa la aplicación. */
function aUsuarioAutenticado(u: User | null): UsuarioAutenticado | null {
  return u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null
}

/**
 * Provee el estado de autenticación y las operaciones de cuenta. El SDK nativo
 * de Firebase persiste la sesión automáticamente entre reinicios.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioAutenticado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(aUsuarioAutenticado(firebaseUser))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    setUser(aUsuarioAutenticado(cred.user))
  }

  const signup = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    setUser(aUsuarioAutenticado(cred.user))
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const currentUser = auth.currentUser
    if (!currentUser || !currentUser.email) {
      throw new Error('No hay sesión activa')
    }
    // Reautenticar primero (Firebase requiere login reciente para cambiar password).
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
    await reauthenticateWithCredential(currentUser, credential)
    await updatePassword(currentUser, newPassword)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, changePassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook de acceso al contexto de autenticación. */
export function useAuth(): ContextoAuth {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}