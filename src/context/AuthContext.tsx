'use client'

import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { loadUserDoc, createUserDoc, saveUserDoc } from '@/lib/firestore'
import { useAppStore } from '@/store'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { updateProfile, updatePreferences, profile, preferences } = useAppStore()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const uidRef = useRef<string | null>(null)

  const hydrateStore = useCallback(async (fbUser: User) => {
    const doc = await loadUserDoc(fbUser.uid)
    if (doc) {
      if (doc.profile)     updateProfile(doc.profile)
      if (doc.preferences) updatePreferences(doc.preferences)
    } else {
      const name = fbUser.displayName ?? profile.name
      const email = fbUser.email ?? profile.email
      const initial = { ...profile, name, email }
      updateProfile(initial)
      await createUserDoc(fbUser.uid, { profile: initial, preferences })
    }
  }, [updateProfile, updatePreferences, profile, preferences])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      uidRef.current = fbUser?.uid ?? null
      if (fbUser) await hydrateStore(fbUser)
      setLoading(false)
    })
    return unsubscribe
  }, [hydrateStore])

  // Debounced write-back: auto-save profile/preferences changes to Firestore
  useEffect(() => {
    const uid = uidRef.current
    if (!uid) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveUserDoc(uid, { profile, preferences }).catch(() => {})
    }, 1500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [profile, preferences])

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signUp(email: string, password: string, name: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await firebaseUpdateProfile(cred.user, { displayName: name })
  }

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function signOut() {
    uidRef.current = null
    await firebaseSignOut(auth)
    useAppStore.getState().updateProfile({
      name: '', email: '', bio: '', avatarColor: '#6366f1', timezone: 'America/New_York',
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
