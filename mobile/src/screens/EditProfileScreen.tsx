import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import Toast from "react-native-toast-message";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const EditProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Initialiser les données du formulaire avec les informations actuelles de l'utilisateur
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // État pour les erreurs de validation
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (formData.phone && !/^[0-9+ ]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Format de téléphone invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convertir le nom pour le format du serveur
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
      };

      // Mise à jour du profil utilisateur
      await apiService.put("/users/profile", userData);

      Toast.show({
        type: "success",
        text1: "Profil mis à jour",
        text2: "Vos informations ont été enregistrées avec succès",
      });

      // @ts-ignore
      navigation.goBack();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        "Erreur lors de la mise à jour du profil";
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Effacer l'erreur lorsque l'utilisateur commence à éditer
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        <StyledView className="px-6 py-6">
          <StyledText className="text-2xl font-bold mb-6 text-center text-brown">
            Modifier mon profil
          </StyledText>

          <StyledView className="space-y-5">
            {/* Prénom */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Prénom
              </StyledText>
              <TextInput
                className={`bg-white p-3 rounded-lg border ${
                  errors.firstName ? "border-red-500" : "border-sage/20"
                }`}
                value={formData.firstName}
                onChangeText={(value) => handleChange("firstName", value)}
                placeholder="Votre prénom"
                autoCapitalize="words"
              />
              {errors.firstName && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.firstName}
                </StyledText>
              )}
            </StyledView>

            {/* Nom */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Nom
              </StyledText>
              <TextInput
                className={`bg-white p-3 rounded-lg border ${
                  errors.lastName ? "border-red-500" : "border-sage/20"
                }`}
                value={formData.lastName}
                onChangeText={(value) => handleChange("lastName", value)}
                placeholder="Votre nom"
                autoCapitalize="words"
              />
              {errors.lastName && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.lastName}
                </StyledText>
              )}
            </StyledView>

            {/* Email */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Email
              </StyledText>
              <TextInput
                className={`bg-white p-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-sage/20"
                }`}
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                placeholder="Votre email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.email}
                </StyledText>
              )}
            </StyledView>

            {/* Téléphone */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Téléphone
              </StyledText>
              <TextInput
                className={`bg-white p-3 rounded-lg border ${
                  errors.phone ? "border-red-500" : "border-sage/20"
                }`}
                value={formData.phone}
                onChangeText={(value) => handleChange("phone", value)}
                placeholder="Votre numéro de téléphone"
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.phone}
                </StyledText>
              )}
            </StyledView>

            {/* Boutons d'action */}
            <StyledView className="flex-row justify-between pt-4">
              <TouchableOpacity
                className="bg-white border border-sage py-3 px-6 rounded-lg"
                // @ts-ignore
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <StyledText className="text-sage font-bold">Annuler</StyledText>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-sage py-3 px-6 rounded-lg"
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <StyledText className="text-white font-bold">
                    Enregistrer
                  </StyledText>
                )}
              </TouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default EditProfileScreen;
