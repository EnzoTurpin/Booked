import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList, TabNavigatorParamList } from "../types/navigation";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Modifier le type pour inclure l'accès à la route Login du Stack principal
type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabNavigatorParamList, "ProfileTab">,
  StackNavigationProp<RootStackParamList>
>;

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  // Utilisateur fictif si l'utilisateur n'est pas authentifié
  const mockUser = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "06 12 34 56 78",
    isEmailVerified: true,
  };

  const currentUser = user || mockUser;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setLoading(false);
      // La navigation sera gérée automatiquement par le RootNavigator
    } catch (error) {
      Alert.alert("Erreur", "Un problème est survenu lors de la déconnexion");
      setLoading(false);
    }
  };

  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const navigateToChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        <StyledView className="px-6 py-6">
          <StyledText className="text-2xl font-bold mb-6 text-center text-brown">
            Mon Profil
          </StyledText>

          {/* Photo de profil */}
          <StyledView className="items-center mb-6">
            <StyledView className="w-24 h-24 rounded-full bg-sage justify-center items-center">
              <StyledText className="text-2xl text-white font-bold">
                {currentUser.firstName.charAt(0)}
                {currentUser.lastName.charAt(0)}
              </StyledText>
            </StyledView>
            <StyledText className="mt-2 text-lg font-bold text-brown">
              {currentUser.firstName} {currentUser.lastName}
            </StyledText>
            <StyledText className="text-brown-light">
              {currentUser.email}
            </StyledText>
          </StyledView>

          {/* Informations personnelles */}
          <StyledView className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-sage/20">
            <StyledText className="text-lg font-bold text-brown mb-4">
              Informations personnelles
            </StyledText>

            <StyledView className="space-y-3">
              <StyledView>
                <StyledText className="text-brown-light text-sm">
                  Prénom
                </StyledText>
                <StyledText className="text-brown">
                  {currentUser.firstName}
                </StyledText>
              </StyledView>

              <StyledView>
                <StyledText className="text-brown-light text-sm">
                  Nom
                </StyledText>
                <StyledText className="text-brown">
                  {currentUser.lastName}
                </StyledText>
              </StyledView>

              <StyledView>
                <StyledText className="text-brown-light text-sm">
                  Email
                </StyledText>
                <StyledText className="text-brown">
                  {currentUser.email}
                </StyledText>
                {currentUser.isEmailVerified && (
                  <StyledView className="bg-green-100 self-start px-2 py-1 rounded-full mt-1">
                    <StyledText className="text-green-800 text-xs">
                      Vérifié
                    </StyledText>
                  </StyledView>
                )}
              </StyledView>

              <StyledView>
                <StyledText className="text-brown-light text-sm">
                  Téléphone
                </StyledText>
                <StyledText className="text-brown">
                  {currentUser.phone || "Non renseigné"}
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Actions du profil */}
          <StyledView className="space-y-3">
            <TouchableOpacity
              className="bg-sage py-3 rounded-lg items-center"
              onPress={navigateToEditProfile}
            >
              <StyledText className="text-white font-bold">
                Modifier mon profil
              </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border border-sage py-3 rounded-lg items-center"
              onPress={navigateToChangePassword}
            >
              <StyledText className="text-sage font-bold">
                Changer de mot de passe
              </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-100 py-3 rounded-lg items-center mt-2"
              onPress={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#991B1B" />
              ) : (
                <StyledText className="text-red-800 font-bold">
                  Se déconnecter
                </StyledText>
              )}
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ProfileScreen;
