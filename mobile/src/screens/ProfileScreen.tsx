import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { useAuth } from "../contexts/AuthContext";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    // La navigation est gérée par AuthContext
  };

  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const navigateToChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const navigateToScheduleSettings = () => {
    navigation.navigate("ScheduleSettings");
  };

  const isProfessional =
    user?.role === "professional" || user?.role === "professionnal";

  return (
    <SafeAreaWrapper bottomTabBarHeight={50}>
      <ScrollView className="flex-1 p-4">
        <StyledView className="items-center mb-6">
          <StyledText className="text-2xl font-bold text-brown">
            Mon Profil
          </StyledText>
        </StyledView>

        {/* Informations utilisateur */}
        <StyledView className="bg-white p-4 rounded-lg mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-sage rounded-full items-center justify-center mr-4">
              <StyledText className="text-white text-2xl font-bold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </StyledText>
            </View>
            <View>
              <StyledText className="text-xl font-bold text-brown mb-1">
                {user?.firstName} {user?.lastName}
              </StyledText>
              <StyledText className="text-brown-light">
                {user?.email}
              </StyledText>
            </View>
          </View>

          <View className="border-t border-gray-200 pt-3 mt-1">
            <StyledText className="text-brown-light mb-1">
              Rôle:{" "}
              <StyledText className="font-semibold">{user?.role}</StyledText>
            </StyledText>
            {user?.phone && (
              <StyledText className="text-brown-light">
                Téléphone:{" "}
                <StyledText className="font-semibold">{user?.phone}</StyledText>
              </StyledText>
            )}
          </View>
        </StyledView>

        {/* Options de profil */}
        <StyledView className="bg-white p-4 rounded-lg mb-4">
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-200"
            onPress={navigateToEditProfile}
          >
            <Ionicons name="person-outline" size={22} color="#8D7B68" />
            <StyledText className="text-brown ml-3">
              Modifier mon profil
            </StyledText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#8D7B68"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-200"
            onPress={navigateToChangePassword}
          >
            <Ionicons name="lock-closed-outline" size={22} color="#8D7B68" />
            <StyledText className="text-brown ml-3">
              Changer mon mot de passe
            </StyledText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#8D7B68"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          {isProfessional && (
            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={navigateToScheduleSettings}
            >
              <Ionicons name="time-outline" size={22} color="#8D7B68" />
              <StyledText className="text-brown ml-3">
                Gérer mes horaires hebdomadaires
              </StyledText>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#8D7B68"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          )}
        </StyledView>

        {/* Déconnexion */}
        <TouchableOpacity
          className="bg-red-500 p-3 rounded-lg mb-4"
          onPress={handleLogout}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={22} color="white" />
            <StyledText className="text-white font-bold ml-2">
              Se déconnecter
            </StyledText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ProfileScreen;
