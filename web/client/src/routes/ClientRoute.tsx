import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/auth";

const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = authService.getCurrentUser();
  if (!user || user.role !== "client") {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

export default ClientRoute;
