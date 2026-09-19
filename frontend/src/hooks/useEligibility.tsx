import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface Scheme {
  scheme_id?: string;
  scheme_name?: string;
  name: string;
  match_percent: number;
  description: string;
  benefits: string[];
  required_documents: string[];
  apply_url: string;
  category?: string;
  state?: string;
  reason?: string;
}

interface EligibilityData {
  processing_time_ms: number;
  agent_status: Record<string, string>;
  agent_logs: Array<{ time: string; agent: string; message: string }>;
  schemes: Scheme[];
  llm_full_response: string;
  document_checklist: string[];
  meta: {
    detected_categories: string[];
    retrieved_sources: string[];
    schemes_returned: number;
  };
}

interface EligibilityContextType {
  loading: boolean;
  error: string | null;
  eligibilityData: EligibilityData | null;
  checkEligibility: (profileData: any) => Promise<EligibilityData | null>;
  savedSchemes: any[];
  fetchSavedSchemes: () => Promise<void>;
  toggleSaveScheme: (schemeId: string) => Promise<boolean>;
  notifications: any[];
  fetchNotifications: () => Promise<void>;
}

const EligibilityContext = createContext<EligibilityContextType | undefined>(undefined);

export function EligibilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);
  const [savedSchemes, setSavedSchemes] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Reset eligibility state on sign out
  useEffect(() => {
    if (!user) {
      setEligibilityData(null);
      setSavedSchemes([]);
    } else {
      fetchSavedSchemes();
      fetchNotifications();
    }
  }, [user]);

  const checkEligibility = async (profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("govassist_auth_token");
      
      // 1. Save profile to database
      if (user) {
        await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            profile: profileData
          })
        });
      }

      // 2. Call check-eligibility
      const response = await fetch("/api/check-eligibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate scheme eligibility");
      }

      const data = await response.json();
      if (data.status === "success") {
        setEligibilityData(data);
        // Refresh saved schemes and notifications
        fetchSavedSchemes();
        fetchNotifications();
        return data as EligibilityData;
      } else {
        throw new Error(data.message || "Eligibility check failed");
      }
    } catch (err: any) {
      console.error("Eligibility check error:", err);
      setError(err.message || "Server connection failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSchemes = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("govassist_auth_token");
      const emailOrUsername = user.email || user.name;
      const response = await fetch(`/api/saved-schemes?email=${encodeURIComponent(emailOrUsername)}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedSchemes(data.schemes || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved schemes:", err);
    }
  };

  const toggleSaveScheme = async (schemeId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const token = localStorage.getItem("govassist_auth_token");
      const emailOrUsername = user.email || user.name;
      const response = await fetch("/api/save-scheme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: emailOrUsername,
          scheme_id: schemeId
        })
      });

      if (response.ok) {
        const data = await response.json();
        fetchSavedSchemes(); // Reload list
        return !!data.saved;
      }
      return false;
    } catch (err) {
      console.error("Failed to toggle scheme bookmark:", err);
      return false;
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("govassist_auth_token");
      const response = await fetch("/api/notifications", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  return (
    <EligibilityContext.Provider
      value={{
        loading,
        error,
        eligibilityData,
        checkEligibility,
        savedSchemes,
        fetchSavedSchemes,
        toggleSaveScheme,
        notifications,
        fetchNotifications
      }}
    >
      {children}
    </EligibilityContext.Provider>
  );
}

export function useEligibility() {
  const context = useContext(EligibilityContext);
  if (context === undefined) {
    throw new Error("useEligibility must be used within an EligibilityProvider");
  }
  return context;
}
