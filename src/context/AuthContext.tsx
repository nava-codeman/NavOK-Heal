"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: "admin" | "patient" | "pharmacy" | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "patient" | "pharmacy" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch custom role from Firestore users collection
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let currentRole = userData.role || "patient";

            // Auto-provision admin role for the specific email
            const adminEmails = ["admin@example.com", "admin04@gmail.com"];
            if (firebaseUser.email && adminEmails.includes(firebaseUser.email.toLowerCase()) && currentRole !== "admin") {
              currentRole = "admin";
              try {
                await updateDoc(userDocRef, { role: "admin" });
              } catch (updateErr) {
                console.error("Failed to update admin role in Firestore:", updateErr);
              }
            }

            setRole(currentRole);
          } else {
            // default for new registrations before document creation
            const adminEmails = ["admin@example.com", "admin04@gmail.com"];
            setRole(firebaseUser.email && adminEmails.includes(firebaseUser.email.toLowerCase()) ? "admin" : "patient"); 
          }
        } catch (error: unknown) {
          // Gracefully default to patient if user document does not exist or permission is not yet granted
          const errorMessage = error instanceof Error ? error.message : error;
          console.warn("User role fetch notice:", errorMessage);
          setRole("patient");
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear client state explicitly
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
