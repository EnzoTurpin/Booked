import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/auth";

const ProfessionalRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "professional") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProfessionalRoute;
