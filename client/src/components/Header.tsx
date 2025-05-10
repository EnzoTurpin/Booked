import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            <Link to="/">Booked</Link>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:text-blue-200">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-200">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-blue-200">
                  Réserver
                </Link>
              </li>
              <li>
                <Link to="/my-appointments" className="hover:text-blue-200">
                  Mes Rendez-vous
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-200">
                  Connexion
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
