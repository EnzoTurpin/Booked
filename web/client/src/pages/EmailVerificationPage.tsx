import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/auth";

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<string>("");
  const [emailFromUrl, setEmailFromUrl] = useState<boolean>(false);

  useEffect(() => {
    // Récupérer l'email depuis l'URL si présent
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setEmailFromUrl(true);
    }
  }, [location]);

  const handleVerify = async () => {
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    if (!verificationCode) {
      setError("Veuillez entrer le code de vérification");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.verifyEmail({
        email,
        verificationCode,
      });
      setSuccess(response.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message || "Une erreur est survenue lors de la vérification"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    setResendLoading(true);
    setError("");
    setResendSuccess("");

    try {
      const response = await authService.resendVerificationCode(email);
      setResendSuccess(response.message);
    } catch (err: any) {
      setError(
        err.message || "Une erreur est survenue lors de l'envoi du code"
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-offwhite rounded-lg shadow-md p-8 border border-sage/20">
        <h1 className="text-3xl font-bold mb-4 text-center text-brown">
          Vérification de votre email
        </h1>

        <p className="text-brown/80 text-center mb-6">
          Veuillez entrer le code de vérification qui a été envoyé à votre
          adresse email.
        </p>

        <form className="space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              {success}
            </div>
          )}
          {resendSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              {resendSuccess}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-brown font-semibold mb-2"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                !emailFromUrl && setEmail(e.target.value)
              }
              disabled={loading || emailFromUrl}
              className={`w-full p-3 border border-sage/30 rounded-lg focus:ring-sage focus:border-sage bg-offwhite text-brown ${
                emailFromUrl ? "bg-beige/50" : ""
              }`}
              required
              readOnly={emailFromUrl}
            />
          </div>

          <div>
            <label
              htmlFor="verificationCode"
              className="block text-brown font-semibold mb-2"
            >
              Code de vérification
            </label>
            <input
              id="verificationCode"
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setVerificationCode(e.target.value)
              }
              disabled={loading}
              className="w-full p-3 border border-sage/30 rounded-lg focus:ring-sage focus:border-sage bg-offwhite text-brown"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-sage hover:bg-sage-light text-brown font-bold py-3 px-6 rounded-lg transition duration-300 mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
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
                Vérification en cours...
              </span>
            ) : (
              "Vérifier"
            )}
          </button>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-brown hover:text-sage transition-colors"
            >
              {resendLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-brown"
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
                  Envoi en cours...
                </span>
              ) : (
                "Renvoyer le code"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
