import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BannedUserScreen = () => {
  const { user, logout } = useAuth();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [requestSubmitted, setRequestSubmitted] = useState(
    user?.hasUnbanRequest || false
  );

  useEffect(() => {
    // Log pour le débogage
    console.log("BannedUserScreen monté, utilisateur:", user);

    // Si l'utilisateur n'a pas d'ID valide, essayer de récupérer l'email du stockage
    const checkStoredEmail = async () => {
      if (!user?.email) {
        try {
          const storedEmail = await AsyncStorage.getItem(
            "pendingVerificationEmail"
          );
          if (storedEmail) {
            setUserEmail(storedEmail);
            console.log("Email récupéré du stockage:", storedEmail);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de l'email stocké:",
            error
          );
        }
      }
    };

    checkStoredEmail();
  }, [user]);

  const handleSubmitUnbanRequest = async () => {
    if (!reason.trim()) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez fournir une raison pour votre demande de déban",
      });
      return;
    }

    // Vérifier si nous avons un email valide
    if (!userEmail) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible d'identifier votre compte",
      });
      return;
    }

    try {
      setLoading(true);

      // Si nous n'avons pas d'ID utilisateur valide, faire une recherche par email
      let userId = user?._id;

      if (!userId || userId === "banned-user") {
        console.log("Recherche de l'utilisateur par email:", userEmail);
        try {
          const response = await apiService.post("/auth/check-email-exists", {
            email: userEmail,
          });

          if (response.data && response.data.exists) {
            // Utiliser l'endpoint pour soumettre une demande de déban par email
            const unbanResponse = await apiService.post(
              "/users/unban-request-by-email",
              {
                email: userEmail,
                reason: reason.trim(),
              }
            );

            if (unbanResponse.data && unbanResponse.data.success) {
              setRequestSubmitted(true);
              Toast.show({
                type: "success",
                text1: "Succès",
                text2: "Votre demande de déban a été soumise avec succès",
              });
            } else {
              throw new Error("Échec de la soumission de la demande de déban");
            }
          } else {
            throw new Error("Compte non trouvé");
          }
        } catch (emailError) {
          console.error(
            "Erreur lors de la vérification de l'email:",
            emailError
          );
          Toast.show({
            type: "error",
            text1: "Erreur",
            text2: "Impossible de vérifier votre compte",
          });
        }
      } else {
        // Utiliser l'endpoint normal avec l'ID utilisateur
        const response = await apiService.post(
          `/users/${userId}/unban-request`,
          {
            reason: reason.trim(),
          }
        );

        if (response.data && response.data.success) {
          setRequestSubmitted(true);
          Toast.show({
            type: "success",
            text1: "Succès",
            text2: "Votre demande de déban a été soumise avec succès",
          });
        } else {
          throw new Error("Échec de la soumission de la demande de déban");
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la soumission de la demande de déban:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue lors de la soumission de votre demande",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container}>
        <StyledView className="p-6">
          <StyledView className="items-center">
            <Ionicons name="ban" size={80} color="#F44336" />
            <StyledText className="text-2xl font-bold text-center mt-6 text-red-600">
              Votre compte a été suspendu
            </StyledText>
            <StyledText className="text-gray-600 text-center mt-2 mb-6">
              L'accès à votre compte a été temporairement suspendu par un
              administrateur.
            </StyledText>
          </StyledView>

          {!requestSubmitted ? (
            <>
              <StyledView className="mb-6 bg-white p-5 rounded-xl shadow-sm">
                <StyledText className="text-lg font-bold mb-3 text-gray-800">
                  Demander une levée de suspension
                </StyledText>
                <StyledText className="text-gray-600 mb-4">
                  Expliquez pourquoi vous pensez que votre compte devrait être
                  réactivé:
                </StyledText>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white"
                  placeholder="Expliquez votre situation..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={reason}
                  onChangeText={setReason}
                  style={{ minHeight: 120 }}
                />
              </StyledView>

              <TouchableOpacity
                className="bg-sage py-4 rounded-xl shadow-sm mb-4"
                onPress={handleSubmitUnbanRequest}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <StyledText className="text-white text-center font-bold">
                    Soumettre ma demande
                  </StyledText>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <StyledView className="mb-6 bg-green-50 p-5 rounded-xl shadow-sm border border-green-200">
              <StyledView className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <StyledText className="text-lg font-bold ml-2 text-green-800">
                  Demande soumise
                </StyledText>
              </StyledView>
              <StyledText className="text-gray-700 mb-2">
                Votre demande de réactivation a été envoyée aux administrateurs.
              </StyledText>
              <StyledText className="text-gray-700">
                Nous vous informerons par email dès qu'une décision sera prise
                concernant votre compte.
              </StyledText>
            </StyledView>
          )}

          <TouchableOpacity
            className="bg-gray-200 py-4 rounded-xl shadow-sm mb-4"
            onPress={logout}
          >
            <StyledText className="text-gray-700 text-center font-bold">
              Se déconnecter
            </StyledText>
          </TouchableOpacity>

          <StyledText className="text-center text-gray-500 text-xs mt-6">
            Si vous avez des questions, veuillez nous contacter à
            dev.booked@gmail.com
          </StyledText>
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F0E3",
    flex: 1,
  },
});

export default BannedUserScreen;
