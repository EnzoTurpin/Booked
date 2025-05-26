import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "./ProfileAvatar";
import authService, { IUser } from "../services/auth";

interface UserMenuProps {
  user: IUser;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Supprimer les données de session
    authService.logout();

    // Forcer la mise à jour du localStorage pour déclencher l'événement storage
    window.localStorage.setItem("logout-event", Date.now().toString());
    window.localStorage.removeItem("logout-event");

    // Fermer le menu
    setIsOpen(false);

    // Rediriger vers la page de connexion
    navigate("/login");

    // Recharger la page pour s'assurer que l'état est bien réinitialisé
    window.location.reload();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleMyAppointmentsClick = () => {
    navigate("/my-appointments");
    setIsOpen(false);
  };

  const handleAdminDashboardClick = () => {
    navigate("/admin");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        <ProfileAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          profileImage={user.profileImage}
          size="md"
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-offwhite rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-sage/30">
            <p className="text-sm font-medium text-brown truncate">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-xs text-brown/70 truncate">{user.email}</p>
            <p className="text-xs text-brown/70 capitalize">{user.role}</p>
          </div>
          <button
            onClick={handleProfileClick}
            className="block w-full text-left px-4 py-2 text-sm text-brown hover:bg-beige"
          >
            Mon profil
          </button>
          <button
            onClick={handleMyAppointmentsClick}
            className="block w-full text-left px-4 py-2 text-sm text-brown hover:bg-beige"
          >
            Mes rendez-vous
          </button>
          {user.role === "admin" && (
            <button
              onClick={handleAdminDashboardClick}
              className="block w-full text-left px-4 py-2 text-sm text-brown hover:bg-beige"
            >
              Tableau de bord admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-brown hover:bg-beige"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
