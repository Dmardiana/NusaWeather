// ============================================================
// NusaWeather — src/services/firebase/firestore.service.ts
// ============================================================
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS, LIMITS, STR } from '../../constants';
import { City, CityInput, User } from '../../types';

export const firestoreService = {
  // ─── User ───────────────────────────────────────────────
  createUserDoc: async (user: User): Promise<void> => {
    const ref = doc(db, COLLECTIONS.USERS, user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  },

  getUserDoc: async (uid: string): Promise<User | null> => {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    return snap.exists() ? (snap.data() as User) : null;
  },

  // ✅ BARU: Update data user (displayName, dll)
  updateUserDoc: async (uid: string, updates: Partial<User>): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // ─── Cities CRUD ────────────────────────────────────────

  // ✅ Real-time listener pakai onSnapshot
  getCities: (userId: string, callback: (cities: City[]) => void): (() => void) => {
    const q = query(
      collection(db, COLLECTIONS.CITIES),
      where('userId', '==', userId),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const cities = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as City)
        );
        callback(cities);
      },
      (error) => {
        console.error('Firestore listener error:', error);
      }
    );
    return () => unsubscribe();
  },

  // ✅ Versi sekali fetch untuk keperluan internal
  getCitiesOnce: async (userId: string): Promise<City[]> => {
    const q = query(
      collection(db, COLLECTIONS.CITIES),
      where('userId', '==', userId),
      orderBy('order', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as City));
  },

  addCity: async (userId: string, input: CityInput): Promise<City> => {
    const existing = await firestoreService.getCitiesOnce(userId);
    if (existing.length >= LIMITS.MAX_CITIES) throw new Error(STR.ERR_MAX_CITIES);
    const isDuplicate = existing.some(
      (c) => c.lat === input.lat && c.lon === input.lon
    );
    if (isDuplicate) throw new Error(STR.ERR_CITY_EXISTS);
    const data = {
      ...input,
      userId,
      isDefault: existing.length === 0,
      order: existing.length,
      addedAt: Date.now(),
    };
    const ref = await addDoc(collection(db, COLLECTIONS.CITIES), data);
    return { id: ref.id, ...data };
  },

  deleteCity: async (cityId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.CITIES, cityId));
  },

  updateCity: async (cityId: string, updates: Partial<City>): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.CITIES, cityId), updates);
  },

  setDefaultCity: async (userId: string, cityId: string): Promise<void> => {
    const cities = await firestoreService.getCitiesOnce(userId);
    const batch = writeBatch(db);
    cities.forEach((c) => {
      batch.update(doc(db, COLLECTIONS.CITIES, c.id), {
        isDefault: c.id === cityId,
      });
    });
    await batch.commit();
  },
};