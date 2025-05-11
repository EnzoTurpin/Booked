import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import authService, { IUser } from "../services/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ token: string; user: IUser }>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = () => {
    const tokenExists = authService.isLoggedIn();
    setIsAuthenticated(tokenExists);

    if (tokenExists) {
      setUser(authService.getCurrentUser());
    } else {
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth();

    // Écouter les changements de localStorage (connexion/déconnexion dans d'autres onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user" || e.key === null) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    checkAuth();
    return response;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
