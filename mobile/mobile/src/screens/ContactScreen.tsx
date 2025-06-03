import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import Toast from "react-native-toast-message";
import { useAuth } from "../contexts/AuthContext";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactScreen: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const [loading, setLoading] = useState(false);

  // Initialiser les données du formulaire avec les informations de l'utilisateur si disponibles
  const [formData, setFormData] = useState<ContactFormData>({
    name: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  // État pour les erreurs de validation
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Le sujet est requis";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis";
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
      // Simuler l'envoi du formulaire
      setTimeout(() => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Message envoyé",
          text2: "Nous vous répondrons dans les plus brefs délais.",
        });

        // Réinitialiser le formulaire
        setFormData({
          name: user ? `${user.firstName} ${user.lastName}` : "",
          email: user?.email || "",
          subject: "",
          message: "",
        });
      }, 1000);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue lors de l'envoi du message.",
      });
    }
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
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
    <ScrollView className="flex-1 bg-beige">
      <StyledView className="px-6 py-8">
        <StyledText className="text-2xl font-bold mb-6 text-center text-brown">
          Contactez-nous
        </StyledText>

        <StyledView className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-sage/20">
          <StyledText className="text-brown mb-4">
            Vous avez des questions sur nos services ou besoin d'assistance ?
            N'hésitez pas à nous contacter via ce formulaire et nous vous
            répondrons dans les plus brefs délais.
          </StyledText>

          <StyledView className="space-y-4">
            {/* Nom */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Nom complet
              </StyledText>
              <TextInput
                className={`bg-white p-3 rounded-lg border ${
                  errors.name ? "border-red-500" : "border-sage/20"
                }`}
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
                placeholder="Votre nom"
              />
              {errors.name && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.name}
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

            {/* Sujet */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Sujet
              </StyledText>
              <TextInput
                className={`bg-white p-3 rounded-lg border ${
                  errors.subject ? "border-red-500" : "border-sage/20"
                }`}
                value={formData.subject}
                onChangeText={(value) => handleChange("subject", value)}
                placeholder="Sujet de votre message"
              />
              {errors.subject && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.subject}
                </StyledText>
              )}
            </StyledView>

            {/* Message */}
            <StyledView>
              <StyledText className="text-brown mb-1 font-medium">
                Message
              </StyledText>
              <TextInput
                className={`bg-white p-3 rounded-lg border ${
                  errors.message ? "border-red-500" : "border-sage/20"
                }`}
                value={formData.message}
                onChangeText={(value) => handleChange("message", value)}
                placeholder="Votre message"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              {errors.message && (
                <StyledText className="text-red-500 text-xs mt-1">
                  {errors.message}
                </StyledText>
              )}
            </StyledView>

            {/* Bouton d'envoi */}
            <TouchableOpacity
              className="bg-sage py-3 rounded-lg items-center mt-4"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <StyledText className="text-white font-bold">
                  Envoyer le message
                </StyledText>
              )}
            </TouchableOpacity>
          </StyledView>
        </StyledView>

        {/* Informations de contact */}
        <StyledView className="bg-white rounded-lg p-5 shadow-sm border border-sage/20">
          <StyledText className="text-lg font-bold text-brown mb-4">
            Nos coordonnées
          </StyledText>

          <StyledView className="space-y-3">
            <StyledView>
              <StyledText className="text-brown font-medium">
                Adresse
              </StyledText>
              <StyledText className="text-brown-light">
                123 rue de la Beauté, 75001 Paris
              </StyledText>
            </StyledView>

            <StyledView>
              <StyledText className="text-brown font-medium">
                Téléphone
              </StyledText>
              <StyledText className="text-brown-light">
                01 23 45 67 89
              </StyledText>
            </StyledView>

            <StyledView>
              <StyledText className="text-brown font-medium">Email</StyledText>
              <StyledText className="text-brown-light">
                contact@booked.com
              </StyledText>
            </StyledView>

            <StyledView>
              <StyledText className="text-brown font-medium">
                Horaires
              </StyledText>
              <StyledText className="text-brown-light">
                Lundi - Vendredi: 9h - 19h
              </StyledText>
              <StyledText className="text-brown-light">
                Samedi: 10h - 18h
              </StyledText>
              <StyledText className="text-brown-light">
                Dimanche: Fermé
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </ScrollView>
  );
};

export default ContactScreen;
