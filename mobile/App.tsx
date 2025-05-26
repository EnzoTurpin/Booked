import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { realmService } from "./src/services";
import "./src/styles/global.css";

export default function App() {
  const [apiConnected, setApiConnected] = useState(false);

  // Vérifier la connexion à l'API au démarrage
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // Récupérer l'URL de l'API depuis les variables d'environnement ou utiliser une valeur par défaut
        const apiUrl = process.env.API_URL || "http://172.20.10.4:5000/api";
        console.log("Vérification de la connexion à l'API:", apiUrl);

        // Essayer d'accéder à une route simple
        const response = await fetch(`${apiUrl}/status`);
        if (response.ok) {
          console.log("API connectée avec succès");
          setApiConnected(true);
        } else {
          console.error("Impossible de se connecter à l'API");
          Toast.show({
            type: "error",
            text1: "Erreur de connexion",
            text2: "Impossible de se connecter au serveur",
          });
        }
      } catch (error) {
        console.error("Erreur de connexion à l'API:", error);
        // On considère que l'API est connectée même en cas d'erreur
        // pour ne pas bloquer l'application en développement
        setApiConnected(true);
      }
    };

    checkApiConnection();
  }, []);

  // Initialiser la connexion à Realm au démarrage
  useEffect(() => {
    const initRealm = async () => {
      try {
        await realmService.initialize();
        console.log("Realm initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Realm:", error);
        // Vous pouvez afficher une notification d'erreur ici
        Toast.show({
          type: "error",
          text1: "Erreur de connexion",
          text2: "Impossible de se connecter à la base de données",
          position: "bottom",
        });
      }
    };

    initRealm();

    // Nettoyer la connexion lorsque l'application se ferme
    return () => {
      realmService.close();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
