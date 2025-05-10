import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaClock, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import api, { IService } from "../services/api";

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Utilisation de notre API pour récupérer les services avec détails des professionnels
        const servicesData = await api.getServicesWithDetails();
        setServices(servicesData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des services:", err);
        setError(
          "Impossible de charger les services. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fonction pour obtenir le nom du professionnel à partir des données de service
  const getProfessionalName = (service: IService) => {
    if (service.professional?.user) {
      return `${service.professional.user.firstName} ${service.professional.user.lastName}`;
    }
    return "Professionnel non disponible";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md text-center">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
          {services.length === 0 ? (
            <p className="text-center col-span-2 text-gray-500">
              Aucun service disponible pour le moment.
            </p>
          ) : (
            services.map((service) => (
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
                      <span className="mr-1.5">{FaClock({})}</span>
                      {service.duration} min
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {service.professional && (
                    <div className="mb-4 bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-700 flex items-center mb-2">
                        <span className="text-indigo-500 mr-2">
                          {FaUser({})}
                        </span>
                        <span className="font-medium">
                          {getProfessionalName(service)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {service.professional.profession}
                        </span>
                      </div>

                      {service.professional.location && (
                        <div className="text-gray-700 flex items-center text-sm">
                          <span className="text-indigo-500 mr-2">
                            {FaMapMarkerAlt({})}
                          </span>
                          <span>
                            {service.professional.location.city},{" "}
                            {service.professional.location.country}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                      {service.category}
                    </span>
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      {service.price} €
                    </div>
                  </div>

                  <Link
                    to={`/booking?service=${service._id}`}
                    className="mt-6 block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 flex items-center justify-center gap-2 group"
                  >
                    <span>Réserver maintenant</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {FaArrowRight({})}
                    </span>
                  </Link>
                </div>
              </div>
            ))
          )}
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
              <span className="text-sm">{FaArrowRight({})}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
