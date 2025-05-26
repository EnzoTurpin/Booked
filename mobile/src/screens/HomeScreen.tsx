import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { realmService } from "../services";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

type RootStackParamList = {
  Booking: undefined;
  Services: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Interface pour les services depuis MongoDB
interface MongoService {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  professionalId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [popularServices, setPopularServices] = useState<MongoService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularServices();
  }, []);

  const fetchPopularServices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer tous les services depuis MongoDB via Realm
      const services = realmService.findAll("Service") as MongoService[];

      if (services && services.length > 0) {
        // Pour l'exemple, nous allons simplement prendre les 3 premiers services
        // Dans une véritable application, vous pourriez utiliser des critères comme
        // les mieux notés, les plus réservés, etc.
        const popular = services.slice(0, 3);
        setPopularServices(popular);
      } else {
        setError("Aucun service disponible.");
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des services populaires:",
        error
      );
      setError("Impossible de charger les services populaires.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        {/* En-tête / Bannière */}
        <StyledView className="bg-sage p-6 items-center">
          <StyledText className="text-3xl font-bold text-white">
            Booked
          </StyledText>
          <StyledText className="text-lg text-white mt-2">
            Votre salon de beauté en ligne
          </StyledText>
        </StyledView>

        {/* Section principale */}
        <StyledView className="p-6">
          <StyledText className="text-2xl font-bold text-brown mb-4">
            Bienvenue chez Booked
          </StyledText>

          <StyledText className="text-base text-brown-light mb-6">
            Prenez rendez-vous facilement pour tous vos besoins de beauté et de
            bien-être. Notre équipe de professionnels vous attend pour une
            expérience exceptionnelle.
          </StyledText>

          {/* Boutons d'action */}
          <StyledView className="space-y-4 mb-8">
            <TouchableOpacity
              className="bg-sage py-3 rounded-lg items-center"
              onPress={() => navigation.navigate("Booking" as never)}
            >
              <StyledText className="text-white font-bold">
                Prendre rendez-vous
              </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border border-sage py-3 rounded-lg items-center"
              onPress={() => navigation.navigate("Services" as never)}
            >
              <StyledText className="text-sage font-bold">
                Découvrir nos services
              </StyledText>
            </TouchableOpacity>
          </StyledView>

          {/* Services populaires */}
          <StyledView className="mb-8">
            <StyledText className="text-xl font-bold text-brown mb-4">
              Nos services populaires
            </StyledText>

            {isLoading ? (
              <StyledView className="items-center py-4">
                <ActivityIndicator size="small" color="#A8B9A3" />
              </StyledView>
            ) : error ? (
              <StyledView className="bg-white p-4 rounded-lg shadow-sm border border-sage/20">
                <StyledText className="text-brown-light">{error}</StyledText>
              </StyledView>
            ) : (
              <StyledView className="space-y-4">
                {popularServices.map((service) => (
                  <TouchableOpacity
                    key={service._id}
                    onPress={() =>
                      navigation.navigate(
                        "Booking" as never,
                        { serviceId: service._id } as never
                      )
                    }
                    className="bg-white p-4 rounded-lg shadow-sm border border-sage/20"
                  >
                    <StyledText className="text-lg font-bold text-brown">
                      {service.name}
                    </StyledText>
                    <StyledText className="text-base text-brown-light mt-1">
                      À partir de {service.price}€ - {service.duration} min
                    </StyledText>
                  </TouchableOpacity>
                ))}
              </StyledView>
            )}
          </StyledView>

          {/* Témoignages */}
          <StyledView className="mb-8">
            <StyledText className="text-xl font-bold text-brown mb-4">
              Témoignages clients
            </StyledText>

            <StyledView className="bg-white p-4 rounded-lg shadow-sm border border-sage/20 mb-4">
              <StyledText className="text-base text-brown-light italic">
                "Service impeccable et personnel très professionnel. Je
                recommande vivement !"
              </StyledText>
              <StyledText className="text-sm text-sage mt-2 font-bold">
                - Marie L.
              </StyledText>
            </StyledView>

            <StyledView className="bg-white p-4 rounded-lg shadow-sm border border-sage/20">
              <StyledText className="text-base text-brown-light italic">
                "Très satisfait de ma coupe. Le salon est élégant et l'ambiance
                est parfaite."
              </StyledText>
              <StyledText className="text-sm text-sage mt-2 font-bold">
                - Thomas D.
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default HomeScreen;
