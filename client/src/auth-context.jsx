import { createContext, useContext, useEffect, useState } from "react";

import { apiRequest } from "./api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "love-timeline-auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest("/api/auth/me", {
          token
        });

        if (!cancelled) {
          setUser(response.user);
        }
      } catch (error) {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken("");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function authenticate(path, formValues) {
    const response = await apiRequest(path, {
      method: "POST",
      body: formValues
    });

    localStorage.setItem(STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  async function updateProfile(payload) {
    const response = await apiRequest("/api/auth/profile", {
      method: "PUT",
      body: payload,
      token
    });

    setUser(response.user);
    return response.user;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login: (payload) => authenticate("/api/auth/login", payload),
        signup: (payload) => authenticate("/api/auth/signup", payload),
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
