import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService, { IUser, IUpdateProfileData } from "../../services/auth";
import ProfileAvatar from "../../components/ProfileAvatar";

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate("/login");
      return;
    }

    // Initialiser les champs du formulaire avec les données de l'utilisateur
    setUser(currentUser);
    setFirstName(currentUser.firstName);
    setLastName(currentUser.lastName);
    setPhoneNumber(currentUser.phone || "");
    setEmail(currentUser.email);
    setRole(currentUser.role);
    setProfileImage(currentUser.profileImage || null);
    setIsLoading(false);
  }, [navigate]);

  const validatePhoneNumber = (phone: string) => {
    if (
      phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone)
    ) {
      return "Format de numéro de téléphone invalide";
    }
    return "";
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);

    if (newPhoneNumber) {
      const phoneValidationResult = validatePhoneNumber(newPhoneNumber);
      setPhoneNumberError(phoneValidationResult);
    } else {
      setPhoneNumberError("");
    }
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFirstName = e.target.value;
    setFirstName(newFirstName);

    if (!newFirstName) {
      setFirstNameError("Le prénom est requis");
    } else {
      setFirstNameError("");
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLastName = e.target.value;
    setLastName(newLastName);

    if (!newLastName) {
      setLastNameError("Le nom est requis");
    } else {
      setLastNameError("");
    }
  };

  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type et la taille du fichier
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError("Le fichier doit être une image (JPEG, PNG, WebP)");
        return;
      }

      if (file.size > maxSize) {
        setError("La taille de l'image ne doit pas dépasser 5MB");
        return;
      }

      setProfileImageFile(file);

      // Prévisualiser l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    // Validation des champs
    if (!firstName) {
      setFirstNameError("Le prénom est requis");
      setIsSubmitting(false);
      return;
    }

    if (!lastName) {
      setLastNameError("Le nom est requis");
      setIsSubmitting(false);
      return;
    }

    if (phoneNumber) {
      const phoneValidationResult = validatePhoneNumber(phoneNumber);
      if (phoneValidationResult) {
        setPhoneNumberError(phoneValidationResult);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (user) {
        const profileData: IUpdateProfileData = {
          firstName,
          lastName,
          phoneNumber,
        };

        // Ajouter l'image si elle existe
        if (profileImageFile) {
          profileData.profileImage = profileImageFile;
        } else if (profileImage) {
          profileData.profileImage = profileImage;
        }

        // Mettre à jour le profil
        const updatedUser = await authService.updateProfile(
          user._id,
          profileData
        );

        setMessage("Votre profil a été mis à jour avec succès");
        setUser(updatedUser);

        // Rediriger vers la page de profil après 2 secondes
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);

      if (error.message) {
        setError(error.message);
      } else {
        setError(
          "Une erreur est survenue lors de la mise à jour de votre profil."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-brown">
        Modifier mon profil
      </h1>

      <div className="bg-offwhite rounded-lg shadow-md p-6 border border-sage/20">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
                <p className="text-xs mt-1">
                  Vous allez être redirigé vers votre profil...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center mb-6">
            <label className="block text-brown font-medium mb-3 text-center">
              Photo de profil
            </label>
            <div className="relative group">
              <ProfileAvatar
                firstName={firstName}
                lastName={lastName}
                profileImage={profileImage || undefined}
                size="xl"
                onClick={handleProfileImageClick}
              />
              <div
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleProfileImageClick}
              >
                <span className="text-white text-sm font-medium">Modifier</span>
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg,image/webp"
            />
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                className="text-sm text-sage hover:text-sage-dark underline"
                onClick={handleProfileImageClick}
              >
                {profileImage ? "Changer la photo" : "Ajouter une photo"}
              </button>
              {profileImage && (
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-700 underline"
                  onClick={handleRemoveImage}
                >
                  Supprimer
                </button>
              )}
            </div>
            <p className="text-brown/60 text-xs mt-1 text-center">
              Formats acceptés: JPEG, PNG, WebP. Taille max: 5MB
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-brown font-medium mb-2"
              >
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={handleFirstNameChange}
                className={`w-full p-3 border ${
                  firstNameError ? "border-red-500" : "border-sage/30"
                } rounded-lg focus:ring-2 focus:ring-sage focus:border-sage transition duration-200 bg-offwhite text-brown`}
                required
              />
              {firstNameError && (
                <p className="text-red-500 text-sm mt-1">{firstNameError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-brown font-medium mb-2"
              >
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={handleLastNameChange}
                className={`w-full p-3 border ${
                  lastNameError ? "border-red-500" : "border-sage/30"
                } rounded-lg focus:ring-2 focus:ring-sage focus:border-sage transition duration-200 bg-offwhite text-brown`}
                required
              />
              {lastNameError && (
                <p className="text-red-500 text-sm mt-1">{lastNameError}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-brown font-medium mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full p-3 border border-sage/30 rounded-lg bg-offwhite/50 text-brown/70 cursor-not-allowed"
            />
            <p className="text-brown/60 text-xs mt-1">
              L'adresse email ne peut pas être modifiée.
            </p>
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-brown font-medium mb-2"
            >
              Numéro de téléphone
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={`w-full p-3 border ${
                phoneNumberError ? "border-red-500" : "border-sage/30"
              } rounded-lg focus:ring-2 focus:ring-sage focus:border-sage transition duration-200 bg-offwhite text-brown`}
              placeholder="+33 6 12 34 56 78"
            />
            {phoneNumberError ? (
              <p className="text-red-500 text-sm mt-1">{phoneNumberError}</p>
            ) : (
              <p className="text-brown/60 text-xs mt-1">
                Format international recommandé: +33 6 12 34 56 78
              </p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-brown font-medium mb-2">
              Rôle
            </label>
            <input
              id="role"
              type="text"
              value={role.charAt(0).toUpperCase() + role.slice(1)}
              disabled
              className="w-full p-3 border border-sage/30 rounded-lg bg-offwhite/50 text-brown/70 cursor-not-allowed"
            />
            <p className="text-brown/60 text-xs mt-1">
              Le rôle ne peut pas être modifié.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 rounded-lg bg-sage text-brown font-semibold hover:bg-sage-light transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-brown"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Mise à jour...
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 rounded-lg border border-sage text-brown font-semibold hover:bg-sage/10 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
