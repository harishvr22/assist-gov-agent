import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  age: number | null;
  gender: string | null;
  state: string | null;
  occupation: string | null;
  education: string | null;
  income: string | null;
  annual_family_income: number | null;
  district: string | null;
  category: string | null;
  disability_status: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pwd: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and verify user on mount
  useEffect(() => {
    async function verifyUser() {
      const token = localStorage.getItem("govassist_auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("govassist_auth_token");
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to verify authentication token:", error);
      } finally {
        setLoading(false);
      }
    }

    verifyUser();
  }, []);

  const login = async (email: string, pwd: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, pwd }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("govassist_auth_token", data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid credentials" };
      }
    } catch (error) {
      console.error("Login request failed:", error);
      return { success: false, message: "Server connection failed" };
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("govassist_auth_token", data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Signup request failed:", error);
      return { success: false, message: "Server connection failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("govassist_auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
