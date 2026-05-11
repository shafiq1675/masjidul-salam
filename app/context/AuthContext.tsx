"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_ROLES, type AdminUser } from "@/lib/db";

type AuthCtx = {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Look up this Firebase Auth user in the adminUsers Firestore collection
        const snap = await getDocs(
          query(collection(db, "adminUsers"), where("uid", "==", u.uid))
        );
        if (!snap.empty) {
          setAdminUser({ id: snap.docs[0].id, ...snap.docs[0].data() } as AdminUser);
        } else {
          // User exists in Firebase Auth but has no Firestore record (first/root admin)
          // Fall back to Super Admin so they can set up the system
          setAdminUser({
            name: u.displayName ?? u.email ?? "Admin",
            email: u.email ?? "",
            role: "Super Admin",
            status: "Active",
            permissions: ADMIN_ROLES["Super Admin"],
          });
        }
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  const logOut = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, adminUser, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
