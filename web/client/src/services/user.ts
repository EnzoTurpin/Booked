import axios from "axios";
import http from "./http";
import { IUser } from "./auth";
import authService from "./auth";

const API_URL = "http://localhost:5000/api";

export interface IExtendedUser extends IUser {
  isBanned?: boolean;
}

export interface IUnbanRequest {
  _id: string;
  userId: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user?: IExtendedUser;
}

const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<IExtendedUser[]> => {
    try {
      const response = await http.get("/users/admin");
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors de la récupération des utilisateurs",
        }
      );
    }
  },

  // Ban a user (admin only)
  banUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await http.post(`/users/${userId}/ban`, {});
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du bannissement de l'utilisateur:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors du bannissement de l'utilisateur",
        }
      );
    }
  },

  // Unban a user (admin only)
  unbanUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await http.post(`/users/${userId}/unban`, {});
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du débannissement de l'utilisateur:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors du débannissement de l'utilisateur",
        }
      );
    }
  },

  // Delete a user (admin only)
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await http.delete(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors de la suppression de l'utilisateur",
        }
      );
    }
  },

  // Update a user (admin only)
  updateUser: async (
    userId: string,
    userData: Partial<IExtendedUser>
  ): Promise<IExtendedUser> => {
    try {
      const response = await http.put(`/users/admin/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors de la mise à jour de l'utilisateur",
        }
      );
    }
  },

  // Submit unban request (for banned users)
  submitUnbanRequest: async (message: string): Promise<{ message: string }> => {
    try {
      const response = await http.post("/unban-requests", { message });
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'envoi de la demande de débanissement:",
        error
      );
      throw (
        error.response?.data || {
          message: "Erreur lors de l'envoi de la demande de débanissement",
        }
      );
    }
  },

  // Get all unban requests (admin only)
  getUnbanRequests: async (): Promise<IUnbanRequest[]> => {
    try {
      const response = await http.get("/unban-requests");
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des demandes de débanissement:",
        error
      );
      throw (
        error.response?.data || {
          message:
            "Erreur lors de la récupération des demandes de débanissement",
        }
      );
    }
  },

  // Approve unban request (admin only)
  approveUnbanRequest: async (
    requestId: string
  ): Promise<{ message: string }> => {
    try {
      const response = await http.post(
        `/unban-requests/${requestId}/approve`,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de l'approbation de la demande:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors de l'approbation de la demande",
        }
      );
    }
  },

  // Reject unban request (admin only)
  rejectUnbanRequest: async (
    requestId: string
  ): Promise<{ message: string }> => {
    try {
      const response = await http.post(
        `/unban-requests/${requestId}/reject`,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du rejet de la demande:", error);
      throw (
        error.response?.data || {
          message: "Erreur lors du rejet de la demande",
        }
      );
    }
  },
};

export default userService;
