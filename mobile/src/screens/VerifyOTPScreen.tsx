import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

type VerifyOTPScreenRouteProp = RouteProp<RootStackParamList, "VerifyOTP">;

type VerifyOTPScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "VerifyOTP"
>;

const VerifyOTPScreen: React.FC = () => {
  const route = useRoute<VerifyOTPScreenRouteProp>();
  const navigation = useNavigation<VerifyOTPScreenNavigationProp>();
  const { setUser } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // State pour les 6 digits de l'OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<Array<TextInput | null>>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    // Vérifier immédiatement si nous avons un paramètre email dans les props de navigation
    if (route.params?.email) {
      setEmail(route.params.email);
    } else {
      // Si pas d'email dans les params, récupérer depuis AsyncStorage
      const getEmail = async () => {
        try {
          const pendingEmail = await AsyncStorage.getItem(
            "pendingVerificationEmail"
          );
          if (pendingEmail) {
            setEmail(pendingEmail);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'email:", error);
        }
      };
      getEmail();
    }

    // Vérifier si l'utilisateur vient juste de s'inscrire
    const checkJustRegistered = async () => {
      const justRegistered = await AsyncStorage.getItem("justRegistered");
      if (justRegistered === "true") {
        // Supprimer le flag après l'avoir vérifié
        await AsyncStorage.removeItem("justRegistered");
      }
    };

    checkJustRegistered();
  }, [route.params]);

  const handleOtpChange = (index: number, value: string) => {
    // Vérifier que la valeur est un chiffre
    if (!/^\d*$/.test(value)) return;

    // Mise à jour de l'état
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Passer au champ suivant si on vient d'entrer un chiffre
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Gérer la touche retour arrière
    if (key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Si le champ actuel est vide, revenir au précédent
        const newOtp = [...otp];
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Vérifier le code OTP
  const handleVerifyOTP = async () => {
    // Assembler le code OTP
    const verificationCode = otp.join("");

    if (verificationCode.length !== 6) {
      setError("Veuillez entrer le code complet à 6 chiffres");
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

  // Renvoyer le code OTP
  const handleResendCode = async () => {
    if (!email) {
      setError("Adresse email manquante");
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
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Bouton de retour */}
          <TouchableOpacity
            className="mb-6"
            onPress={async () => {
              await AsyncStorage.removeItem("pendingVerificationEmail");
              await AsyncStorage.removeItem("justRegistered");
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
          >
            <Text className="text-sage text-lg">← Retour</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold mb-6 text-center text-brown">
            Vérification de votre compte
          </Text>

          <Text className="text-brown/80 text-center mb-8">
            Veuillez entrer le code à 6 chiffres qui a été envoyé à votre
            adresse email {email}.
          </Text>

          {error ? (
            <View className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-red-700">{error}</Text>
              </View>
            </View>
          ) : null}

          {success ? (
            <View className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-green-700">{success}</Text>
              </View>
            </View>
          ) : null}

          <View className="bg-offwhite rounded-lg shadow-sm p-4 mb-6 border border-sage/20">
            {/* Champs OTP */}
            <View style={styles.otpContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(input) => {
                    inputRefs.current[index] = input;
                  }}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={otp[index]}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(index, nativeEvent.key)
                  }
                  caretHidden={false}
                  selectTextOnFocus={true}
                  editable={true}
                />
              ))}
            </View>

            <TouchableOpacity
              className="bg-sage py-3 rounded-lg items-center mt-2"
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold">
                  Vérifier mon compte
                </Text>
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
                <Text className="text-sage">Renvoyer le code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bouton pour revenir à l'écran de login */}
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={async () => {
              await AsyncStorage.removeItem("pendingVerificationEmail");
              await AsyncStorage.removeItem("justRegistered");
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
          >
            <Text className="text-brown-light underline">
              Retour à l'écran de connexion
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: "#A8B9A3",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#5D4037",
    backgroundColor: "#FFFFFF",
  },
});

export default VerifyOTPScreen;
