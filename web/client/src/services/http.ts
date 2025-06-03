import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import authService from "./auth";

const API_URL = "http://localhost:5000/api";

// Créer une instance axios avec l'URL de base
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interface pour les réponses d'erreur avec la propriété isBanned
interface ErrorResponseData {
  isBanned?: boolean;
  message?: string;
}

// Intercepteur pour vérifier la réponse et gérer les erreurs d'authentification
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponseData>) => {
    // Si l'utilisateur est banni (403 Forbidden)
    if (error.response?.status === 403) {
      if (error.response.data?.isBanned) {
        // Mettre à jour les informations utilisateur avec le flag isBanned
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const bannedUser = { ...currentUser, isBanned: true };
          localStorage.setItem("user", JSON.stringify(bannedUser));

          // Rediriger vers la page "Banni" si on n'y est pas déjà
          if (window.location.pathname !== "/banned") {
            window.location.href = "/banned";
          }
        }
      } else {
        // Erreur de permission (non liée au bannissement)
        console.error("Erreur de permission:", error.response?.data?.message);
        // Ne pas rediriger, laisser le composant gérer l'erreur
      }
    }

    // Si le token est invalide/expiré (401 Unauthorized)
    if (error.response?.status === 401) {
      // Déconnecter l'utilisateur
      authService.logout();

      // Rediriger vers la page de connexion si on n'y est pas déjà
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
