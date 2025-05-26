import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-beige p-4">
      <div className="text-9xl font-bold text-primary-500">404</div>
      <h1 className="mt-4 text-3xl font-bold text-gray-800">
        Page non trouvée
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Désolé, la page que vous recherchez n'existe pas.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition duration-300"
      >
        Retourner à l'accueil
      </Link>
    </div>
  );
};

export default NotFoundPage;
