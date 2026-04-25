import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { UserProfile, UserPreferences } from '@/store'

export interface UserDocument {
  profile: UserProfile
  preferences: UserPreferences
  createdAt?: unknown
  updatedAt?: unknown
}

export async function loadUserDoc(uid: string): Promise<UserDocument | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? (snap.data() as UserDocument) : null
  } catch {
    return null
  }
}

export async function createUserDoc(uid: string, data: UserDocument): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function saveUserDoc(uid: string, data: Partial<UserDocument>): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch {
    // doc may not exist yet on first save
    await setDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }
}
