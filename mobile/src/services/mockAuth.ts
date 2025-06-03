import AsyncStorage from "@react-native-async-storage/async-storage";

// Types pour les utilisateurs et l'authentification
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// Liste d'utilisateurs en mémoire pour le développement
const users: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    password: "password123",
  },
];

// Service d'authentification local
const mockAuthService = {
  // Connexion
  login: async (email: string, password: string) => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Rechercher l'utilisateur
    const user = users.find((u) => u.email === email);

    // Vérifier si l'utilisateur existe et si le mot de passe est correct
    if (!user) {
      throw {
        response: {
          data: {
            message: "Email ou mot de passe incorrect",
          },
          status: 401,
        },
      };
    }

    if (user.password !== password) {
      throw {
        response: {
          data: {
            message: "Email ou mot de passe incorrect",
          },
          status: 401,
        },
      };
    }

    // Créer un token (simulé pour le développement)
    const token = "mock_token_" + Date.now();

    // Sauvegarder le token
    await AsyncStorage.setItem("token", token);

    // Retourner les données de l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return {
      data: {
        token,
        user: userWithoutPassword,
      },
    };
  },

  // Inscription
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Vérifier si l'email existe déjà
    const existingUser = users.find((u) => u.email === data.email);
    if (existingUser) {
      throw {
        response: {
          data: {
            message: "Cet email est déjà utilisé",
          },
          status: 400,
        },
      };
    }

    // Créer un nouvel utilisateur
    const newUser: User = {
      id: (users.length + 1).toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    };

    // Ajouter l'utilisateur à la liste
    users.push(newUser);

    // Créer un token (simulé pour le développement)
    const token = "mock_token_" + Date.now();

    // Sauvegarder le token
    await AsyncStorage.setItem("token", token);

    // Retourner les données de l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      data: {
        token,
        user: userWithoutPassword,
      },
    };
  },

  // Vérifier l'authentification
  checkAuth: async () => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Récupérer le token
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw {
        response: {
          data: {
            message: "Non authentifié",
          },
          status: 401,
        },
      };
    }

    // Simuler un utilisateur connecté
    return {
      data: {
        user: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      },
    };
  },

  // Déconnexion
  logout: async () => {
    await AsyncStorage.removeItem("token");
    return true;
  },
};

export default mockAuthService;
