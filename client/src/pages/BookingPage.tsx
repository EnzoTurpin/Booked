import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelect from "../components/CustomSelect";

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  professionalId: string;
}

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
}

const BookingPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    // Ces fonctions seraient normalement un appel API réel
    const fetchServices = async () => {
      try {
        // Dans un environnement réel, vous utiliseriez:
        // const response = await axios.get('http://localhost:5000/api/services');
        // setServices(response.data);

        // Données simulées pour l'exemple
        setServices([
          {
            _id: "1",
            name: "Coupe homme",
            description: "Coupe et style pour homme",
            duration: 30,
            price: 25,
            professionalId: "1",
          },
          {
            _id: "2",
            name: "Coupe femme",
            description: "Coupe et brushing pour femme",
            duration: 60,
            price: 45,
            professionalId: "1",
          },
          {
            _id: "3",
            name: "Coloration",
            description: "Coloration complète",
            duration: 90,
            price: 70,
            professionalId: "2",
          },
          {
            _id: "4",
            name: "Coupe enfant",
            description: "Coupe pour enfant",
            duration: 20,
            price: 15,
            professionalId: "2",
          },
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
      }
    };

    const fetchProfessionals = async () => {
      try {
        // Dans un environnement réel, vous utiliseriez:
        // const response = await axios.get('http://localhost:5000/api/users?role=professional');
        // setProfessionals(response.data);

        // Données simulées pour l'exemple
        setProfessionals([
          { _id: "1", firstName: "Sophie", lastName: "Martin" },
          { _id: "2", firstName: "Thomas", lastName: "Dubois" },
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des professionnels:", error);
      }
    };

    fetchServices();
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // Générer des horaires disponibles (9h à 17h avec des incréments de 30 minutes)
      const times = [];
      const startHour = 9;
      const endHour = 17;
      for (let hour = startHour; hour <= endHour; hour++) {
        times.push(`${hour}:00`);
        if (hour < endHour) {
          times.push(`${hour}:30`);
        }
      }
      setAvailableTimes(times);
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ici, vous feriez un appel API réel pour créer un rendez-vous
    try {
      // const response = await axios.post('http://localhost:5000/api/appointments', {
      //   userId: 'user_id_placeholder', // Normalement issu de votre système d'authentification
      //   professionalId: selectedProfessional,
      //   serviceId: selectedService,
      //   date: new Date(`${format(selectedDate as Date, 'yyyy-MM-dd')}T${selectedTime}`),
      //   status: 'pending',
      //   notes: ''
      // });

      alert("Rendez-vous réservé avec succès!");
      // Réinitialiser le formulaire
      setSelectedService("");
      setSelectedProfessional("");
      setSelectedDate(null);
      setSelectedTime("");
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      alert(
        "Une erreur est survenue lors de la réservation. Veuillez réessayer."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-brown">
        Prendre rendez-vous
      </h1>

      <div className="bg-offwhite rounded-lg shadow-md p-8 border border-sage/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du service */}
          <div>
            <label
              htmlFor="service"
              className="block text-brown font-semibold mb-2"
            >
              Service
            </label>
            <CustomSelect
              id="service"
              name="service"
              value={selectedService}
              onChange={setSelectedService}
              options={services.map((service) => ({
                value: service._id,
                label: `${service.name} - ${service.duration} min - ${service.price} €`,
              }))}
              placeholder="Sélectionnez un service"
              required
              className="w-full"
            />
          </div>

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
              <CustomSelect
                id="time"
                name="time"
                value={selectedTime}
                onChange={setSelectedTime}
                options={availableTimes.map((time) => ({
                  value: time,
                  label: time,
                }))}
                placeholder="Sélectionnez une heure"
                required
                className="w-full"
              />
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full bg-sage hover:bg-sage-light text-brown font-bold py-3 px-6 rounded-lg transition duration-300"
            disabled={
              !selectedService ||
              !selectedProfessional ||
              !selectedDate ||
              !selectedTime
            }
          >
            Confirmer la réservation
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
