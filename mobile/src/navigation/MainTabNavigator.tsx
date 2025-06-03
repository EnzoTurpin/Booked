import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import ServicesScreen from "../screens/ServicesScreen";
import MyAppointmentsScreen from "../screens/MyAppointmentsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ContactScreen from "../screens/ContactScreen";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Services") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Booking") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "MyAppointments") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Contact") {
            iconName = focused ? "mail" : "mail-outline";
          }

          // @ts-ignore - L'icône sera toujours définie basée sur les conditions ci-dessus
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#A8B9A3",
        tabBarInactiveTintColor: "#5D4037",
        tabBarStyle: {
          backgroundColor: "#FAFAF8",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{ tabBarLabel: "Services" }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{ tabBarLabel: "Réserver" }}
      />
      <Tab.Screen
        name="MyAppointments"
        component={MyAppointmentsScreen}
        options={{ tabBarLabel: "Rendez-vous" }}
      />
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{ tabBarLabel: "Contact" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
