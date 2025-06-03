import axios from "axios";
import authService from "./auth";

const API_URL = "http://localhost:5000/api";

const appointmentService = {
  // Récupérer tous les rendez-vous de l'utilisateur connecté
  getUserAppointments: async () => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/appointments/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Annuler un rendez-vous
  cancelAppointment: async (appointmentId: string) => {
    const token = authService.getToken();
    const response = await axios.patch(
      `${API_URL}/appointments/status/${appointmentId}`,
      { status: "cancelled" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default appointmentService;
