"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface UserProfile {
  uid: string
  email: string | null
  role: "admin" | "user" | null
  // Add any other user profile fields you store in Firestore
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true)
        // Fetch user role from Firestore
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          let userRole: "admin" | "user" | null = null
          if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            userRole = data.role || "user" // Default to 'user' if role not set
          } else {
            // If user document doesn't exist, assume 'user' role
            userRole = "user"
            // Optionally, create a user document here if it doesn't exist
            // await setDoc(userDocRef, { email: firebaseUser.email, role: 'user' });
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userRole,
          })
          setIsAdmin(userRole === "admin")
        } catch (error) {
          console.error("Error fetching user role:", error)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "user", // Assume default role on error
          })
          setIsAdmin(false)
        }
      } else {
        setUser(null)
        setIsLoggedIn(false)
        setIsAdmin(false)
      }
      setLoadingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, isLoggedIn, isAdmin, loadingAuth }
}
