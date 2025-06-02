import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../types/navigation";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import EmailVerificationScreen from "../screens/EmailVerificationScreen";
import VerifyOTPScreen from "../screens/VerifyOTPScreen";
import HomeScreen from "../screens/HomeScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import BookingScreen from "../screens/BookingScreen";
import MyAppointmentsScreen from "../screens/MyAppointmentsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/api";
// Import des écrans professionnels
import ManageAvailabilityScreen from "../screens/professional/ManageAvailabilityScreen";
import ManageAppointmentsScreen from "../screens/professional/ManageAppointmentsScreen";
import ProfessionalHomeScreen from "../screens/professional/ProfessionalHomeScreen";
import ScheduleSettingsScreen from "../screens/professional/ScheduleSettingsScreen";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Stack = createStackNavigator<RootStackParamList>();
const ClientTab = createBottomTabNavigator();
const ProfessionalTab = createBottomTabNavigator();

// Navigateur pour les clients
const ClientTabNavigator = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  console.log("ClientTabNavigator - User:", user);
  console.log("ClientTabNavigator - Role:", user?.role);

  return (
    <ClientTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "BookingTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "MyAppointmentsTab") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#A8B9A3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FAFAF8",
          borderTopWidth: 0,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          height: 50,
          paddingBottom: 0,
          paddingTop: 0,
          position: "absolute",
          bottom: Platform.OS === "ios" ? (insets.bottom > 0 ? 20 : 0) : 0,
          left: 0,
          right: 0,
          zIndex: 999,
        },
      })}
    >
      <ClientTab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />
      <ClientTab.Screen
        name="BookingTab"
        component={BookingScreen}
        options={{ tabBarLabel: "Réservation" }}
      />
      <ClientTab.Screen
        name="MyAppointmentsTab"
        component={MyAppointmentsScreen}
        options={{ tabBarLabel: "Mes RDV" }}
      />
      <ClientTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </ClientTab.Navigator>
  );
};

// Navigateur pour les professionnels
const ProfessionalTabNavigator = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  console.log("ProfessionalTabNavigator - User:", user);
  console.log("ProfessionalTabNavigator - Role:", user?.role);

  return (
    <ProfessionalTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "ManageAvailabilityTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "ManageAppointmentsTab") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          // Assurez-vous que l'icône est valide
          if (!iconName) {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#A8B9A3",
        tabBarInactiveTintColor: "#5D4037",
        tabBarStyle: {
          backgroundColor: "#FAFAF8",
          borderTopWidth: 0,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          height: 50,
          paddingBottom: 0,
          paddingTop: 0,
          position: "absolute",
          bottom: Platform.OS === "ios" ? (insets.bottom > 0 ? 20 : 0) : 0,
          left: 0,
          right: 0,
          zIndex: 999,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 3,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarShowLabel: true,
      })}
    >
      <ProfessionalTab.Screen
        name="HomeTab"
        component={ProfessionalHomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />
      <ProfessionalTab.Screen
        name="ManageAvailabilityTab"
        component={ManageAvailabilityScreen}
        options={{ tabBarLabel: "Disponibilités" }}
      />
      <ProfessionalTab.Screen
        name="ManageAppointmentsTab"
        component={ManageAppointmentsScreen}
        options={{ tabBarLabel: "Rendez-vous" }}
      />
      <ProfessionalTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </ProfessionalTab.Navigator>
  );
};

const AuthenticatedTabNavigator = () => {
  const { user } = useAuth();
  console.log("AuthenticatedTabNavigator - User:", user);
  console.log("AuthenticatedTabNavigator - Role:", user?.role);

  // Forcer un remontage du composant lorsque le rôle change
  React.useEffect(() => {
    console.log(
      "Rôle utilisateur changé, remontage du navigateur:",
      user?.role
    );
  }, [user?.role]);

  // Sélectionner le navigateur approprié selon le rôle de l'utilisateur
  if (user?.role === "professional" || user?.role === "professionnal") {
    console.log("Loading PROFESSIONAL navigator");
    return <ProfessionalTabNavigator />;
  } else {
    console.log("Loading CLIENT navigator");
    return <ClientTabNavigator />;
  }
};

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);

  // Simple vérification initiale
  useEffect(() => {
    // Attendre que le chargement initial de l'auth soit terminé
    if (!loading) {
      setInitializing(false);
    }
  }, [loading]);

  if (initializing) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#A8B9A3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Routes authentifiées - si l'utilisateur est connecté
          <>
            <Stack.Screen name="Main" component={AuthenticatedTabNavigator} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            {user.role === "professional" || user.role === "professionnal" ? (
              <Stack.Screen
                name="ScheduleSettings"
                component={ScheduleSettingsScreen}
              />
            ) : null}
          </>
        ) : (
          // Routes publiques - si l'utilisateur n'est pas connecté
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="EmailVerification"
              component={EmailVerificationScreen}
            />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
