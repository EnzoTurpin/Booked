import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fonction de validation d'email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction de validation de mot de passe
  const validatePassword = (password: string) => {
    // Au moins 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
    const hasMinLength = password.length >= 8;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!hasMinLength)
      return "Le mot de passe doit contenir au moins 8 caractères";
    if (!hasLowerCase)
      return "Le mot de passe doit contenir au moins une lettre minuscule";
    if (!hasUpperCase)
      return "Le mot de passe doit contenir au moins une lettre majuscule";
    if (!hasNumber) return "Le mot de passe doit contenir au moins un chiffre";
    if (!hasSpecialChar)
      return "Le mot de passe doit contenir au moins un caractère spécial";

    return ""; // Pas d'erreur
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Format d'email invalide");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword) {
      const passwordValidationResult = validatePassword(newPassword);
      setPasswordError(passwordValidationResult);
    } else {
      setPasswordError("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation des champs
    if (!email) {
      setEmailError("L'email est requis");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Format d'email invalide");
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setPasswordError("Le mot de passe est requis");
      setIsSubmitting(false);
      return;
    }

    try {
      // Utiliser le login du contexte d'authentification
      await login(email, password);

      // Récupérer l'URL de redirection si elle existe
      const redirectUrl = sessionStorage.getItem("redirectUrl") || "/";
      sessionStorage.removeItem("redirectUrl"); // Nettoyer après utilisation

      // Redirection après connexion réussie
      navigate(redirectUrl);
    } catch (error: any) {
      console.error("Erreur de connexion:", error);

      // Vérifier si l'utilisateur est banni
      if (error.isBanned) {
        navigate("/banned");
        return;
      }

      // Vérifier si l'erreur concerne la vérification d'email
      if (error.needsVerification) {
        // Rediriger vers la page de vérification d'email
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      if (error.message) {
        setError(error.message);
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-beige">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-brown mb-2">Connexion</h1>
          <p className="text-brown/80 text-lg">
            Accédez à votre compte pour gérer vos rendez-vous
          </p>
        </div>

        <div className="bg-offwhite rounded-2xl shadow-xl p-8 border border-sage/20">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-brown font-medium mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-brown/50"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-10 p-3 border ${
                    emailError ? "border-red-500" : "border-sage/30"
                  } rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition duration-200 bg-offwhite text-brown`}
                  required
                  placeholder="votre@email.com"
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-brown font-medium mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-brown/50"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full pl-10 pr-10 p-3 border ${
                    passwordError ? "border-red-500" : "border-sage/30"
                  } rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition duration-200 bg-offwhite text-brown`}
                  required
                  placeholder="Votre mot de passe"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-brown/50 hover:text-brown"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-brown/50 hover:text-brown"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {passwordError ? (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              ) : (
                <p className="text-brown/70 text-xs mt-1">
                  Le mot de passe doit contenir au moins 8 caractères, une
                  lettre minuscule, une lettre majuscule, un chiffre et un
                  caractère spécial.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-brown focus:ring-brown border-sage/30 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-brown"
                >
                  Se souvenir de moi
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brown hover:text-sage transition-colors"
              >
                Mot de passe oublié?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-sage text-brown font-semibold hover:bg-sage-light transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage flex items-center justify-center"
              >
                {isSubmitting ? (
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
                ) : null}
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brown/70">
              Vous n'avez pas de compte ?{" "}
              <Link
                to="/register"
                className="text-brown font-medium hover:text-sage transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
