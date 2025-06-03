import axios from "axios";
import http from "./http";

const API_URL = "http://localhost:5000/api";

export interface IRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface IVerifyEmailData {
  email: string;
  verificationCode: string;
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  profileImage?: string;
  isBanned?: boolean;
}

export interface IRegistrationResponse {
  user: IUser;
  message: string;
}

export interface IResetPasswordRequest {
  email: string;
}

export interface IResetPasswordConfirm {
  email: string;
  token: string;
  newPassword: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdateProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImage?: string | File;
}

const authService = {
  // Inscription d'un utilisateur
  register: async (
    userData: IRegistrationData
  ): Promise<IRegistrationResponse> => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      throw (
        error.response?.data || {
          message: "Erreur inconnue lors de l'inscription",
        }
      );
    }
  },

  // Connexion d'un utilisateur
  login: async (
    credentials: ILoginData
  ): Promise<{ token: string; user: IUser }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      // Stocker le token JWT dans le localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);

      // Si l'utilisateur est banni
      if (error.response?.status === 403 && error.response.data?.isBanned) {
        // Stocker les informations de l'utilisateur banni
        const bannedUser = {
          _id: error.response.data.user?._id || "banned",
          email: credentials.email,
          firstName: error.response.data.user?.firstName || "",
          lastName: error.response.data.user?.lastName || "",
          phone: error.response.data.user?.phone || "",
          role: error.response.data.user?.role || "user",
          isEmailVerified: true,
          isBanned: true,
        };

        // Stocker l'utilisateur banni dans le localStorage
        localStorage.setItem("user", JSON.stringify(bannedUser));
        localStorage.setItem("token", "banned");

        // Rediriger vers la page banni
        window.location.href = "/banned";
        return { token: "banned", user: bannedUser };
      }

      throw (
        error.response?.data || { message: "Email ou mot de passe incorrect" }
      );
    }
  },

  // Vérification de l'email avec le code de vérification
  verifyEmail: async (
    verifyData: IVerifyEmailData
  ): Promise<{ message: string; user: IUser }> => {
    try {
      const response = await axios.post(
        `${API_URL}/users/verify-email`,
        verifyData
      );
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la vérification de l'email:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors de la vérification de l'email",
        }
      );
    }
  },

  // Renvoyer le code de vérification
  resendVerificationCode: async (
    email: string
  ): Promise<{ message: string }> => {
    try {
      const response = await axios.post(
        `${API_URL}/users/resend-verification`,
        { email }
      );
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du renvoi du code de vérification:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors du renvoi du code de vérification",
        }
      );
    }
  },

  // Déconnexion
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Vérifier si l'utilisateur est connecté
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // Récupérer les informations de l'utilisateur connecté
  getCurrentUser: (): IUser | null => {
    const userString = localStorage.getItem("user");
    console.log(
      "🔄 [authService] Getting current user from localStorage:",
      userString
    );

    if (userString) {
      try {
        const user = JSON.parse(userString);
        console.log("🔄 [authService] Parsed user:", user);
        return user;
      } catch (error) {
        console.error(
          "🔄 [authService] Error parsing user from localStorage:",
          error
        );
        return null;
      }
    }
    return null;
  },

  // Récupérer le token JWT
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // Demande de réinitialisation de mot de passe
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de la demande de réinitialisation de mot de passe:",
        error
      );
      throw (
        error.response?.data || {
          message:
            "Erreur lors de la demande de réinitialisation de mot de passe",
        }
      );
    }
  },

  // Réinitialisation du mot de passe avec token
  resetPassword: async (
    resetData: IResetPasswordConfirm
  ): Promise<{ message: string }> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/reset-password`,
        resetData
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe:",
        error
      );
      throw (
        error.response?.data || {
          message: "Erreur lors de la réinitialisation du mot de passe",
        }
      );
    }
  },

  // Changement de mot de passe pour un utilisateur connecté
  changePassword: async (
    changePasswordData: IChangePasswordRequest
  ): Promise<{ message: string }> => {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/users/change-password`,
        changePasswordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors du changement de mot de passe",
        }
      );
    }
  },

  // Mise à jour du profil utilisateur
  updateProfile: async (
    userId: string,
    profileData: IUpdateProfileData
  ): Promise<IUser> => {
    try {
      const token = authService.getToken();

      // Utiliser FormData pour l'upload de fichier
      const formData = new FormData();
      formData.append("firstName", profileData.firstName);
      formData.append("lastName", profileData.lastName);
      formData.append("phoneNumber", profileData.phoneNumber || "");

      // Ajouter l'image si elle existe
      if (profileData.profileImage) {
        if (profileData.profileImage instanceof File) {
          formData.append("profileImage", profileData.profileImage);
        } else if (typeof profileData.profileImage === "string") {
          formData.append("profileImageUrl", profileData.profileImage);
        }
      }

      const response = await axios.put(`${API_URL}/users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Mettre à jour les informations utilisateur dans le localStorage
      const updatedUser = response.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors de la mise à jour du profil",
        }
      );
    }
  },

  // Vérifier l'état de l'authentification actuel
  checkAuthStatus: async (): Promise<IUser> => {
    try {
      console.log("🔄 [authService] Checking auth status");
      const response = await http.get("/auth/check");
      console.log("🔄 [authService] Auth check response:", response.data);

      // Si l'utilisateur est banni, ne pas mettre à jour le localStorage
      if (response.data.user.isBanned) {
        console.log("🔄 [authService] User is banned");
        return response.data.user;
      }

      // Mettre à jour les données utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error: any) {
      console.error("🔄 [authService] Auth check error:", error);
      // Si l'utilisateur est banni, retourner les informations du localStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser?.isBanned) {
        return currentUser;
      }
      authService.logout();
      throw error.response?.data || { message: "Non authentifié" };
    }
  },
};

export default authService;
