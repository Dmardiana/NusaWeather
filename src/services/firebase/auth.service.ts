// ============================================================
// NusaWeather — src/services/firebase/auth.service.ts
// ============================================================
import {
  createUserWithEmailAndPassword,
  User as FBUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { LoginPayload, RegisterPayload, User } from '../../types';
import { firestoreService } from './firestore.service';

const mapUser = (fb: FBUser): User => ({
  uid: fb.uid,
  email: fb.email!,
  displayName: fb.displayName ?? '',
  photoURL: fb.photoURL,
  createdAt: Number(fb.metadata.creationTime
    ? new Date(fb.metadata.creationTime).getTime() : Date.now()),
  updatedAt: Date.now(),
});

const getErrMsg = (code: string): string => {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/user-not-found': 'Akun tidak ditemukan.',
    'auth/wrong-password': 'Password salah.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu sebentar.',
    'auth/network-request-failed': 'Tidak ada koneksi internet.',
  };
  return map[code] ?? 'Terjadi kesalahan. Coba lagi.';
};

export const authService = {
  login: async ({ email, password }: LoginPayload): Promise<User> => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return mapUser(user);
    } catch (e: any) {
      throw new Error(getErrMsg(e.code));
    }
  },

  register: async ({ email, password, displayName }: RegisterPayload): Promise<User> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      const mapped = mapUser(user);
      await firestoreService.createUserDoc(mapped);
      return mapped;
    } catch (e: any) {
      throw new Error(getErrMsg(e.code));
    }
  },

  // ✅ FIX: update displayName di Auth + Firestore dengan proper await
  updateDisplayName: async (displayName: string): Promise<User> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Tidak ada user yang login.');
      
      console.log('[Auth] Updating displayName to:', displayName);
      
      // Step 1: Update Firebase Auth profile
      await updateProfile(currentUser, { displayName });
      console.log('[Auth] updateProfile success');
      
      // Step 2: Reload untuk pastikan data fresh
      await currentUser.reload();
      console.log('[Auth] reload success');
      
      // Step 3: Update Firestore document
      try {
        await firestoreService.updateUserDoc(currentUser.uid, { displayName });
        console.log('[Auth] Firestore update success');
      } catch (fsError: any) {
        console.warn('[Auth] Firestore update warning:', fsError);
        // Tetap return user meski Firestore gagal karena Auth sudah update
      }
      
      // Step 4: Return user yang sudah updated
      const updatedUser = mapUser(auth.currentUser!);
      console.log('[Auth] Updated user:', updatedUser);
      return updatedUser;
    } catch (e: any) {
      console.error('[Auth] updateDisplayName error:', e);
      throw new Error(e.message ?? 'Gagal update profil.');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
      // Pastikan state auth benar-benar sudah kosong sebelum lanjut.
      if (auth.currentUser) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout saat logout.')), 3000);
          const unsub = onAuthStateChanged(auth, (fb) => {
            if (!fb) {
              clearTimeout(timeout);
              unsub();
              resolve();
            }
          });
        });
      }
    } catch (e: any) {
      throw new Error(getErrMsg(e.code));
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      throw new Error(getErrMsg(e.code));
    }
  },

  onAuthChange: (cb: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (fb) => cb(fb ? mapUser(fb) : null));
  },
};