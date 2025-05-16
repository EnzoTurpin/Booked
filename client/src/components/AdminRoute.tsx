import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/auth";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    // Logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // User is admin, allow access
  return <>{children}</>;
};

export default AdminRoute;
