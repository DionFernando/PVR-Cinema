import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import type { AppUser } from "../lib/types";
import { createUserProfile } from "../lib/userService";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type AuthCtx = {
  fbUser: User | null;
  profile: AppUser | null;
  loading: boolean;              // now true until BOTH auth + profile are ready
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // auth state
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      // when auth changes, (re)attach profile listener if logged in
      if (!u) {
        setProfile(null);
        setLoading(false); // no user -> done loading
        return;
      }

      setLoading(true); // user present, but profile not ready yet
      const ref = doc(db, "users", u.uid);
      const unsubProfile = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as AppUser);
          } else {
            setProfile(null);
          }
          setLoading(false);
        },
        () => {
          setProfile(null);
          setLoading(false);
        }
      );

      // cleanup when auth user changes
      return () => unsubProfile();
    });

    return () => unsubAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const register = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name) {
      try { await updateProfile(cred.user, { displayName: name }); } catch {}
    }
    await createUserProfile({
      uid: cred.user.uid,
      email: cred.user.email || email.trim(),
      name,
      role: "user",
    });
  };

  const logout = async () => { await signOut(auth); };

  return (
    <Ctx.Provider value={{ fbUser, profile, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
