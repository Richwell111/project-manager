import { useAuth } from "@/provider/auth-context";
import React from "react";
import { Navigate, Outlet } from "react-router";

const AuthLayout = () => {
  // This layout is used for authentication-related routes
  // such as login, register, and forgot password.
  // It can be extended in the future to include common
  // components like headers or footers if needed.
  const {isAuthenticated,isLoading} = useAuth();
  if(isLoading){ return <div>Loading...</div>; }
  if(isAuthenticated){
    return <Navigate to="/dashboard"/>
  }
  return <Outlet />;
};

export default AuthLayout;
