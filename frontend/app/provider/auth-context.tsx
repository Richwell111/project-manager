import type { User } from "@/types";

import React, { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  const isPublicRoute = publicRoutes.includes(currentPath);

  //check if user is authenticated on initial load

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      // Simulate an API call to check authentication status
      const userInfo = localStorage.getItem("user");
      if (userInfo) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userInfo));
      } else {
        setIsAuthenticated(false);
        if (!isPublicRoute) {
          // If the user is not authenticated and the route is not public, redirect to sign-in
          navigate("/sign-in");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
      navigate("/sign-in");
    };

    window.addEventListener("force-logout", handleForceLogout);

    return () => {
      window.removeEventListener("force-logout", handleForceLogout);
    };
  }, []);
  const login = async (data: any) => {
    localStorage.setItem("token", data.token); // Simulate token storage
    localStorage.setItem("user", JSON.stringify(data.user)); // Simulate user data storage
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem("token"); // Simulate token removal
    localStorage.removeItem("user"); // Simulate user data removal
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear(); // Clear query cache on logout
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
