import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaUser, FaArrowRight } from "react-icons/fa";
import { IconType } from "react-icons";

// Function to create a wrapped icon component that returns a properly typed JSX element
const createIconComponent = (Icon: IconType, size: number) => {
  const IconComponent = () => <span>{Icon({ size })}</span>;
  return IconComponent;
};

// Create wrapped icon components
const UserIcon = createIconComponent(FaUser, 30);
const CalendarIcon = createIconComponent(FaCalendarAlt, 30);
const ClockIcon = createIconComponent(FaClock, 30);

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col space-y-16 bg-beige min-h-screen">
      {/* Hero Section */}
      <section className="bg-sage-dark text-offwhite rounded-b-3xl shadow-xl overflow-hidden pt-16 pb-20 px-4">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-20 z-0"></div>
          <div className="text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight animate-fade-in">
              Réservez vos rendez-vous <br className="hidden md:block" />
              <span className="text-beige">en quelques clics</span>
            </h1>
            <p className="text-xl md:text-2xl text-offwhite/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Simple, rapide et efficace. Notre plateforme vous permet de gérer
              facilement tous vos rendez-vous.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/booking"
                className="group bg-offwhite text-brown font-bold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition duration-300 flex items-center gap-2"
              >
                Prendre rendez-vous
                {FaArrowRight({
                  className:
                    "group-hover:translate-x-1 transition-transform duration-300",
                })}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-beige opacity-20"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-brown">
          Comment ça marche
        </h2>
        <p className="text-brown/80 text-center max-w-2xl mx-auto mb-16 text-lg">
          Trois étapes simples pour réserver votre prochain rendez-vous
        </p>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="bg-offwhite p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-sage/20 relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center justify-center w-16 h-16 bg-sage-dark rounded-full shadow-md">
                <span className="text-offwhite">
                  <UserIcon />
                </span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold mb-4 text-brown">
                Créez votre compte
              </h3>
              <p className="text-brown/80 leading-relaxed">
                Inscrivez-vous en quelques secondes pour accéder à toutes les
                fonctionnalités de réservation.
              </p>
            </div>
          </div>

          <div className="bg-offwhite p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-sage/20 relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center justify-center w-16 h-16 bg-sage-dark rounded-full shadow-md">
                <span className="text-offwhite">
                  <CalendarIcon />
                </span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold mb-4 text-brown">
                Choisissez une date
              </h3>
              <p className="text-brown/80 leading-relaxed">
                Sélectionnez le service et la date qui vous conviennent dans
                notre calendrier interactif.
              </p>
            </div>
          </div>

          <div className="bg-offwhite p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-sage/20 relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center justify-center w-16 h-16 bg-sage-dark rounded-full shadow-md">
                <span className="text-offwhite">
                  <ClockIcon />
                </span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold mb-4 text-brown">
                Confirmez votre réservation
              </h3>
              <p className="text-brown/80 leading-relaxed">
                Validez votre rendez-vous et recevez une confirmation
                instantanée par email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brown text-offwhite rounded-2xl p-12 mx-4 md:mx-auto max-w-5xl shadow-xl transform hover:scale-[1.01] transition-transform duration-300 mb-20">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 text-center max-w-2xl mx-auto text-beige">
            Réservez votre premier rendez-vous dès maintenant et découvrez la
            simplicité de notre plateforme.
          </p>
          <div className="flex justify-center">
            <Link
              to="/register"
              className="bg-sage-dark text-offwhite hover:bg-sage font-bold py-4 px-10 rounded-xl shadow-md transition duration-300 inline-flex items-center gap-2 text-lg"
            >
              S'inscrire gratuitement
              {FaArrowRight({ className: "text-sm" })}
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-pattern opacity-10 rounded-2xl"></div>
      </section>
    </div>
  );
};

export default HomePage;
