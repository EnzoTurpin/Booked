import React, { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated) {
      // Stocker l'URL demandée pour rediriger après la connexion
      sessionStorage.setItem("redirectUrl", location.pathname);
    }
  }, [isAuthenticated, location]);

  // Afficher un indicateur de chargement pendant la vérification
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sage"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger vers la page de bannissement si l'utilisateur est banni
  if (currentUser?.isBanned) {
    return <Navigate to="/banned" replace />;
  }

  // Afficher le contenu protégé si authentifié et non banni
  return <>{children}</>;
};

export default ProtectedRoute;
