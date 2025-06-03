import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-toastify";
import appointmentService from "../services/appointment";
import authService from "../services/auth";
import axios from "axios";

interface Appointment {
  _id: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  professionalId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  startTime: string;
  endTime: string;
  paymentAmount?: number;
  notes?: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Initialize user state once on mount
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!currentUser || !token) {
        console.log(
          "⚠️ [MY_APPT_PAGE] User or token not available, skipping fetch.",
          { user: currentUser, token: token ? "Available" : "Unavailable" }
        );
        setIsLoading(false);
        return;
      }

      let data = [];

      if (currentUser.role === "client") {
        // Logique existante pour les clients
        console.log("🔄 [MY_APPT_PAGE] Fetching appointments for client...");
        data = await appointmentService.getUserAppointments();
        console.log("✅ [MY_APPT_PAGE] Fetched client appointments:", data);
      } else if (currentUser.role === "professional") {
        // Nouvelle logique pour les professionnels
        console.log(
          "🔄 [MY_APPT_PAGE] Fetching appointments for professional..."
        );
        const response = await axios.get(
          `http://localhost:5000/api/appointments/professional/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(
          "✅ [MY_APPT_PAGE] Raw professional appointments data:",
          response.data
        );
        // Filtrer pour n'afficher que les rendez-vous confirmés pour le professionnel
        data = response.data.filter(
          (appt: Appointment) => appt.status === "confirmed"
        );
        console.log(
          "🔍 [MY_APPT_PAGE] Filtered confirmed professional appointments:",
          data
        );
      }

      setAppointments(data);
    } catch (error) {
      console.error(
        "❌ [MY_APPT_PAGE] Erreur lors du chargement des rendez-vous:",
        error
      );
      toast.error("Impossible de charger vos rendez-vous. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, fetchAppointments]);

  const getStatusClass = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm", { locale: fr });
    } catch (error) {
      return "--:--";
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      toast.success("Rendez-vous annulé avec succès");
      fetchAppointments(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
      toast.error("Impossible d'annuler le rendez-vous. Veuillez réessayer.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto"></div>
          <p className="mt-4 text-brown/80">Chargement de vos rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center text-brown">
        Mes Rendez-vous
      </h1>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-brown/80">
            Vous n'avez pas encore de rendez-vous.
          </p>
          <a
            href="/booking"
            className="mt-4 inline-block bg-sage text-brown px-6 py-2 rounded-lg hover:bg-sage-light transition-colors"
          >
            Prendre rendez-vous
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-offwhite rounded-lg shadow-md overflow-hidden border border-sage/20"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-brown">
                      {currentUser?.role === "professional"
                        ? `Rendez-vous avec ${appointment.clientId?.firstName} ${appointment.clientId?.lastName}`
                        : `Rendez-vous avec ${appointment.professionalId?.firstName} ${appointment.professionalId?.lastName}`}
                    </h2>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {getStatusText(appointment.status)}
                  </div>
                </div>

                <div className="mt-4 flex items-center text-brown/80">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-sage"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {formatDate(appointment.date)} de {appointment.startTime} à{" "}
                    {appointment.endTime}
                  </span>
                </div>

                {appointment.status === "pending" && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Annuler le rendez-vous
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
