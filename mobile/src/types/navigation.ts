import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  EmailVerification: {
    email?: string;
  };
  VerifyOTP: {
    email?: string;
  };
  ScheduleSettings: undefined;
  AdminUsers: undefined;
  AdminProfessionals: undefined;
  AdminAppointments: undefined;
  AdminStats: undefined;
  AdminUnbanRequests: undefined;
  AdminEditUser: {
    userId: string;
  };
  AdminEditProfessional: {
    professionalId: string;
  };
  BannedUser: undefined;
};

export type TabNavigatorParamList = {
  HomeTab: undefined;
  BookingTab: undefined;
  MyAppointmentsTab: undefined;
  ProfileTab: undefined;
  ManageAvailabilityTab: undefined;
  ManageAppointmentsTab: {
    filter?: string;
  };
  AdminDashboardTab: undefined;
  AdminUsersTab: undefined;
  AdminProfessionalsTab: undefined;
  AdminAppointmentsTab: undefined;
  AdminStatsTab: undefined;
  AdminUnbanRequestsTab: undefined;
};

export type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Login">;
};

export type RegisterScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Register">;
};

export type EmailVerificationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "EmailVerification">;
};

export type VerifyOTPScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "VerifyOTP">;
};

export type HomeScreenProps = {
  navigation: BottomTabNavigationProp<TabNavigatorParamList, "HomeTab">;
};

export type BookingScreenProps = {
  navigation: BottomTabNavigationProp<TabNavigatorParamList, "BookingTab">;
};

export type MyAppointmentsScreenProps = {
  navigation: BottomTabNavigationProp<
    TabNavigatorParamList,
    "MyAppointmentsTab"
  >;
};

export type ProfileScreenProps = {
  navigation: BottomTabNavigationProp<TabNavigatorParamList, "ProfileTab">;
};

export type EditProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "EditProfile">;
};

export type ChangePasswordScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "ChangePassword">;
};

export type ScheduleSettingsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "ScheduleSettings">;
};

export type ManageAvailabilityScreenProps = {
  navigation: BottomTabNavigationProp<
    TabNavigatorParamList,
    "ManageAvailabilityTab"
  >;
};

export type ManageAppointmentsScreenProps = {
  navigation: BottomTabNavigationProp<
    TabNavigatorParamList,
    "ManageAppointmentsTab"
  >;
};

export type AdminDashboardScreenProps = {
  navigation: BottomTabNavigationProp<
    TabNavigatorParamList,
    "AdminDashboardTab"
  >;
};

export type AdminUsersScreenProps = {
  navigation: BottomTabNavigationProp<TabNavigatorParamList, "AdminUsersTab">;
};

export type AdminProfessionalsScreenProps = {
  navigation: BottomTabNavigationProp<
    TabNavigatorParamList,
    "AdminProfessionalsTab"
  >;
};

export type AdminAppointmentsScreenProps = {
  navigation: BottomTabNavigationProp<
    TabNavigatorParamList,
    "AdminAppointmentsTab"
  >;
};
