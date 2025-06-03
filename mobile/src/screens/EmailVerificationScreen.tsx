import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

type EmailVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  "EmailVerification"
>;

type EmailVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EmailVerification"
>;

const EmailVerificationScreen: React.FC = () => {
  const route = useRoute<EmailVerificationScreenRouteProp>();
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
  const { setUser } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    // Récupérer l'email depuis les paramètres de route ou depuis AsyncStorage
    const getEmail = async () => {
      if (route.params?.email) {
        setEmail(route.params.email);
      } else {
        try {
          const pendingEmail = await AsyncStorage.getItem(
            "pendingVerificationEmail"
          );
          if (pendingEmail) {
            setEmail(pendingEmail);
            console.log(
              "Email en attente de vérification chargé:",
              pendingEmail
            );
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'email:", error);
        }
      }
    };

    getEmail();
  }, [route.params]);

  const handleVerifyEmail = async () => {
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    if (!verificationCode) {
      setError("Veuillez entrer le code de vérification");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiService.post("/auth/verify-email", {
        email,
        verificationCode,
      });

      if (response.data.success) {
        setSuccess(response.data.message || "Email vérifié avec succès");

        // Mettre à jour l'utilisateur et le token
        if (response.data.token && response.data.user) {
          await setUser(response.data.user, response.data.token);

          // Rediriger vers l'écran principal après 1 seconde
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          }, 1000);
        }
      } else {
        setError(response.data.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Une erreur est survenue";
      setError(message);
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await apiService.post("/auth/resend-verification", {
        email,
      });

      if (response.data.success) {
        Alert.alert(
          "Code envoyé",
          "Un nouveau code de vérification a été envoyé à votre adresse email."
        );
      } else {
        setError(response.data.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Une erreur est survenue";
      setError(message);
      Alert.alert("Erreur", message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-beige">
      <StyledView className="px-6 py-8">
        <StyledText className="text-2xl font-bold mb-6 text-center text-brown">
          Vérification de votre email
        </StyledText>

        <StyledText className="text-brown/80 text-center mb-8">
          Veuillez entrer le code de vérification qui a été envoyé à votre
          adresse email.
        </StyledText>

        {error ? (
          <StyledView className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <StyledView className="flex-row items-center">
              <StyledText className="text-red-700">{error}</StyledText>
            </StyledView>
          </StyledView>
        ) : null}

        {success ? (
          <StyledView className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
            <StyledView className="flex-row items-center">
              <StyledText className="text-green-700">{success}</StyledText>
            </StyledView>
          </StyledView>
        ) : null}

        <StyledView className="bg-offwhite rounded-lg shadow-sm p-4 mb-6 border border-sage/20">
          <StyledView className="mb-4">
            <StyledText className="text-brown-light text-sm mb-2">
              Adresse email
            </StyledText>
            <TextInput
              className="w-full p-3 border rounded-lg bg-offwhite text-brown border-sage/30"
              placeholder="Votre email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!route.params?.email}
            />
          </StyledView>

          <StyledView className="mb-4">
            <StyledText className="text-brown-light text-sm mb-2">
              Code de vérification
            </StyledText>
            <TextInput
              className="w-full p-3 border rounded-lg bg-offwhite text-brown border-sage/30"
              placeholder="Entrez le code à 6 chiffres"
              keyboardType="number-pad"
              maxLength={6}
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
          </StyledView>

          <TouchableOpacity
            className="bg-sage py-3 rounded-lg items-center mt-2"
            onPress={handleVerifyEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <StyledText className="text-white font-bold">
                Vérifier mon email
              </StyledText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 items-center"
            onPress={handleResendCode}
            disabled={resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator color="#A8B9A3" size="small" />
            ) : (
              <StyledText className="text-sage">
                Renvoyer le code de vérification
              </StyledText>
            )}
          </TouchableOpacity>
        </StyledView>
      </StyledView>
    </ScrollView>
  );
};

export default EmailVerificationScreen;
