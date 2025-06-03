import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
  role: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
};

const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/users");
      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
        setFilteredUsers(response.data.data || []);
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de récupérer les utilisateurs",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2:
          "Une erreur est survenue lors de la récupération des utilisateurs",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  useEffect(() => {
    if (searchTerm || roleFilter) {
      const filtered = users.filter((user) => {
        const matchesSearch = searchTerm
          ? user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        const matchesRole = roleFilter ? user.role === roleFilter : true;

        return matchesSearch && matchesRole;
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, roleFilter, users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      setLoading(true);
      const response = await apiService.put(`/users/${userId}/ban`, {
        isBanned: !isBanned,
      });

      if (response.data && response.data.success) {
        // Mettre à jour la liste des utilisateurs
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, isBanned: !isBanned } : user
          )
        );

        Toast.show({
          type: "success",
          text1: "Succès",
          text2: !isBanned
            ? "Utilisateur banni avec succès"
            : "Utilisateur débanni avec succès",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de modifier le statut de ban",
        });
      }
    } catch (error) {
      console.error("Erreur lors du ban/déban:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId: string, currentRole: string) => {
    if (currentRole === "admin") {
      Toast.show({
        type: "info",
        text1: "Information",
        text2: "Un administrateur ne peut pas être rétrogradé",
      });
      return;
    }

    const newRole = currentRole === "client" ? "professional" : "client";

    Alert.alert(
      "Changer le rôle",
      `Voulez-vous changer le rôle de cet utilisateur en "${newRole}" ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Confirmer",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.put(`/users/${userId}/role`, {
                role: newRole,
              });

              if (response.data && response.data.success) {
                // Mettre à jour la liste des utilisateurs
                setUsers(
                  users.map((user) =>
                    user._id === userId ? { ...user, role: newRole } : user
                  )
                );

                Toast.show({
                  type: "success",
                  text1: "Succès",
                  text2: `Rôle changé en "${newRole}" avec succès`,
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Erreur",
                  text2: "Impossible de changer le rôle",
                });
              }
            } catch (error) {
              console.error("Erreur lors du changement de rôle:", error);
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

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      "Supprimer l'utilisateur",
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
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
              const response = await apiService.delete(`/users/${userId}`);

              if (response.data && response.data.success) {
                // Mettre à jour la liste des utilisateurs
                setUsers(users.filter((user) => user._id !== userId));

                Toast.show({
                  type: "success",
                  text1: "Succès",
                  text2: "Utilisateur supprimé avec succès",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Erreur",
                  text2: "Impossible de supprimer l'utilisateur",
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
              Gestion des utilisateurs
            </StyledText>
          </StyledView>

          {/* Recherche et filtres */}
          <StyledView className="mb-6">
            <StyledView className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                placeholder="Rechercher un utilisateur..."
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

            <StyledView className="flex-row justify-between">
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg ${
                  roleFilter === null ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setRoleFilter(null)}
              >
                <StyledText
                  className={
                    roleFilter === null ? "text-white" : "text-gray-700"
                  }
                >
                  Tous
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg ${
                  roleFilter === "client" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setRoleFilter("client")}
              >
                <StyledText
                  className={
                    roleFilter === "client" ? "text-white" : "text-gray-700"
                  }
                >
                  Clients
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg ${
                  roleFilter === "professional" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setRoleFilter("professional")}
              >
                <StyledText
                  className={
                    roleFilter === "professional"
                      ? "text-white"
                      : "text-gray-700"
                  }
                >
                  Professionnels
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg ${
                  roleFilter === "admin" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setRoleFilter("admin")}
              >
                <StyledText
                  className={
                    roleFilter === "admin" ? "text-white" : "text-gray-700"
                  }
                >
                  Admins
                </StyledText>
              </TouchableOpacity>
            </StyledView>
          </StyledView>

          {/* Liste des utilisateurs */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#A8B9A3" />
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <StyledView
                key={user._id}
                className={`mb-4 p-4 rounded-lg border ${
                  user.isBanned
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <StyledView className="flex-row justify-between items-start">
                  <StyledView className="flex-1">
                    <StyledText className="text-lg font-bold text-brown">
                      {user.firstName} {user.lastName}
                    </StyledText>
                    <StyledText className="text-gray-600">
                      {user.email}
                    </StyledText>
                    <StyledView className="flex-row items-center mt-1">
                      <StyledView
                        className={`px-2 py-1 rounded-full mr-2 ${
                          user.role === "admin"
                            ? "bg-purple-100"
                            : user.role === "professional"
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }`}
                      >
                        <StyledText
                          className={`text-xs ${
                            user.role === "admin"
                              ? "text-purple-800"
                              : user.role === "professional"
                              ? "text-blue-800"
                              : "text-green-800"
                          }`}
                        >
                          {user.role}
                        </StyledText>
                      </StyledView>
                      {user.isEmailVerified ? (
                        <StyledView className="flex-row items-center">
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#4CAF50"
                          />
                          <StyledText className="text-xs text-green-800 ml-1">
                            Vérifié
                          </StyledText>
                        </StyledView>
                      ) : (
                        <StyledView className="flex-row items-center">
                          <Ionicons
                            name="alert-circle"
                            size={16}
                            color="#FF9800"
                          />
                          <StyledText className="text-xs text-yellow-800 ml-1">
                            Non vérifié
                          </StyledText>
                        </StyledView>
                      )}
                    </StyledView>
                  </StyledView>

                  <StyledView className="flex-row">
                    {/* Bouton pour éditer */}
                    <TouchableOpacity
                      className="p-2 rounded-full mr-2 bg-blue-100"
                      onPress={() => {
                        // @ts-ignore
                        navigation.navigate("AdminEditUser", {
                          userId: user._id,
                        });
                      }}
                    >
                      <Ionicons name="create" size={20} color="#2196F3" />
                    </TouchableOpacity>

                    {/* Bouton pour bannir/débannir */}
                    <TouchableOpacity
                      className={`p-2 rounded-full mr-2 ${
                        user.isBanned ? "bg-green-100" : "bg-red-100"
                      }`}
                      onPress={() => handleBanUser(user._id, user.isBanned)}
                    >
                      <Ionicons
                        name={user.isBanned ? "checkmark-circle" : "ban"}
                        size={20}
                        color={user.isBanned ? "#4CAF50" : "#F44336"}
                      />
                    </TouchableOpacity>

                    {/* Bouton pour promouvoir/rétrograder */}
                    <TouchableOpacity
                      className="p-2 rounded-full mr-2 bg-blue-100"
                      onPress={() => handlePromoteUser(user._id, user.role)}
                    >
                      <Ionicons
                        name="swap-vertical"
                        size={20}
                        color="#2196F3"
                      />
                    </TouchableOpacity>

                    {/* Bouton pour supprimer */}
                    <TouchableOpacity
                      className="p-2 rounded-full bg-red-100"
                      onPress={() => handleDeleteUser(user._id)}
                    >
                      <Ionicons name="trash" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </StyledView>
                </StyledView>
              </StyledView>
            ))
          ) : (
            <StyledView className="items-center justify-center py-8">
              <Ionicons name="search" size={48} color="#CCCCCC" />
              <StyledText className="text-gray-400 mt-2">
                Aucun utilisateur trouvé
              </StyledText>
            </StyledView>
          )}
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

export default AdminUsersScreen;
