import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import apiService from "../services/api";
import Toast from "react-native-toast-message";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true,
  });

  // État pour les données du formulaire
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // État pour les erreurs de validation
  const [errors, setErrors] = useState<Partial<PasswordFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Le mot de passe actuel est requis";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Le nouveau mot de passe est requis";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
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
      await apiService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Toast.show({
        type: "success",
        text1: "Mot de passe modifié",
        text2: "Votre mot de passe a été mis à jour avec succès",
      });

      // @ts-ignore
      navigation.goBack();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la modification du mot de passe";
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PasswordFormData, value: string) => {
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

  const toggleSecureEntry = (field: keyof typeof secureTextEntry) => {
    setSecureTextEntry({
      ...secureTextEntry,
      [field]: !secureTextEntry[field],
    });
  };

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        <StyledView className="px-6 py-6">
          <StyledText className="text-2xl font-bold mb-6 text-center text-brown">
            Changer le mot de passe
          </StyledText>

          <StyledView className="space-y-5">
            {/* Mot de passe actuel */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Mot de passe actuel
              </StyledText>
              <StyledView className="flex-row">
                <TextInput
                  className={`flex-1 bg-white p-3 rounded-lg border ${
                    errors.currentPassword ? "border-red-500" : "border-sage/20"
                  }`}
                  value={formData.currentPassword}
                  onChangeText={(value) =>
                    handleChange("currentPassword", value)
                  }
                  placeholder="Votre mot de passe actuel"
                  secureTextEntry={secureTextEntry.currentPassword}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => toggleSecureEntry("currentPassword")}
                >
                  <StyledText className="text-sage">
                    {secureTextEntry.currentPassword ? "Afficher" : "Masquer"}
                  </StyledText>
                </TouchableOpacity>
              </StyledView>
              {errors.currentPassword && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.currentPassword}
                </StyledText>
              )}
            </StyledView>

            {/* Nouveau mot de passe */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Nouveau mot de passe
              </StyledText>
              <StyledView className="flex-row">
                <TextInput
                  className={`flex-1 bg-white p-3 rounded-lg border ${
                    errors.newPassword ? "border-red-500" : "border-sage/20"
                  }`}
                  value={formData.newPassword}
                  onChangeText={(value) => handleChange("newPassword", value)}
                  placeholder="Votre nouveau mot de passe"
                  secureTextEntry={secureTextEntry.newPassword}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => toggleSecureEntry("newPassword")}
                >
                  <StyledText className="text-sage">
                    {secureTextEntry.newPassword ? "Afficher" : "Masquer"}
                  </StyledText>
                </TouchableOpacity>
              </StyledView>
              {errors.newPassword && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </StyledText>
              )}
            </StyledView>

            {/* Confirmation du nouveau mot de passe */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Confirmer le nouveau mot de passe
              </StyledText>
              <StyledView className="flex-row">
                <TextInput
                  className={`flex-1 bg-white p-3 rounded-lg border ${
                    errors.confirmPassword ? "border-red-500" : "border-sage/20"
                  }`}
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleChange("confirmPassword", value)
                  }
                  placeholder="Confirmer votre nouveau mot de passe"
                  secureTextEntry={secureTextEntry.confirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => toggleSecureEntry("confirmPassword")}
                >
                  <StyledText className="text-sage">
                    {secureTextEntry.confirmPassword ? "Afficher" : "Masquer"}
                  </StyledText>
                </TouchableOpacity>
              </StyledView>
              {errors.confirmPassword && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </StyledText>
              )}
            </StyledView>

            {/* Boutons d'action */}
            <StyledView className="flex-row justify-between pt-4">
              <TouchableOpacity
                className="bg-white border border-sage py-3 px-6 rounded-lg"
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

export default ChangePasswordScreen;
