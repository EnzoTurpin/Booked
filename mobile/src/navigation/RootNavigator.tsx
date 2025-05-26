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
import { ActivityIndicator, View } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const AuthenticatedTabNavigator = () => {
  const { user } = useAuth();

  // Navigateur pour les clients
  if (user?.role === "client" || !user?.role) {
    return (
      <Tab.Navigator
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

            return (
              <Ionicons name={iconName as any} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: "#A8B9A3",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ tabBarLabel: "Accueil" }}
        />
        <Tab.Screen
          name="BookingTab"
          component={BookingScreen}
          options={{ tabBarLabel: "Réservation" }}
        />
        <Tab.Screen
          name="MyAppointmentsTab"
          component={MyAppointmentsScreen}
          options={{ tabBarLabel: "Mes RDV" }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{ tabBarLabel: "Profil" }}
        />
      </Tab.Navigator>
    );
  }

  // Navigateur pour les professionnels
  if (user?.role === "professional") {
    return (
      <Tab.Navigator
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

            return (
              <Ionicons name={iconName as any} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: "#A8B9A3",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ tabBarLabel: "Accueil" }}
        />
        <Tab.Screen
          name="ManageAvailabilityTab"
          component={ManageAvailabilityScreen}
          options={{ tabBarLabel: "Disponibilités" }}
        />
        <Tab.Screen
          name="ManageAppointmentsTab"
          component={ManageAppointmentsScreen}
          options={{ tabBarLabel: "Rendez-vous" }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{ tabBarLabel: "Profil" }}
        />
      </Tab.Navigator>
    );
  }

  // Fallback
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
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
