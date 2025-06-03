import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LoginScreenProps } from "../types/navigation";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const { login, error, loading } = useAuth();

  // Regex pour valider un format d'email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    // Validation de l'email
    if (!email) {
      errors.email = "L'email est requis";
    } else if (!emailRegex.test(email)) {
      errors.email = "Format d'email invalide";
    }

    // Validation du mot de passe
    if (!password) {
      errors.password = "Le mot de passe est requis";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        const result = await login(email, password);

        // Vérifier si le résultat indique que l'utilisateur doit vérifier son email
        if (result && result.needsVerification) {
          console.log(
            "L'utilisateur doit vérifier son email:",
            result.email || email
          );

          // Stocker l'email pour l'écran de vérification
          await AsyncStorage.setItem(
            "pendingVerificationEmail",
            result.email || email
          );

          // Rediriger vers l'écran de vérification OTP
          navigation.navigate("VerifyOTP", {
            email: result.email || email,
          });
        }
        // Note: la redirection vers l'écran banni sera gérée automatiquement par le RootNavigator
        // quand il détectera que user.isBanned est true
      } catch (error: any) {
        // Gérer d'autres erreurs potentielles
        console.log("Erreur lors de la connexion:", error);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaWrapper>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-6">
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold text-brown mb-2">
              Booked
            </Text>
            <Text className="text-lg text-brown/80">Connexion</Text>
          </View>

          {error && (
            <View className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <View className="flex-row items-center">
                <View className="flex-shrink-0">
                  <Text className="text-red-500">⚠️</Text>
                </View>
                <View className="ml-3">
                  <Text className="text-red-700">{error}</Text>
                </View>
              </View>
            </View>
          )}

          <View className="bg-offwhite rounded-2xl shadow-xl p-6 border border-sage/20">
            <View className="mt-4">
              <Text className="text-brown font-semibold mb-2">Email</Text>
              <TextInput
                className="w-full p-3 border rounded-lg bg-offwhite text-brown border-sage/30"
                placeholder="Votre email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {validationErrors.email && (
                <Text className="text-red-500 text-sm mt-1">
                  {validationErrors.email}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-brown font-semibold mb-2">
                Mot de passe
              </Text>
              <View className="flex-row items-center border rounded-lg bg-offwhite border-sage/30">
                <TextInput
                  className="flex-1 p-3 text-brown"
                  placeholder="Votre mot de passe"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  className="pr-3"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#A8B9A3"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text className="text-red-500 text-sm mt-1">
                  {validationErrors.password}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className="w-full bg-sage py-3 px-6 rounded-xl mt-6 items-center"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#5D4037" />
              ) : (
                <Text className="text-brown font-semibold text-lg">
                  Se connecter
                </Text>
              )}
            </TouchableOpacity>

            <View className="mt-6 items-center">
              <Text className="text-brown/70">
                Vous n'avez pas de compte ?{" "}
                <Text
                  className="text-brown font-medium"
                  onPress={() => navigation.navigate("Register")}
                >
                  Créer un compte
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default LoginScreen;
