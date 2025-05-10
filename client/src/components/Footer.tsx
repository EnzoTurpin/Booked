import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Booked</h3>
            <p className="text-gray-400 mt-2">
              Système de réservation simple et efficace
            </p>
          </div>
          <div className="flex flex-col text-center md:text-right">
            <p>
              &copy; {new Date().getFullYear()} Booked. Tous droits réservés.
            </p>
            <div className="mt-2">
              <Link to="/legal" className="text-gray-400 hover:text-white mx-2">
                Mentions légales
              </Link>
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white mx-2"
              >
                Confidentialité
              </Link>
              <Link
                to="/contact"
                className="text-gray-400 hover:text-white mx-2"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
