"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/clientApp";

interface UserPreferences {
  allEvents: boolean;
  launches: boolean;
  isroOnly: boolean;
  notificationsEnabled: boolean;
  pwaPromptDismissed?: boolean;
  pwaInstalled?: boolean;
}

interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const subscribeToPrefs = (userId: string) => {
    const prefsRef = doc(db, "users", userId);
    return onSnapshot(prefsRef, (docSnap) => {
      if (docSnap.exists()) {
        setPreferences(docSnap.data() as UserPreferences);
      } else {
        const defaultPrefs: UserPreferences = {
          allEvents: true,
          launches: true,
          isroOnly: false,
          notificationsEnabled: false,
        };
        setDoc(prefsRef, defaultPrefs);
        setPreferences(defaultPrefs);
      }
    });
  };

  useEffect(() => {
    let unsubscribePrefs: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribePrefs) {
        unsubscribePrefs();
        unsubscribePrefs = undefined;
      }

      if (currentUser) {
        unsubscribePrefs = subscribeToPrefs(currentUser.uid);
      } else {
        setPreferences(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePrefs) unsubscribePrefs();
    };
  }, [user?.uid]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!user) return;
    const prefsRef = doc(db, "users", user.uid);
    await setDoc(prefsRef, newPrefs, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, preferences, loading, login, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
