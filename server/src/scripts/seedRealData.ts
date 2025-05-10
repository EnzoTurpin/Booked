import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Professional, Service } from "../models";
import { IProfessional } from "../models/Professional";
import { IService } from "../models/Service";
import connectDB from "../config/database";

dotenv.config();

// Données utilisateurs réels
const users = [
  {
    firstName: "Administrateur",
    lastName: "Principal",
    email: "admin@booked.fr",
    password: "password123",
    role: "admin",
    phone: "+33678901234",
  },
  {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@gmail.com",
    password: "password123",
    role: "client",
    phone: "+33612345678",
  },
  {
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@gmail.com",
    password: "password123",
    role: "professional",
    phone: "+33687654321",
  },
  {
    firstName: "Michel",
    lastName: "Leroy",
    email: "michel.leroy@gmail.com",
    password: "password123",
    role: "professional",
    phone: "+33645678912",
  },
  {
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@gmail.com",
    password: "password123",
    role: "professional",
    phone: "+33632145698",
  },
];

// Profils professionnels
const professionals = [
  {
    profession: "Coiffeur",
    bio: "Coiffeur professionnel avec 10 ans d'expérience. Spécialiste en coupes modernes et colorations.",
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },
    ],
    location: {
      address: "15 Rue de Paris",
      city: "Lyon",
      state: "Rhône-Alpes",
      zipCode: "69001",
      country: "France",
    },
  },
  {
    profession: "Médecin Généraliste",
    bio: "Médecin généraliste certifié avec 15 ans d'expérience. Consultations et suivis médicaux pour tous âges.",
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "08:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "12:00" },
    ],
    location: {
      address: "8 Avenue Victor Hugo",
      city: "Paris",
      state: "Île-de-France",
      zipCode: "75016",
      country: "France",
    },
  },
  {
    profession: "Coach Sportif",
    bio: "Coach sportif certifié, spécialisé en remise en forme, musculation et préparation physique.",
    availability: [
      { dayOfWeek: 1, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 2, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 3, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 4, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 5, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "15:00" },
    ],
    location: {
      address: "25 Rue de la République",
      city: "Marseille",
      state: "Provence-Alpes-Côte d'Azur",
      zipCode: "13001",
      country: "France",
    },
  },
];

// Services proposés
const servicesData = [
  // Services de coiffure
  {
    name: "Coupe Heeomme",
    description: "Coupe de cheveux pour homme incluant shampoing et coiffage",
    duration: 30,
    price: 25,
    category: "Coiffure",
  },
  {
    name: "Coupe Femme",
    description:
      "Coupe de cheveux pour femme incluant shampoing, soin et coiffage",
    duration: 60,
    price: 45,
    category: "Coiffure",
  },
  {
    name: "Coloration",
    description: "Coloration complète avec produits professionnels",
    duration: 90,
    price: 65,
    category: "Coiffure",
  },
  {
    name: "Balayage",
    description: "Technique de coloration pour un effet naturel et lumineux",
    duration: 120,
    price: 85,
    category: "Coiffure",
  },
  {
    name: "Coiffure Mariage",
    description:
      "Coiffure élaborée pour événement spécial, inclut essai préalable",
    duration: 90,
    price: 120,
    category: "Coiffure",
  },

  // Services médicaux
  {
    name: "Consultation Générale",
    description: "Consultation médicale standard pour tout problème de santé",
    duration: 20,
    price: 30,
    category: "Médecine",
  },
  {
    name: "Bilan de Santé Complet",
    description:
      "Examen complet avec vérification des constantes et examens préventifs",
    duration: 45,
    price: 80,
    category: "Médecine",
  },
  {
    name: "Suivi Maladie Chronique",
    description:
      "Consultation de suivi pour les patients atteints de maladies chroniques",
    duration: 30,
    price: 40,
    category: "Médecine",
  },
  {
    name: "Certificat Médical",
    description: "Examen et délivrance d'un certificat médical",
    duration: 15,
    price: 30,
    category: "Médecine",
  },

  // Services coach sportif
  {
    name: "Séance Individuelle",
    description:
      "Séance d'entraînement personnalisée avec suivi de progression",
    duration: 60,
    price: 50,
    category: "Sport",
  },
  {
    name: "Programme Personnalisé",
    description: "Élaboration d'un programme d'entraînement sur mesure",
    duration: 90,
    price: 85,
    category: "Sport",
  },
  {
    name: "Bilan Forme",
    description: "Évaluation complète de votre condition physique et objectifs",
    duration: 60,
    price: 60,
    category: "Sport",
  },
  {
    name: "Coaching Perte de Poids",
    description:
      "Programme spécifique pour la perte de poids avec suivi nutritionnel",
    duration: 60,
    price: 65,
    category: "Sport",
  },
  {
    name: "Préparation Compétition",
    description:
      "Entraînement spécifique pour préparer une compétition sportive",
    duration: 75,
    price: 80,
    category: "Sport",
  },
];

// Type pour la map des services par profession
interface ServicesByProfession {
  [key: string]: typeof servicesData;
}

// Initialisation de la base de données avec des données réelles
const initRealData = async () => {
  try {
    await connectDB();

    // Nettoyage des données existantes
    await Promise.all([
      User.deleteMany({}),
      Professional.deleteMany({}),
      Service.deleteMany({}),
    ]);

    console.log("🧹 Données existantes supprimées");

    // Création des utilisateurs
    const createdUsers = await User.create(users);
    console.log(`👤 ${createdUsers.length} utilisateurs créés`);

    // Récupération des utilisateurs professionnels
    const professionalUsers = createdUsers.filter(
      (user) => user.role === "professional"
    );

    // Création des profils professionnels
    const createdProfessionals: IProfessional[] = [];
    for (let i = 0; i < professionalUsers.length; i++) {
      const professionalData = {
        ...professionals[i],
        userId: professionalUsers[i]._id,
      };
      const createdProfessional = await Professional.create(professionalData);
      createdProfessionals.push(createdProfessional);
    }
    console.log(
      `👨‍⚕️ ${createdProfessionals.length} profils professionnels créés`
    );

    // Création des services par professionnel
    const servicesMap: ServicesByProfession = {
      Coiffeur: servicesData.filter((s) => s.category === "Coiffure"),
      "Médecin Généraliste": servicesData.filter(
        (s) => s.category === "Médecine"
      ),
      "Coach Sportif": servicesData.filter((s) => s.category === "Sport"),
    };

    // Création des services pour chaque professionnel
    let totalServices = 0;
    for (const professional of createdProfessionals) {
      const profession = professional.profession as keyof ServicesByProfession;
      const professionServices = servicesMap[profession];

      if (professionServices) {
        const servicesWithProfessionalId = professionServices.map(
          (service) => ({
            ...service,
            professionalId: professional._id,
          })
        );

        const createdServicesArray = await Service.create(
          servicesWithProfessionalId
        );
        // Convertir en tableau s'il ne l'est pas déjà
        const createdServices = Array.isArray(createdServicesArray)
          ? createdServicesArray
          : [createdServicesArray];

        totalServices += createdServices.length;

        // Mise à jour du professionnel avec les IDs des services
        await Professional.findByIdAndUpdate(professional._id, {
          services: createdServices.map((service: IService) => service._id),
        });
      }
    }

    console.log(`🛠️ ${totalServices} services créés`);
    console.log("✅ Base de données initialisée avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
  } finally {
    await mongoose.connection.close();
    console.log("📦 Connexion à la base de données fermée");
    process.exit(0);
  }
};

initRealData();
