import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-toastify";
import axios from "axios"; // axios pour l'appel API
import authService from "../services/auth"; // authService pour récupérer le token et l'utilisateur

interface Appointment {
  _id: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  professionalId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clientId: {
    // Ajouter clientId car nous allons le peupler pour le professionnel
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  startTime: string;
  endTime: string;
  notes?: string;
}

const ProfessionalAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user && user.role === "professional") {
      fetchProfessionalAppointments();
    } else {
      // Rediriger ou afficher un message d'erreur si l'utilisateur n'est pas un professionnel
      setIsLoading(false);
      toast.error("Accès refusé. Cette page est réservée aux professionnels.");
      // Vous pourriez utiliser useHistory ou useNavigation pour rediriger
    }
  }, [user]);

  const fetchProfessionalAppointments = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
      }
      console.log(
        "🔄 [PRO_APPT_PAGE] Appel à la route /api/appointments/professional/me"
      );
      // Appel à la nouvelle route serveur pour les rendez-vous du professionnel
      const response = await axios.get(
        `http://localhost:5000/api/appointments/professional/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ [PRO_APPT_PAGE] Réponse du serveur:", response.data);
      // Filtrer les rendez-vous pour n'afficher que ceux avec le statut 'confirmed'
      const confirmedAppointments = response.data.filter(
        (appt: Appointment) => appt.status === "confirmed"
      );
      console.log(
        "🔍 [PRO_APPT_PAGE] Rendez-vous filtrés (confirmés):",
        confirmedAppointments
      );
      setAppointments(confirmedAppointments);
    } catch (error) {
      console.error(
        "❌ [PRO_APPT_PAGE] Erreur lors du chargement des rendez-vous professionnels:",
        error
      );
      toast.error("Impossible de charger vos rendez-vous. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions utilitaires pour le formatage et le statut (copiées de MyAppointmentsPage pour l'instant)
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

  // Pas de bouton Annuler ici pour l'instant, si besoin on l'ajoutera plus tard.

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

  // Si l'utilisateur n'est pas un professionnel, afficher un message d'erreur
  if (user?.role !== "professional") {
    return (
      <div className="text-center py-8 text-red-500">
        Vous n'avez pas l'autorisation de voir cette page.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center text-brown">
        Mes Rendez-vous Confirmés
      </h1>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-brown/80">
            Vous n'avez pas encore de rendez-vous confirmés.
          </p>
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
                    {/* Afficher le nom du client pour le professionnel */}
                    <h2 className="text-xl font-bold text-brown">
                      Rendez-vous avec {appointment.clientId.firstName}{" "}
                      {appointment.clientId.lastName}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionalAppointmentsPage;
