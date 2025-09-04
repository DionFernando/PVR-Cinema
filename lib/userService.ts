import { db } from "./firebase";
import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import type { AppUser } from "./types";

export async function createUserProfile(data: AppUser) {
  const ref = doc(db, "users", data.uid);
  await setDoc(ref, { ...data, createdAt: serverTimestamp() }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AppUser) : null;
}
