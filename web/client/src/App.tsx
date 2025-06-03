import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BannedUserPage from "./pages/BannedUserPage";
import NotFoundPage from "./pages/NotFoundPage";
import LegalPage from "./pages/LegalPage";
import PrivacyPage from "./pages/PrivacyPage";
import ContactPage from "./pages/ContactPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfessionalRoute from "./components/ProfessionalRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authService from "./services/auth";
import "./App.css";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import ClientRoute from "./routes/ClientRoute";
import ProfessionalAppointmentsPage from "./pages/ProfessionalAppointmentsPage";

// Composant temporaire pour remplacer AdminRoute
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Wrapper pour rediriger les utilisateurs bannis
const BannedUserRedirect: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  console.log("🔄 [BannedUserRedirect] Checking user:", currentUser);
  console.log("🔄 [BannedUserRedirect] Current location:", location.pathname);

  useEffect(() => {
    if (currentUser?.isBanned && location.pathname !== "/banned") {
      console.log(
        "🔄 [BannedUserRedirect] User is banned, redirecting to /banned"
      );
      navigate("/banned", { replace: true });
    } else if (
      !currentUser &&
      location.pathname !== "/login" &&
      location.pathname !== "/register"
    ) {
      console.log("🔄 [BannedUserRedirect] No user, redirecting to /login");
      navigate("/login", { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  return <>{children}</>;
};

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/banned" element={<BannedUserPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <BannedUserRedirect>
                  <HomePage />
                </BannedUserRedirect>
              }
            />
            <Route
              path="/booking"
              element={
                <BannedUserRedirect>
                  <ClientRoute>
                    <BookingPage />
                  </ClientRoute>
                </BannedUserRedirect>
              }
            />
            <Route
              path="/my-appointments"
              element={
                <BannedUserRedirect>
                  <ProtectedRoute>
                    <MyAppointmentsPage />
                  </ProtectedRoute>
                </BannedUserRedirect>
              }
            />
            <Route
              path="/profile"
              element={
                <BannedUserRedirect>
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                </BannedUserRedirect>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <BannedUserRedirect>
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                </BannedUserRedirect>
              }
            />
            <Route
              path="/admin"
              element={
                <BannedUserRedirect>
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                </BannedUserRedirect>
              }
            />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/professional-dashboard"
              element={
                <BannedUserRedirect>
                  <ProfessionalRoute>
                    <ProfessionalDashboard />
                  </ProfessionalRoute>
                </BannedUserRedirect>
              }
            />
            <Route
              path="/professional/my-appointments"
              element={
                <BannedUserRedirect>
                  <ProfessionalRoute>
                    <ProfessionalAppointmentsPage />
                  </ProfessionalRoute>
                </BannedUserRedirect>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="bottom-right" aria-label="Toast" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
