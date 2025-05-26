import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  _id: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  service: {
    _id: string;
    name: string;
    duration: number;
    price: number;
  };
  professional: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simuler un chargement de données
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // Normalement, vous feriez un appel API ici
        // const response = await axios.get('http://localhost:5000/api/appointments/user/{userId}');
        // setAppointments(response.data);

        // Données simulées pour l'exemple
        setTimeout(() => {
          setAppointments([
            {
              _id: "1",
              date: new Date(Date.now() + 86400000 * 2).toISOString(), // Dans 2 jours
              status: "confirmed",
              service: {
                _id: "1",
                name: "Coupe homme",
                duration: 30,
                price: 25,
              },
              professional: {
                _id: "1",
                firstName: "Sophie",
                lastName: "Martin",
              },
            },
            {
              _id: "2",
              date: new Date(Date.now() + 86400000 * 7).toISOString(), // Dans 7 jours
              status: "pending",
              service: {
                _id: "3",
                name: "Coloration",
                duration: 90,
                price: 70,
              },
              professional: {
                _id: "2",
                firstName: "Thomas",
                lastName: "Dubois",
              },
            },
            {
              _id: "3",
              date: new Date(Date.now() - 86400000 * 5).toISOString(), // Il y a 5 jours
              status: "completed",
              service: {
                _id: "2",
                name: "Coupe femme",
                duration: 60,
                price: 45,
              },
              professional: {
                _id: "1",
                firstName: "Sophie",
                lastName: "Martin",
              },
            },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Erreur lors du chargement des rendez-vous:", error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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
    // Dans un environnement réel, vous feriez un appel API ici
    // await axios.patch(`http://localhost:5000/api/appointments/${id}/status`, { status: 'cancelled' });

    // Mise à jour de l'état local
    setAppointments(
      appointments.map((appointment) =>
        appointment._id === id
          ? { ...appointment, status: "cancelled" }
          : appointment
      )
    );
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
                      {appointment.service.name}
                    </h2>
                    <p className="text-brown/80 mt-1">
                      avec {appointment.professional.firstName}{" "}
                      {appointment.professional.lastName}
                    </p>
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
                    {formatDate(appointment.date)} à{" "}
                    {formatTime(appointment.date)}
                  </span>
                </div>

                <div className="mt-2 flex items-center text-brown/80">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{appointment.service.duration} minutes</span>
                </div>

                <div className="mt-2 flex items-center text-brown/80">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{appointment.service.price} €</span>
                </div>

                {(appointment.status === "pending" ||
                  appointment.status === "confirmed") && (
                  <button
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    Annuler ce rendez-vous
                  </button>
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
