import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
  isEmailVerified: boolean;
  isApproved: boolean;
  specialty: string;
  biography: string;
  services: string[];
  isActive: boolean;
  createdAt: string;
};

const AdminProfessionalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<
    Professional[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/users?role=professional");
      if (response.data && response.data.success) {
        setProfessionals(response.data.data || []);
        setFilteredProfessionals(response.data.data || []);
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de récupérer les professionnels",
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des professionnels:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2:
          "Une erreur est survenue lors de la récupération des professionnels",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfessionals();
    }, [])
  );

  useEffect(() => {
    if (searchTerm || statusFilter) {
      const filtered = professionals.filter((professional) => {
        const matchesSearch = searchTerm
          ? professional.firstName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            professional.lastName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            professional.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (professional.specialty &&
              professional.specialty
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
          : true;

        const matchesStatus = statusFilter
          ? (statusFilter === "approved" && professional.isApproved) ||
            (statusFilter === "pending" && !professional.isApproved) ||
            (statusFilter === "active" && professional.isActive) ||
            (statusFilter === "inactive" && !professional.isActive)
          : true;

        return matchesSearch && matchesStatus;
      });
      setFilteredProfessionals(filtered);
    } else {
      setFilteredProfessionals(professionals);
    }
  }, [searchTerm, statusFilter, professionals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfessionals();
  };

  const handleViewDetails = (professional: Professional) => {
    setSelectedProfessional(professional);
    setModalVisible(true);
  };

  const handleApproveReject = async (
    professionalId: string,
    approve: boolean
  ) => {
    try {
      setLoading(true);
      const response = await apiService.put(
        `/users/${professionalId}/approve`,
        {
          isApproved: approve,
        }
      );

      if (response.data && response.data.success) {
        // Mettre à jour la liste des professionnels
        setProfessionals(
          professionals.map((prof) =>
            prof._id === professionalId
              ? { ...prof, isApproved: approve }
              : prof
          )
        );

        Toast.show({
          type: "success",
          text1: "Succès",
          text2: approve
            ? "Professionnel approuvé avec succès"
            : "Professionnel rejeté",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de modifier le statut d'approbation",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation/rejet:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveStatus = async (
    professionalId: string,
    isCurrentlyActive: boolean
  ) => {
    try {
      setLoading(true);
      const response = await apiService.put(`/users/${professionalId}/status`, {
        isActive: !isCurrentlyActive,
      });

      if (response.data && response.data.success) {
        // Mettre à jour la liste des professionnels
        setProfessionals(
          professionals.map((prof) =>
            prof._id === professionalId
              ? { ...prof, isActive: !isCurrentlyActive }
              : prof
          )
        );

        Toast.show({
          type: "success",
          text1: "Succès",
          text2: !isCurrentlyActive
            ? "Professionnel activé avec succès"
            : "Professionnel désactivé",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de modifier le statut d'activation",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfessional = async (professionalId: string) => {
    Alert.alert(
      "Supprimer le professionnel",
      "Êtes-vous sûr de vouloir supprimer ce professionnel ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.delete(
                `/users/${professionalId}`
              );

              if (response.data && response.data.success) {
                // Mettre à jour la liste des professionnels
                setProfessionals(
                  professionals.filter((prof) => prof._id !== professionalId)
                );

                Toast.show({
                  type: "success",
                  text1: "Succès",
                  text2: "Professionnel supprimé avec succès",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Erreur",
                  text2: "Impossible de supprimer le professionnel",
                });
              }
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Toast.show({
                type: "error",
                text1: "Erreur",
                text2: "Une erreur est survenue",
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        className="flex-1"
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StyledView className="p-6">
          <StyledView className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#5D4037" />
            </TouchableOpacity>
            <StyledText className="text-2xl font-bold text-brown">
              Gestion des professionnels
            </StyledText>
          </StyledView>

          {/* Recherche et filtres */}
          <StyledView className="mb-6">
            <StyledView className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                placeholder="Rechercher un professionnel..."
                placeholderTextColor="#8E8E93"
                className="flex-1 ml-2 text-gray-800"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm ? (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              ) : null}
            </StyledView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === null ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter(null)}
              >
                <StyledText
                  className={
                    statusFilter === null ? "text-white" : "text-gray-700"
                  }
                >
                  Tous
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "approved" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("approved")}
              >
                <StyledText
                  className={
                    statusFilter === "approved" ? "text-white" : "text-gray-700"
                  }
                >
                  Approuvés
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "pending" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("pending")}
              >
                <StyledText
                  className={
                    statusFilter === "pending" ? "text-white" : "text-gray-700"
                  }
                >
                  En attente
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "active" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("active")}
              >
                <StyledText
                  className={
                    statusFilter === "active" ? "text-white" : "text-gray-700"
                  }
                >
                  Actifs
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "inactive" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("inactive")}
              >
                <StyledText
                  className={
                    statusFilter === "inactive" ? "text-white" : "text-gray-700"
                  }
                >
                  Inactifs
                </StyledText>
              </TouchableOpacity>
            </ScrollView>
          </StyledView>

          {/* Liste des professionnels */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#A8B9A3" />
          ) : filteredProfessionals.length > 0 ? (
            filteredProfessionals.map((professional) => (
              <StyledView
                key={professional._id}
                className={`mb-4 p-4 rounded-lg border ${
                  !professional.isApproved
                    ? "border-yellow-300 bg-yellow-50"
                    : !professional.isActive
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <StyledView className="flex-row justify-between items-start">
                  <StyledView className="flex-1">
                    <StyledText className="text-lg font-bold text-brown">
                      {professional.firstName} {professional.lastName}
                    </StyledText>
                    <StyledText className="text-gray-600">
                      {professional.email}
                    </StyledText>

                    {professional.specialty && (
                      <StyledText className="text-gray-700 mt-1">
                        Spécialité: {professional.specialty}
                      </StyledText>
                    )}

                    <StyledView className="flex-row items-center mt-2">
                      {professional.isApproved ? (
                        <StyledView className="flex-row items-center bg-green-100 px-2 py-1 rounded-full mr-2">
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#4CAF50"
                          />
                          <StyledText className="text-xs text-green-800 ml-1">
                            Approuvé
                          </StyledText>
                        </StyledView>
                      ) : (
                        <StyledView className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full mr-2">
                          <Ionicons name="time" size={16} color="#FF9800" />
                          <StyledText className="text-xs text-yellow-800 ml-1">
                            En attente
                          </StyledText>
                        </StyledView>
                      )}

                      {professional.isActive ? (
                        <StyledView className="flex-row items-center bg-blue-100 px-2 py-1 rounded-full">
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#2196F3"
                          />
                          <StyledText className="text-xs text-blue-800 ml-1">
                            Actif
                          </StyledText>
                        </StyledView>
                      ) : (
                        <StyledView className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color="#9E9E9E"
                          />
                          <StyledText className="text-xs text-gray-800 ml-1">
                            Inactif
                          </StyledText>
                        </StyledView>
                      )}
                    </StyledView>
                  </StyledView>

                  <StyledView className="flex-row">
                    {/* Bouton pour voir les détails */}
                    <TouchableOpacity
                      className="p-2 rounded-full mr-2 bg-blue-100"
                      onPress={() => handleViewDetails(professional)}
                    >
                      <Ionicons
                        name="information-circle"
                        size={20}
                        color="#2196F3"
                      />
                    </TouchableOpacity>

                    {/* Bouton pour éditer */}
                    <TouchableOpacity
                      className="p-2 rounded-full mr-2 bg-blue-100"
                      onPress={() => {
                        // @ts-ignore
                        navigation.navigate("AdminEditProfessional", {
                          professionalId: professional._id,
                        });
                      }}
                    >
                      <Ionicons name="create" size={20} color="#2196F3" />
                    </TouchableOpacity>

                    {/* Bouton pour approuver/rejeter */}
                    {!professional.isApproved ? (
                      <TouchableOpacity
                        className="p-2 rounded-full mr-2 bg-green-100"
                        onPress={() =>
                          handleApproveReject(professional._id, true)
                        }
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#4CAF50"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className="p-2 rounded-full mr-2 bg-yellow-100"
                        onPress={() =>
                          handleApproveReject(professional._id, false)
                        }
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#FF9800"
                        />
                      </TouchableOpacity>
                    )}

                    {/* Bouton pour activer/désactiver */}
                    <TouchableOpacity
                      className={`p-2 rounded-full mr-2 ${
                        professional.isActive ? "bg-red-100" : "bg-green-100"
                      }`}
                      onPress={() =>
                        handleToggleActiveStatus(
                          professional._id,
                          professional.isActive
                        )
                      }
                    >
                      <Ionicons
                        name={professional.isActive ? "power" : "power-outline"}
                        size={20}
                        color={professional.isActive ? "#F44336" : "#4CAF50"}
                      />
                    </TouchableOpacity>

                    {/* Bouton pour supprimer */}
                    <TouchableOpacity
                      className="p-2 rounded-full bg-red-100"
                      onPress={() => handleDeleteProfessional(professional._id)}
                    >
                      <Ionicons name="trash" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </StyledView>
                </StyledView>
              </StyledView>
            ))
          ) : (
            <StyledView className="items-center justify-center py-8">
              <Ionicons name="briefcase" size={48} color="#CCCCCC" />
              <StyledText className="text-gray-400 mt-2">
                Aucun professionnel trouvé
              </StyledText>
            </StyledView>
          )}
        </StyledView>
      </ScrollView>

      {/* Modal de détails */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center">
          <StyledView className="m-5 bg-white rounded-xl p-6">
            <StyledView className="flex-row justify-between items-center mb-4">
              <StyledText className="text-xl font-bold text-brown">
                Détails du professionnel
              </StyledText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#5D4037" />
              </TouchableOpacity>
            </StyledView>

            {selectedProfessional && (
              <ScrollView className="max-h-96">
                <StyledText className="text-lg font-bold mb-1">
                  {selectedProfessional.firstName}{" "}
                  {selectedProfessional.lastName}
                </StyledText>
                <StyledText className="text-gray-600 mb-3">
                  {selectedProfessional.email}
                </StyledText>

                <StyledView className="mb-3">
                  <StyledText className="font-bold text-brown mb-1">
                    Spécialité
                  </StyledText>
                  <StyledText className="text-gray-700">
                    {selectedProfessional.specialty || "Non spécifiée"}
                  </StyledText>
                </StyledView>

                <StyledView className="mb-3">
                  <StyledText className="font-bold text-brown mb-1">
                    Biographie
                  </StyledText>
                  <StyledText className="text-gray-700">
                    {selectedProfessional.biography ||
                      "Aucune biographie fournie"}
                  </StyledText>
                </StyledView>

                <StyledView className="mb-3">
                  <StyledText className="font-bold text-brown mb-1">
                    Services proposés
                  </StyledText>
                  {selectedProfessional.services &&
                  selectedProfessional.services.length > 0 ? (
                    selectedProfessional.services.map((service, index) => (
                      <StyledView
                        key={index}
                        className="flex-row items-center mb-1"
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#4CAF50"
                        />
                        <StyledText className="text-gray-700 ml-2">
                          {service}
                        </StyledText>
                      </StyledView>
                    ))
                  ) : (
                    <StyledText className="text-gray-500">
                      Aucun service enregistré
                    </StyledText>
                  )}
                </StyledView>

                <StyledView className="mb-3">
                  <StyledText className="font-bold text-brown mb-1">
                    Statut
                  </StyledText>
                  <StyledView className="flex-row">
                    <StyledView
                      className={`px-2 py-1 rounded-full mr-2 ${
                        selectedProfessional.isApproved
                          ? "bg-green-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <StyledText
                        className={`text-xs ${
                          selectedProfessional.isApproved
                            ? "text-green-800"
                            : "text-yellow-800"
                        }`}
                      >
                        {selectedProfessional.isApproved
                          ? "Approuvé"
                          : "En attente d'approbation"}
                      </StyledText>
                    </StyledView>
                    <StyledView
                      className={`px-2 py-1 rounded-full ${
                        selectedProfessional.isActive
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <StyledText
                        className={`text-xs ${
                          selectedProfessional.isActive
                            ? "text-blue-800"
                            : "text-gray-800"
                        }`}
                      >
                        {selectedProfessional.isActive ? "Actif" : "Inactif"}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>

                <StyledView className="flex-row mt-4">
                  {!selectedProfessional.isApproved ? (
                    <TouchableOpacity
                      className="flex-1 bg-green-100 py-2 rounded-lg mr-2 items-center"
                      onPress={() => {
                        handleApproveReject(selectedProfessional._id, true);
                        setModalVisible(false);
                      }}
                    >
                      <StyledText className="text-green-800 font-bold">
                        Approuver
                      </StyledText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="flex-1 bg-yellow-100 py-2 rounded-lg mr-2 items-center"
                      onPress={() => {
                        handleApproveReject(selectedProfessional._id, false);
                        setModalVisible(false);
                      }}
                    >
                      <StyledText className="text-yellow-800 font-bold">
                        Rétrograder
                      </StyledText>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-lg items-center ${
                      selectedProfessional.isActive
                        ? "bg-red-100"
                        : "bg-blue-100"
                    }`}
                    onPress={() => {
                      handleToggleActiveStatus(
                        selectedProfessional._id,
                        selectedProfessional.isActive
                      );
                      setModalVisible(false);
                    }}
                  >
                    <StyledText
                      className={`font-bold ${
                        selectedProfessional.isActive
                          ? "text-red-800"
                          : "text-blue-800"
                      }`}
                    >
                      {selectedProfessional.isActive ? "Désactiver" : "Activer"}
                    </StyledText>
                  </TouchableOpacity>
                </StyledView>
              </ScrollView>
            )}
          </StyledView>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AdminProfessionalsScreen;
