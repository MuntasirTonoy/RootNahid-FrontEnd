"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import axios from "axios";

import { auth, googleProvider } from "@/lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          // Sync user with backend
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          // Merge Firebase user with Backend user data (role, etc.)
          setUser({ ...currentUser, ...response.data });

          console.log("User synced with backend", response.data);
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const googleSignIn = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateUserProfile = (data) => {
    return updateProfile(auth.currentUser, data);
  };

  const updateUserPassword = (newPassword) => {
    return updatePassword(auth.currentUser, newPassword);
  };

  const updateBackendProfile = async (data) => {
    const token = await auth.currentUser.getIdToken();
    return axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  };

  const verifyEmail = () => {
    return sendEmailVerification(auth.currentUser);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleSignIn,
        login,
        signup,
        logout,
        updateUserProfile,
        updateUserPassword,
        updateBackendProfile,
        verifyEmail,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
