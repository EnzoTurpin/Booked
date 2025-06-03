import axios from "axios";
import authService from "./auth";

const API_URL = "http://localhost:5000/api";

const professionalService = {
  // Récupérer tous les professionnels
  getAllProfessionals: async () => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/users/professionals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default professionalService;
