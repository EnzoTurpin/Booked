import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import StyledText from "../../components/StyledText";
import StyledView from "../../components/StyledView";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  isBanned: boolean;
};

const AdminEditUserScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const userId = route.params?.userId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
  });

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/users/${userId}`);
      if (response.data && response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "client",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de récupérer les informations de l'utilisateur",
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2:
          "Une erreur est survenue lors de la récupération de l'utilisateur",
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "ID d'utilisateur manquant",
      });
      navigation.goBack();
    }
  }, [userId]);

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Le prénom est requis",
      });
      return false;
    }

    if (!formData.lastName.trim()) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Le nom est requis",
      });
      return false;
    }

    if (!formData.email.trim()) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "L'email est requis",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "L'email n'est pas valide",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const response = await apiService.put(`/users/${userId}`, formData);

      if (response.data && response.data.success) {
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: "Utilisateur mis à jour avec succès",
        });

        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de mettre à jour l'utilisateur",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2:
          "Une erreur est survenue lors de la mise à jour de l'utilisateur",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role,
    });
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <StyledView
          className="flex-1 justify-center items-center"
          style={styles.container}
        >
          <ActivityIndicator size="large" color="#A8B9A3" />
          <StyledText className="mt-4 text-gray-600">
            Chargement des informations...
          </StyledText>
        </StyledView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1" style={styles.container}>
        <StyledView className="p-6">
          <StyledView className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#5D4037" />
            </TouchableOpacity>
            <StyledText className="text-2xl font-bold text-brown">
              Modifier un utilisateur
            </StyledText>
          </StyledView>

          <StyledView className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Prénom</StyledText>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.firstName}
                onChangeText={(text) => handleChange("firstName", text)}
                placeholder="Prénom"
              />
            </StyledView>

            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Nom</StyledText>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.lastName}
                onChangeText={(text) => handleChange("lastName", text)}
                placeholder="Nom"
              />
            </StyledView>

            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Email</StyledText>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </StyledView>

            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Téléphone</StyledText>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="Téléphone"
                keyboardType="phone-pad"
              />
            </StyledView>

            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-2">Rôle</StyledText>
              <StyledView className="flex-row justify-between">
                <TouchableOpacity
                  className={`py-2 px-3 rounded-lg ${
                    formData.role === "client" ? "bg-sage" : "bg-gray-200"
                  }`}
                  onPress={() => handleRoleChange("client")}
                >
                  <StyledText
                    className={
                      formData.role === "client"
                        ? "text-white"
                        : "text-gray-700"
                    }
                  >
                    Client
                  </StyledText>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 px-3 rounded-lg ${
                    formData.role === "professional" ? "bg-sage" : "bg-gray-200"
                  }`}
                  onPress={() => handleRoleChange("professional")}
                >
                  <StyledText
                    className={
                      formData.role === "professional"
                        ? "text-white"
                        : "text-gray-700"
                    }
                  >
                    Professionnel
                  </StyledText>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 px-3 rounded-lg ${
                    formData.role === "admin" ? "bg-sage" : "bg-gray-200"
                  }`}
                  onPress={() => handleRoleChange("admin")}
                >
                  <StyledText
                    className={
                      formData.role === "admin" ? "text-white" : "text-gray-700"
                    }
                  >
                    Admin
                  </StyledText>
                </TouchableOpacity>
              </StyledView>
            </StyledView>
          </StyledView>

          <TouchableOpacity
            className="bg-sage py-4 rounded-xl shadow-sm"
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <StyledText className="text-white text-center font-bold">
                Enregistrer les modifications
              </StyledText>
            )}
          </TouchableOpacity>
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

export default AdminEditUserScreen;
