// lib/authUser.ts
import { auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_UID_KEY = "pvr_local_uid";

function genId() {
  return "local_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Returns a stable userId for this device/app:
 * - uses Firebase anonymous auth if available
 * - otherwise falls back to a locally stored ID in AsyncStorage
 */
export async function getOrCreateUserId(): Promise<string> {
  // if already signed in with Firebase
  if (auth.currentUser?.uid) return auth.currentUser.uid;

  // try anonymous auth (OK if Anonymous is enabled; if not, we'll fall back)
  try {
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch {
    // local fallback
    let uid = await AsyncStorage.getItem(LOCAL_UID_KEY);
    if (!uid) {
      uid = genId();
      await AsyncStorage.setItem(LOCAL_UID_KEY, uid);
    }
    return uid;
  }
}
