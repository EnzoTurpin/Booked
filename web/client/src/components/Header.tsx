import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import authService, { IUser } from "../services/auth";

const Header: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const checkLoggedInUser = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  };

  // Vérifier l'authentification au chargement et lors des changements de route
  useEffect(() => {
    checkLoggedInUser();
  }, [location.pathname]);

  // Écouter les événements de stockage (pour la déconnexion/connexion dans d'autres onglets)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Si token ou user a été modifié, mettre à jour l'état
      if (e.key === "token" || e.key === "user" || e.key === "logout-event") {
        checkLoggedInUser();
      }
    };

    // Vérifier si l'utilisateur est connecté au chargement du composant
    checkLoggedInUser();

    window.addEventListener("storage", handleStorageChange);

    // Créer un intervalle pour vérifier périodiquement l'état d'authentification
    const authCheckInterval = setInterval(checkLoggedInUser, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(authCheckInterval);
    };
  }, []);

  return (
    <header className="bg-sage-dark text-offwhite shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            <Link to="/">Booked</Link>
          </div>
          <nav>
            <ul className="flex space-x-6 items-center">
              <li>
                <Link to="/" className="hover:opacity-80">
                  Accueil
                </Link>
              </li>
              {(!currentUser || currentUser.role === "client") && (
                <>
                  <li>
                    <Link to="/booking" className="hover:opacity-80">
                      Réserver
                    </Link>
                  </li>
                </>
              )}
              {currentUser ? (
                <>
                  {currentUser.role === "professional" && (
                    <li>
                      <Link
                        to="/professional-dashboard"
                        className="hover:opacity-80"
                      >
                        Dashboard Pro
                      </Link>
                    </li>
                  )}
                  <li>
                    <UserMenu user={currentUser} />
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:opacity-80">
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="bg-beige text-brown px-4 py-2 rounded-lg font-medium hover:bg-offwhite transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
