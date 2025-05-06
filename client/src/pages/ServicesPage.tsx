import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaClock, FaUser } from "react-icons/fa";

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

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    // Dans un environnement réel, vous feriez un appel API pour récupérer les services
    const fetchData = async () => {
      try {
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
          {
            _id: "5",
            name: "Brushing",
            description: "Brushing et mise en forme",
            duration: 45,
            price: 35,
            professionalId: "1",
          },
          {
            _id: "6",
            name: "Shampoing",
            description: "Shampoing et soin",
            duration: 20,
            price: 15,
            professionalId: "2",
          },
        ]);

        setProfessionals([
          { _id: "1", firstName: "Sophie", lastName: "Martin" },
          { _id: "2", firstName: "Thomas", lastName: "Dubois" },
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, []);

  // Fonction pour obtenir le nom du professionnel par ID
  const getProfessionalName = (professionalId: string) => {
    const professional = professionals.find((p) => p._id === professionalId);
    return professional
      ? `${professional.firstName} ${professional.lastName}`
      : "Inconnu";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 animate-fade-in">
            Nos <span className="text-indigo-600">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre gamme de services professionnels pour répondre à
            tous vos besoins.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {service.name}
                  </h2>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center">
                    {FaClock({ className: "mr-1.5" })}
                    {service.duration} min
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-gray-700 flex items-center">
                    {FaUser({ className: "text-indigo-500 mr-2" })}
                    <span className="font-medium">
                      {getProfessionalName(service.professionalId)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    {service.price} €
                  </div>
                </div>

                <Link
                  to={`/booking?service=${service._id}`}
                  className="mt-6 block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Réserver maintenant</span>
                  {FaArrowRight({
                    className:
                      "group-hover:translate-x-1 transition-transform duration-300",
                  })}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Besoin d'aide pour choisir ?
            </h2>
            <p className="text-lg mb-6 text-indigo-100">
              Notre équipe est disponible pour vous conseiller et répondre à
              toutes vos questions.
            </p>
            <Link
              to="/contact"
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl shadow-md transition duration-300 inline-flex items-center gap-2"
            >
              Contactez-nous
              {FaArrowRight({ className: "text-sm" })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
