import React from "react";
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

type RootStackParamList = {
  BookingTab: undefined;
  MyAppointmentsTab: undefined;
  ProfileTab: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        {/* En-tête / Bannière */}
        <StyledView className="bg-sage p-6 items-center">
          <StyledText className="text-3xl font-bold text-white">
            Booked
          </StyledText>
          <StyledText className="text-lg text-white mt-2">
            Votre plateforme de réservation
          </StyledText>
        </StyledView>

        {/* Section principale */}
        <StyledView className="p-6">
          <StyledText className="text-2xl font-bold text-brown mb-4">
            Bienvenue, {user?.firstName || ""}
          </StyledText>

          <StyledText className="text-base text-brown-light mb-6">
            Prenez rendez-vous facilement avec nos professionnels. Quelques
            clics suffisent pour réserver le créneau qui vous convient.
          </StyledText>

          {/* Cartes d'actions principales */}
          <StyledView className="flex-row justify-between mb-6">
            <TouchableOpacity
              className="bg-white rounded-xl shadow-sm p-4 w-[48%]"
              style={{ elevation: 2 }}
              onPress={() => navigation.navigate("BookingTab" as never)}
            >
              <View className="bg-sage/20 rounded-full w-12 h-12 items-center justify-center mb-3">
                <Ionicons name="calendar-outline" size={24} color="#A8B9A3" />
              </View>
              <StyledText className="text-brown font-bold mb-1">
                Réserver
              </StyledText>
              <StyledText className="text-brown-light text-sm">
                Prendre un rendez-vous
              </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl shadow-sm p-4 w-[48%]"
              style={{ elevation: 2 }}
              onPress={() => navigation.navigate("MyAppointmentsTab" as never)}
            >
              <View className="bg-sage/20 rounded-full w-12 h-12 items-center justify-center mb-3">
                <Ionicons name="list-outline" size={24} color="#A8B9A3" />
              </View>
              <StyledText className="text-brown font-bold mb-1">
                Mes RDV
              </StyledText>
              <StyledText className="text-brown-light text-sm">
                Voir mes rendez-vous
              </StyledText>
            </TouchableOpacity>
          </StyledView>

          {/* Bannière de prise de rendez-vous */}
          <TouchableOpacity
            className="bg-sage rounded-xl overflow-hidden mb-6"
            onPress={() => navigation.navigate("BookingTab" as never)}
          >
            <StyledView className="p-5">
              <StyledText className="text-white text-xl font-bold mb-2">
                Prendre rendez-vous
              </StyledText>
              <StyledText className="text-white opacity-90 mb-3">
                Réservez votre créneau en quelques étapes simples
              </StyledText>
              <StyledView className="flex-row items-center">
                <StyledText className="text-white font-bold">
                  Réserver maintenant
                </StyledText>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="white"
                  style={{ marginLeft: 8 }}
                />
              </StyledView>
            </StyledView>
          </TouchableOpacity>

          {/* Informations / Guide */}
          <StyledView
            className="bg-white rounded-xl p-5 shadow-sm mb-6"
            style={{ elevation: 2 }}
          >
            <StyledText className="text-xl font-bold text-brown mb-4">
              Comment ça marche
            </StyledText>

            <StyledView className="mb-3 flex-row">
              <StyledView className="w-8 h-8 bg-sage rounded-full items-center justify-center mr-3">
                <StyledText className="text-white font-bold">1</StyledText>
              </StyledView>
              <StyledView className="flex-1">
                <StyledText className="text-brown font-semibold mb-1">
                  Choisissez un professionnel
                </StyledText>
                <StyledText className="text-brown-light text-sm">
                  Sélectionnez le professionnel avec qui vous souhaitez prendre
                  rendez-vous
                </StyledText>
              </StyledView>
            </StyledView>

            <StyledView className="mb-3 flex-row">
              <StyledView className="w-8 h-8 bg-sage rounded-full items-center justify-center mr-3">
                <StyledText className="text-white font-bold">2</StyledText>
              </StyledView>
              <StyledView className="flex-1">
                <StyledText className="text-brown font-semibold mb-1">
                  Sélectionnez une date
                </StyledText>
                <StyledText className="text-brown-light text-sm">
                  Choisissez la date qui vous convient dans le calendrier
                </StyledText>
              </StyledView>
            </StyledView>

            <StyledView className="flex-row">
              <StyledView className="w-8 h-8 bg-sage rounded-full items-center justify-center mr-3">
                <StyledText className="text-white font-bold">3</StyledText>
              </StyledView>
              <StyledView className="flex-1">
                <StyledText className="text-brown font-semibold mb-1">
                  Confirmez votre rendez-vous
                </StyledText>
                <StyledText className="text-brown-light text-sm">
                  Vérifiez les détails et confirmez votre réservation
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Bouton d'action principal */}
          <TouchableOpacity
            className="bg-sage py-4 rounded-lg items-center mb-8"
            onPress={() => navigation.navigate("BookingTab" as never)}
          >
            <StyledText className="text-white font-bold text-lg">
              Prendre rendez-vous maintenant
            </StyledText>
          </TouchableOpacity>
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default HomeScreen;
