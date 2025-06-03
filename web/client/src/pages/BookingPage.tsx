import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelect from "../components/CustomSelect/CustomSelect";
import professionalService from "../services/professional";
import { toast } from "react-toastify";
import axios from "axios";
import authService from "../services/auth";

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  professionalId: string;
}

function generateTimeSlots(start: string, end: string, stepMinutes = 30) {
  const slots = [];
  let [hour, minute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  while (hour < endHour || (hour === endHour && minute <= endMinute)) {
    slots.push(
      `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );
    minute += stepMinutes;
    if (minute >= 60) {
      hour += 1;
      minute = 0;
    }
  }
  return slots;
}

// Fonction pour rendre la grille de créneaux horaires
function renderTimeSlots(
  availableTimes: string[],
  selectedTime: string,
  setSelectedTime: (t: string) => void,
  start: string | undefined,
  end: string | undefined
) {
  if (!start || !end || availableTimes.length === 0) {
    return (
      <div className="col-span-3 text-red-500 text-center">
        Aucun créneau disponible ce jour
      </div>
    );
  }

  const allSlots = generateTimeSlots(start, end);

  return allSlots.map((slot) => {
    const isAvailable = availableTimes.includes(slot);
    return (
      <button
        key={slot}
        type="button"
        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
          ${
            isAvailable
              ? selectedTime === slot
                ? "bg-sage text-white border-sage"
                : "bg-white text-brown border-sage hover:bg-sage/20"
              : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
          }
        `}
        disabled={!isAvailable}
        onClick={() => isAvailable && setSelectedTime(slot)}
      >
        {slot}
      </button>
    );
  });
}

const BookingPage: React.FC = () => {
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workingHoursRange, setWorkingHoursRange] = useState<{
    start: string | undefined;
    end: string | undefined;
  }>({ start: undefined, end: undefined });

  useEffect(() => {
    const fetchProfessionals = async () => {
      console.log("Attempting to fetch professionals...");
      try {
        const data = await professionalService.getAllProfessionals();
        console.log("Fetched professionals data:", data);
        setProfessionals(data);
        console.log("Professionals state after setting:", data);
      } catch (error) {
        console.error("Erreur lors du chargement des professionnels:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          });
        }
        toast.error("Impossible de charger la liste des professionnels");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      setAvailableTimes([]);
      setWorkingHoursRange({ start: undefined, end: undefined });

      if (!selectedProfessional || !selectedDate) {
        return;
      }

      const dayOfWeek = selectedDate.getDay();
      const dateStr = selectedDate.toISOString().split("T")[0]; // Format YYYY-MM-DD

      try {
        // 1. Récupérer les horaires de travail et les rendez-vous pris pour ce jour
        const { data } = await axios.get(
          `http://localhost:5000/api/professional/${selectedProfessional}/working-hours?day=${dayOfWeek}&date=${dateStr}`,
          { headers: { Authorization: `Bearer ${authService.getToken()}` } }
        );

        if (!data.isOpen) {
          // Si le professionnel ne travaille pas ce jour-là
          setAvailableTimes([]);
          setWorkingHoursRange({ start: undefined, end: undefined });
          return;
        }

        // Mettre à jour l'état avec les horaires de travail du jour
        setWorkingHoursRange({ start: data.start, end: data.end });

        // 2. Générer tous les créneaux possibles pour la journée travaillée
        const allSlots = generateTimeSlots(data.start, data.end);

        // 3. Extraire les heures de début des rendez-vous pris
        const takenTimes = data.appointments.map((a: any) => a.startTime);

        // 4. Filtrer les créneaux pour n'inclure que ceux qui ne sont pas pris
        setAvailableTimes(
          allSlots.filter((slot) => !takenTimes.includes(slot))
        );
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des créneaux disponibles:",
          error
        );
        setAvailableTimes([]);
        setWorkingHoursRange({ start: undefined, end: undefined });
        toast.error("Erreur lors du chargement des créneaux disponibles.");
      }
    };
    fetchAvailableTimes();
  }, [selectedProfessional, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("handleSubmit called.");
    console.log("Value of selectedProfessional:", selectedProfessional);

    if (!selectedProfessional || !selectedDate || !selectedTime) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const userId = authService.getCurrentUser()?._id;
      const token = authService.getToken();

      if (!userId) {
        toast.error("Vous devez être connecté pour prendre rendez-vous.");
        return;
      }

      if (!token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      // Trouver le professionnel sélectionné pour obtenir son professionalId
      const selectedProf = professionals.find(
        (p) => p._id === selectedProfessional
      );
      if (!selectedProf) {
        toast.error("Le professionnel sélectionné n'existe pas.");
        return;
      }

      // Calculer l'heure de fin (30 minutes après l'heure de début)
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const endTimeDate = new Date();
      endTimeDate.setHours(hours);
      endTimeDate.setMinutes(minutes + 30);
      const endTime = `${endTimeDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${endTimeDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      console.log("Token envoyé:", token);
      console.log("Données envoyées:", {
        clientId: userId,
        professionalId: selectedProf._id,
        date: dateStr,
        startTime: selectedTime,
        endTime: endTime,
        notes: "",
        status: "scheduled",
      });

      const response = await axios.post(
        "http://localhost:5000/api/appointments",
        {
          clientId: userId,
          professionalId: selectedProf._id,
          date: dateStr,
          startTime: selectedTime,
          endTime: endTime,
          notes: "",
          status: "scheduled",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Réponse du serveur:", response.data);
      toast.success("Rendez-vous réservé avec succès!");
      setSelectedProfessional("");
      setSelectedDate(null);
      setSelectedTime("");
    } catch (error: any) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      console.error("Détails de l'erreur:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      toast.error(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la réservation"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto"></div>
          <p className="mt-4 text-brown/80">Chargement des professionnels...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering BookingPage. Professionals state:", professionals);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-brown">
        Prendre rendez-vous
      </h1>

      <div className="bg-offwhite rounded-lg shadow-md p-8 border border-sage/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du professionnel */}
          <div>
            <label
              htmlFor="professional"
              className="block text-brown font-semibold mb-2"
            >
              Professionnel
            </label>
            <CustomSelect
              id="professional"
              name="professional"
              value={selectedProfessional}
              onChange={setSelectedProfessional}
              options={professionals.map((pro) => ({
                value: pro._id,
                label: `${pro.firstName} ${pro.lastName}`,
              }))}
              placeholder="Sélectionnez un professionnel"
              required
              className="w-full"
            />
          </div>

          {/* Sélection de la date */}
          <div>
            <label
              htmlFor="date"
              className="block text-brown font-semibold mb-2"
            >
              Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              locale={fr}
              className="w-full p-3 border border-sage/30 rounded-lg focus:ring-sage focus:border-sage bg-offwhite text-brown"
              placeholderText="Sélectionnez une date"
              required
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              todayButton="Aujourd'hui"
              previousMonthButtonLabel="Mois précédent"
              nextMonthButtonLabel="Mois suivant"
              ariaLabelledBy="date"
              inline={false}
              fixedHeight
            />
          </div>

          {/* Sélection de l'heure */}
          {selectedDate && (
            <div>
              <label
                htmlFor="time"
                className="block text-brown font-semibold mb-2"
              >
                Heure
              </label>
              <div className="grid grid-cols-3 gap-2">
                {renderTimeSlots(
                  availableTimes,
                  selectedTime,
                  setSelectedTime,
                  workingHoursRange.start,
                  workingHoursRange.end
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-sage text-brown px-6 py-2 rounded-lg hover:bg-sage-light transition-colors"
            >
              Réserver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
