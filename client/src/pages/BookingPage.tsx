import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

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
      <h1 className="text-3xl font-bold mb-8 text-center">
        Prendre rendez-vous
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du service */}
          <div>
            <label
              htmlFor="service"
              className="block text-gray-700 font-semibold mb-2"
            >
              Service
            </label>
            <select
              id="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez un service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - {service.duration} min - {service.price} €
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du professionnel */}
          <div>
            <label
              htmlFor="professional"
              className="block text-gray-700 font-semibold mb-2"
            >
              Professionnel
            </label>
            <select
              id="professional"
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez un professionnel</option>
              {professionals.map((pro) => (
                <option key={pro._id} value={pro._id}>
                  {pro.firstName} {pro.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection de la date */}
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 font-semibold mb-2"
            >
              Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              locale={fr}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Sélectionnez une date"
              required
            />
          </div>

          {/* Sélection de l'heure */}
          {selectedDate && (
            <div>
              <label
                htmlFor="time"
                className="block text-gray-700 font-semibold mb-2"
              >
                Heure
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionnez une heure</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
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
