import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import userService from "../services/user";

const BannedUserPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() === "") {
      setError("Veuillez entrer un message");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await userService.submitUnbanRequest(message);

      setSuccess(
        "Votre demande a été envoyée avec succès. L'administration examinera votre demande dans les plus brefs délais."
      );
      setMessage("");
    } catch (err: any) {
      setError(
        err.message ||
          "Une erreur est survenue lors de l'envoi de votre demande"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
              Compte suspendu
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Votre compte a été suspendu par l'administration. Vous ne pouvez
                plus accéder aux fonctionnalités du site.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Demande de réactivation de compte
        </h2>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
            role="alert"
          >
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-gray-700 font-medium mb-2"
            >
              Expliquez pourquoi vous souhaitez que votre compte soit réactivé
            </label>
            <textarea
              id="message"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="Veuillez nous expliquer les raisons pour lesquelles vous souhaitez que votre compte soit réactivé..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center">
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800 underline"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default BannedUserPage;
