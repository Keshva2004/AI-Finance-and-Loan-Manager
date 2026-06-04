import React, { useState, useEffect } from "react"; // Added useState and useEffect for async auth check
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios"; // Added for API calls (ensure axios is installed)

// Pages
import LandingPage from "./pages/LandingPage";
import DashboardLayoutAccount from "./pages/Dashboard";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import LoanAcounts from "./pages/LoanAcoounts";
import PaymentsPage from "./pages/PaymentPage";
import DocumentsPage from "./pages/DocumentsPage";
import NomineePage from "./pages/NomineePage";
import Calculator from "./pages/Calculator";
import { FlashProvider } from "./Context/FlashProvider";
import AdminProfile from "./pages/ProfilePage";

// ✅ Updated: ProtectedRoute Component with Backend Verification
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = auth, false = not auth
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Call backend /admin/verify to check session
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/admin/verify`,
          {
            withCredentials: true, // Ensures cookies/sessions are sent
          },
        );
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsAuthenticated(false); // Default to not authenticated on error
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  // If not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

function App() {
  return (
    <FlashProvider>
      <Routes>
        {/* ✅ Protected Dashboard Routes: Wrapped with ProtectedRoute */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayoutAccount />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="loan-accounts" element={<LoanAcounts />} />
          <Route path="Calculator" element={<Calculator />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="nominee-details" element={<NomineePage />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* ✅ Landing page LAST — catches all non-dashboard routes */}
        <Route path="/*" element={<LandingPage />} />
      </Routes>
    </FlashProvider>
  );
}

export default App;
