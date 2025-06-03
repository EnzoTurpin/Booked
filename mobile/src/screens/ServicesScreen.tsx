import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import mongodbService from "../services/mongodb";
import Toast from "react-native-toast-message";

interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
}

// Interface pour les services provenant directement de MongoDB
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

const ServicesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<MongoService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charger les catégories et services au démarrage
    fetchServicesFromMongoDB();
  }, []);

  const fetchServicesFromMongoDB = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer tous les services directement depuis la collection 'services' de MongoDB
      const fetchedServices = await mongodbService.findAll<MongoService>(
        "services"
      );

      if (fetchedServices.length > 0) {
        setServices(fetchedServices);

        // Extraire les catégories uniques des services
        const categoriesMap = new Map();
        fetchedServices.forEach((service) => {
          if (!categoriesMap.has(service.category)) {
            categoriesMap.set(service.category, {
              _id: service.category,
              name: service.category,
              description: `Services de type ${service.category}`,
            });
          }
        });

        const uniqueCategories = Array.from(categoriesMap.values());
        setCategories(uniqueCategories);

        // Sélectionner la première catégorie par défaut
        if (uniqueCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(uniqueCategories[0]._id);
        }
      } else {
        setError("Aucun service trouvé.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      setError(
        "Impossible de charger les services. Veuillez réessayer plus tard."
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les services.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredServices = () => {
    if (!selectedCategory) return [];
    return services.filter((service) => service.category === selectedCategory);
  };

  if (isLoading) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-beige">
        <ActivityIndicator size="large" color="#A8B9A3" />
        <StyledText className="mt-4 text-brown/80">
          Chargement des services...
        </StyledText>
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-beige p-6">
        <StyledText className="text-red-500 text-center mb-4">
          {error}
        </StyledText>
        <TouchableOpacity
          className="bg-sage py-3 px-6 rounded-lg"
          onPress={fetchServicesFromMongoDB}
        >
          <StyledText className="text-white font-bold">Réessayer</StyledText>
        </TouchableOpacity>
      </StyledView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-beige">
      <StyledView className="px-6 py-8">
        <StyledText className="text-2xl font-bold mb-6 text-center text-brown">
          Nos Services
        </StyledText>

        {/* Onglets de catégories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <StyledView className="flex-row space-x-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category._id}
                className={`py-2 px-4 rounded-lg ${
                  selectedCategory === category._id
                    ? "bg-sage"
                    : "bg-white border border-sage/20"
                }`}
                onPress={() => setSelectedCategory(category._id)}
              >
                <StyledText
                  className={`${
                    selectedCategory === category._id
                      ? "text-white"
                      : "text-brown"
                  } font-medium`}
                >
                  {category.name}
                </StyledText>
              </TouchableOpacity>
            ))}
          </StyledView>
        </ScrollView>

        {/* Description de la catégorie */}
        {selectedCategory && (
          <StyledView className="mb-6">
            <StyledText className="text-brown/80">
              {categories.find((c) => c._id === selectedCategory)?.description}
            </StyledText>
          </StyledView>
        )}

        {/* Liste des services */}
        <StyledView className="space-y-4">
          {getFilteredServices().length > 0 ? (
            getFilteredServices().map((service) => (
              <StyledView
                key={service._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-sage/20 p-4"
              >
                <StyledView className="flex-row justify-between items-start">
                  <StyledView className="flex-1">
                    <StyledText className="text-lg font-bold text-brown">
                      {service.name}
                    </StyledText>
                    <StyledText className="text-brown/80 mt-1">
                      {service.description}
                    </StyledText>
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-brown font-bold">
                      {service.price} €
                    </StyledText>
                    <StyledText className="text-brown/60 text-right">
                      {service.duration} min
                    </StyledText>
                  </StyledView>
                </StyledView>

                <TouchableOpacity
                  className="mt-4 bg-sage py-2 rounded-lg items-center"
                  onPress={() => {
                    // @ts-ignore - Navigation typing will be handled later
                    navigation.navigate("Booking", { serviceId: service._id });
                  }}
                >
                  <StyledText className="text-white font-medium">
                    Réserver
                  </StyledText>
                </TouchableOpacity>
              </StyledView>
            ))
          ) : (
            <StyledView className="py-6 items-center">
              <StyledText className="text-brown/80">
                Aucun service disponible dans cette catégorie.
              </StyledText>
            </StyledView>
          )}
        </StyledView>
      </StyledView>
    </ScrollView>
  );
};

export default ServicesScreen;
