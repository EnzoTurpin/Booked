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
