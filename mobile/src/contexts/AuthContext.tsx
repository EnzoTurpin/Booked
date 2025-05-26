import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified?: boolean;
  phone?: string;
  role: "client" | "professional" | "admin";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ needsVerification?: boolean; email?: string } | void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ needsVerification?: boolean; email?: string } | void>;
  logout: () => void;
  setUser: (userData: User, token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger l'utilisateur à partir du token stocké
  const loadUser = async () => {
    try {
      // Vérifier si un token existe
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.log("Aucun token trouvé, utilisateur non connecté");
        setUserState(null);
        setLoading(false);
        return;
      }

      // Si un token existe, vérifier si nous devons vérifier l'email
      const needsVerification = await AsyncStorage.getItem(
        "needsEmailVerification"
      );
      if (needsVerification === "true") {
        console.log(
          "Une vérification d'email est en attente, ne pas charger l'utilisateur"
        );
        setLoading(false);
        return;
      }

      try {
        // Récupérer les informations de l'utilisateur
        const response = await apiService.get("/auth/me");

        if (response.data.success) {
          const userData = {
            id: response.data.data._id,
            email: response.data.data.email,
            firstName: response.data.data.firstName,
            lastName: response.data.data.lastName,
            isEmailVerified: response.data.data.isEmailVerified || false,
            phone: response.data.data.phone || "",
            role: response.data.data.role as
              | "client"
              | "professional"
              | "admin",
          };

          setUserState(userData);
          console.log("Utilisateur chargé avec succès:", userData.email);
        } else {
          // Si la réponse n'est pas réussie, supprimer le token
          console.log("Réponse non réussie, suppression du token");
          await AsyncStorage.removeItem("token");
          setUserState(null);
        }
      } catch (error: any) {
        // Si l'erreur est une erreur d'authentification (401), supprimer le token
        if (error.response && error.response.status === 401) {
          console.log("Token invalide, déconnexion de l'utilisateur");
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("needsEmailVerification");
          await AsyncStorage.removeItem("pendingVerificationEmail");
          await AsyncStorage.removeItem("justRegistered");
          setUserState(null);
        } else {
          // Pour les autres erreurs (comme 500), supprimez quand même le token si l'erreur persiste
          console.log(
            "Erreur temporaire lors du chargement de l'utilisateur:",
            error
          );

          // Déconnexion de l'utilisateur pour éviter les boucles infinies
          await AsyncStorage.removeItem("token");
          setUserState(null);
        }
      }
    } catch (error) {
      console.log(
        "Erreur générale lors du chargement de l'utilisateur:",
        error
      );
      // Nettoyage complet en cas d'erreur
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("needsEmailVerification");
      await AsyncStorage.removeItem("pendingVerificationEmail");
      await AsyncStorage.removeItem("justRegistered");
      setUserState(null);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'utilisateur au montage du composant
  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Nettoyer d'abord les données de session existantes
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("needsEmailVerification");
      await AsyncStorage.removeItem("pendingVerificationEmail");
      await AsyncStorage.removeItem("justRegistered");
      setUserState(null);

      console.log("Tentative de connexion pour:", email);
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      // Si l'utilisateur doit vérifier son email (réponse 200 mais avec needsVerification)
      if (response.data.success && response.data.needsVerification) {
        // Stocker l'email pour l'écran de vérification
        await AsyncStorage.setItem("pendingVerificationEmail", email);
        setLoading(false);

        // Renvoyer un objet spécial pour informer le composant Login de rediriger vers VerifyOTP
        return {
          needsVerification: true,
          email: email,
        };
      }

      if (response.data.success) {
        // Stocker le token avant de définir l'utilisateur
        console.log("Connexion réussie, stockage du token");
        await AsyncStorage.setItem("token", response.data.token);

        // Créer l'objet utilisateur à partir des données de réponse
        const userData = {
          id: response.data.user._id,
          email: response.data.user.email,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          isEmailVerified: response.data.user.isEmailVerified || true,
          phone: response.data.user.phone || "",
          role: response.data.user.role as "client" | "professional" | "admin",
        };

        // Définir l'utilisateur directement sans utiliser loadUser
        setUserState(userData);
        console.log("Utilisateur connecté avec succès:", userData.email);

        Toast.show({
          type: "success",
          text1: "Connexion réussie",
          text2: `Bienvenue, ${userData.firstName} !`,
        });

        setLoading(false);
        return { success: true };
      } else {
        throw new Error(response.data.error || "Échec de la connexion");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Une erreur est survenue";
      setError(message);
      Toast.show({
        type: "error",
        text1: "Erreur de connexion",
        text2: message,
      });

      setLoading(false);

      // Si l'email doit être vérifié, renvoyer des informations supplémentaires
      if (err.response?.data?.needsVerification) {
        return {
          needsVerification: true,
          email: err.response.data.email,
        };
      }

      throw err;
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Envoyer les données firstName et lastName directement
      const serverData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };

      console.log("Envoi de la requête d'inscription au serveur");
      const response = await apiService.post("/auth/register", serverData);
      console.log("Réponse du serveur:", response.data);

      if (response.data.success) {
        // Si l'inscription nécessite une vérification d'email
        if (response.data.needsVerification) {
          setLoading(false);
          console.log(
            "Vérification d'email nécessaire, préparation de la redirection"
          );

          // Ne pas stocker le token ici - l'utilisateur doit d'abord vérifier son email
          await AsyncStorage.setItem("pendingVerificationEmail", data.email);
          await AsyncStorage.setItem("justRegistered", "true");

          Toast.show({
            type: "success",
            text1: "Inscription réussie",
            text2: "Veuillez vérifier votre email pour activer votre compte.",
          });

          // Retourner directement l'information pour que le composant RegisterScreen puisse rediriger
          return {
            needsVerification: true,
            email: data.email,
          };
        }

        // Ce code ne devrait jamais être exécuté car tous les utilisateurs doivent vérifier leur email
        // Mais on le garde au cas où la logique changerait dans le futur
        await AsyncStorage.setItem("token", response.data.token);

        // Créer l'objet utilisateur à partir des données de réponse
        const userData = {
          id: response.data.user._id,
          email: response.data.user.email,
          firstName: response.data.user.firstName || data.firstName,
          lastName: response.data.user.lastName || data.lastName,
          isEmailVerified: response.data.user.isEmailVerified || true,
          phone: response.data.user.phone || "",
          role: response.data.user.role as "client" | "professional" | "admin",
        };

        setUserState(userData);

        Toast.show({
          type: "success",
          text1: "Inscription réussie",
          text2: `Bienvenue, ${userData.firstName} !`,
        });
      } else {
        throw new Error(response.data.error || "Échec de l'inscription");
      }
    } catch (err: any) {
      // Gérer les erreurs normales
      if (!err.needsVerification) {
        const message = err.response?.data?.error || "Une erreur est survenue";
        setError(message);
        Toast.show({
          type: "error",
          text1: "Erreur d'inscription",
          text2: message,
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Supprimer le token
      await AsyncStorage.removeItem("token");

      // Supprimer aussi toutes les autres données de session
      await AsyncStorage.removeItem("needsEmailVerification");
      await AsyncStorage.removeItem("pendingVerificationEmail");
      await AsyncStorage.removeItem("justRegistered");

      // Vider l'état de l'utilisateur
      setUserState(null);

      // Réinitialiser l'état d'erreur
      setError(null);

      console.log("Déconnexion réussie, redirection vers la page de connexion");

      Toast.show({
        type: "success",
        text1: "Déconnexion réussie",
        text2: "À bientôt !",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      Toast.show({
        type: "error",
        text1: "Erreur de déconnexion",
        text2: "Veuillez réessayer.",
      });

      // En cas d'erreur, vider quand même l'état utilisateur
      setUserState(null);
    } finally {
      setLoading(false);
    }
  };

  const setUser = async (userData: User, token: string) => {
    try {
      await AsyncStorage.setItem("token", token);
      // Supprimer les indicateurs de vérification d'email puisque l'utilisateur est maintenant vérifié
      await AsyncStorage.removeItem("needsEmailVerification");
      await AsyncStorage.removeItem("pendingVerificationEmail");
      await AsyncStorage.removeItem("justRegistered");

      // Définir directement l'utilisateur sans appeler loadUser
      setUserState(userData);
      console.log(
        "Utilisateur défini manuellement après vérification:",
        userData.email
      );
      return;
    } catch (error) {
      console.error("Erreur lors de la configuration de l'utilisateur:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
