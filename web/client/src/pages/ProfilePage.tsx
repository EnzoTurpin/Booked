import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService, { IUser } from "../services/auth";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ProfileAvatar from "../components/ProfileAvatar";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate("/login");
      return;
    }

    setUser(currentUser);
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Cela ne devrait pas arriver avec la redirection
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-brown">Mon profil</h1>

      <div className="bg-offwhite rounded-lg shadow-md p-6 border border-sage/20 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <ProfileAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            profileImage={user.profileImage}
            size="lg"
            onClick={() => navigate("/edit-profile")}
          />
          <div>
            <h2 className="text-2xl font-semibold text-brown">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-brown/80">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-sage/30 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-brown/70 text-sm">Rôle</p>
              <p className="font-medium text-brown capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-brown/70 text-sm">Téléphone</p>
              <p className="font-medium text-brown">
                {user.phone || "Non spécifié"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="bg-sage hover:bg-sage-light text-brown font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => navigate("/edit-profile")}
          >
            Modifier mon profil
          </button>
          <button
            className="bg-offwhite border border-sage text-brown font-medium py-2 px-4 rounded-lg hover:bg-sage/10 transition-colors"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? "Masquer" : "Changer mon mot de passe"}
          </button>
          <button
            className="bg-offwhite border border-sage text-brown font-medium py-2 px-4 rounded-lg hover:bg-sage/10 transition-colors"
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié
          </button>
        </div>
      </div>

      {showPasswordForm && (
        <ChangePasswordForm
          onSuccess={() => {
            setShowPasswordForm(false);
            // Optionnellement, vous pourriez aussi rafraîchir les données utilisateur ici si nécessaire
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
