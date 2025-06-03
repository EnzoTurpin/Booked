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

type Professional = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  isActive: boolean;
  isApproved: boolean;
  specialty: string;
  biography: string;
  services: string[];
};

const AdminEditProfessionalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const professionalId = route.params?.professionalId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    biography: "",
    isActive: true,
    isApproved: false,
  });
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  const fetchProfessional = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/users/${professionalId}`);
      if (response.data && response.data.success) {
        const profData = response.data.data;
        setProfessional(profData);
        setFormData({
          firstName: profData.firstName || "",
          lastName: profData.lastName || "",
          email: profData.email || "",
          phone: profData.phone || "",
          specialty: profData.specialty || "",
          biography: profData.biography || "",
          isActive: profData.isActive !== undefined ? profData.isActive : true,
          isApproved:
            profData.isApproved !== undefined ? profData.isApproved : false,
        });
        setServices(profData.services || []);
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de récupérer les informations du professionnel",
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du professionnel:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2:
          "Une erreur est survenue lors de la récupération du professionnel",
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professionalId) {
      fetchProfessional();
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "ID du professionnel manquant",
      });
      navigation.goBack();
    }
  }, [professionalId]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
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
      const dataToSend = {
        ...formData,
        services,
      };

      const response = await apiService.put(
        `/users/${professionalId}`,
        dataToSend
      );

      if (response.data && response.data.success) {
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: "Professionnel mis à jour avec succès",
        });

        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de mettre à jour le professionnel",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du professionnel:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2:
          "Une erreur est survenue lors de la mise à jour du professionnel",
      });
    } finally {
      setSaving(false);
    }
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
              Modifier un professionnel
            </StyledText>
          </StyledView>

          <StyledView className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            {/* Informations de base */}
            <StyledText className="text-lg font-bold text-brown mb-3">
              Informations de base
            </StyledText>

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
          </StyledView>

          {/* Informations professionnelles */}
          <StyledView className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            <StyledText className="text-lg font-bold text-brown mb-3">
              Informations professionnelles
            </StyledText>

            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Spécialité</StyledText>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.specialty}
                onChangeText={(text) => handleChange("specialty", text)}
                placeholder="Spécialité"
              />
            </StyledView>

            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">Biographie</StyledText>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.biography}
                onChangeText={(text) => handleChange("biography", text)}
                placeholder="Biographie"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </StyledView>

            <StyledView className="mb-4">
              <StyledText className="text-gray-600 mb-1">
                Services proposés
              </StyledText>

              {services.map((service, index) => (
                <StyledView
                  key={index}
                  className="flex-row items-center justify-between mb-2 bg-gray-100 rounded-lg p-3"
                >
                  <StyledText>{service}</StyledText>
                  <TouchableOpacity onPress={() => removeService(index)}>
                    <Ionicons name="close-circle" size={20} color="#F44336" />
                  </TouchableOpacity>
                </StyledView>
              ))}

              <StyledView className="flex-row items-center mt-2">
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white flex-1 mr-2"
                  value={newService}
                  onChangeText={setNewService}
                  placeholder="Ajouter un service"
                />
                <TouchableOpacity
                  className="bg-sage p-3 rounded-lg"
                  onPress={addService}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Statut */}
          <StyledView className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            <StyledText className="text-lg font-bold text-brown mb-3">
              Statut
            </StyledText>

            <StyledView className="flex-row items-center justify-between mb-4">
              <StyledText className="text-gray-600">Actif</StyledText>
              <TouchableOpacity
                className={`px-4 py-2 rounded-lg ${
                  formData.isActive ? "bg-green-100" : "bg-gray-200"
                }`}
                onPress={() => handleChange("isActive", !formData.isActive)}
              >
                <StyledText
                  className={
                    formData.isActive ? "text-green-800" : "text-gray-700"
                  }
                >
                  {formData.isActive ? "Oui" : "Non"}
                </StyledText>
              </TouchableOpacity>
            </StyledView>

            <StyledView className="flex-row items-center justify-between">
              <StyledText className="text-gray-600">Approuvé</StyledText>
              <TouchableOpacity
                className={`px-4 py-2 rounded-lg ${
                  formData.isApproved ? "bg-green-100" : "bg-gray-200"
                }`}
                onPress={() => handleChange("isApproved", !formData.isApproved)}
              >
                <StyledText
                  className={
                    formData.isApproved ? "text-green-800" : "text-gray-700"
                  }
                >
                  {formData.isApproved ? "Oui" : "Non"}
                </StyledText>
              </TouchableOpacity>
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

export default AdminEditProfessionalScreen;
