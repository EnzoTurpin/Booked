import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RegisterScreenProps } from "../types/navigation";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { register, error, loading } = useAuth();

  // Regex pour valider un format d'email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Regex pour valider la complexité du mot de passe
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasNumber = /[0-9]/;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  const validate = () => {
    const errors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!firstName) {
      errors.firstName = "Le prénom est requis";
    }

    if (!lastName) {
      errors.lastName = "Le nom est requis";
    }

    // Validation de l'email
    if (!email) {
      errors.email = "L'email est requis";
    } else if (!emailRegex.test(email)) {
      errors.email = "Format d'email invalide";
    }

    // Validation complexe du mot de passe
    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else {
      const validationMessages = [];

      if (!hasUpperCase.test(password)) {
        validationMessages.push("une lettre majuscule");
      }

      if (!hasLowerCase.test(password)) {
        validationMessages.push("une lettre minuscule");
      }

      if (!hasNumber.test(password)) {
        validationMessages.push("un chiffre");
      }

      if (!hasSpecialChar.test(password)) {
        validationMessages.push("un caractère spécial");
      }

      if (validationMessages.length > 0) {
        errors.password = `Le mot de passe doit contenir au moins ${validationMessages.join(
          ", "
        )}`;
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      try {
        console.log("Appel de la fonction register");
        const result = await register({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        });
        console.log("Résultat de register:", result);

        // Si l'utilisateur doit vérifier son email
        if (result && result.needsVerification) {
          console.log("Redirection vers l'écran de vérification OTP");
          console.log("Email à vérifier:", result.email || email);

          // Redirection immédiate vers l'écran de vérification OTP
          navigation.reset({
            index: 0,
            routes: [
              { name: "VerifyOTP", params: { email: result.email || email } },
            ],
          });
        }
      } catch (error: any) {
        console.log("Erreur lors de l'inscription:", error);

        // Ne pas rediriger en cas d'erreur, laisser l'utilisateur voir le message d'erreur
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <SafeAreaWrapper>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 pt-6 px-6 pb-6">
          <View className="items-center mb-8">
            <Text className="text-4xl font-extrabold text-brown mb-2">
              Booked
            </Text>
            <Text className="text-lg text-brown/80">Inscription</Text>
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
              <Text className="text-brown font-semibold mb-2">Prénom</Text>
              <TextInput
                className="w-full p-3 border rounded-lg bg-offwhite text-brown border-sage/30"
                placeholder="Votre prénom"
                value={firstName}
                onChangeText={setFirstName}
              />
              {validationErrors.firstName && (
                <Text className="text-red-500 text-sm mt-1">
                  {validationErrors.firstName}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-brown font-semibold mb-2">Nom</Text>
              <TextInput
                className="w-full p-3 border rounded-lg bg-offwhite text-brown border-sage/30"
                placeholder="Votre nom"
                value={lastName}
                onChangeText={setLastName}
              />
              {validationErrors.lastName && (
                <Text className="text-red-500 text-sm mt-1">
                  {validationErrors.lastName}
                </Text>
              )}
            </View>

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
              <Text className="text-xs text-brown-light mt-1">
                Le mot de passe doit contenir au moins 8 caractères, une lettre
                minuscule, une lettre majuscule, un chiffre et un caractère
                spécial.
              </Text>
            </View>

            <View className="mt-4">
              <Text className="text-brown font-semibold mb-2">
                Confirmer le mot de passe
              </Text>
              <View className="flex-row items-center border rounded-lg bg-offwhite border-sage/30">
                <TextInput
                  className="flex-1 p-3 text-brown"
                  placeholder="Confirmez votre mot de passe"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={toggleConfirmPasswordVisibility}
                  className="pr-3"
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#A8B9A3"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">
                  {validationErrors.confirmPassword}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className="w-full bg-sage py-3 px-6 rounded-xl mt-6 items-center"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#5D4037" />
              ) : (
                <Text className="text-brown font-semibold text-lg">
                  S'inscrire
                </Text>
              )}
            </TouchableOpacity>

            <View className="mt-6 items-center">
              <Text className="text-brown/70">
                Vous avez déjà un compte ?{" "}
                <Text
                  className="text-brown font-medium"
                  onPress={() => navigation.navigate("Login")}
                >
                  Se connecter
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default RegisterScreen;
