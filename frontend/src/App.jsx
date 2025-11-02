import React from "react";
import { Routes, Route } from "react-router-dom";

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
import Profile from "./pages/ProfilePage";

function App() {
  return (
    <FlashProvider>
      <Routes>
        {/* ✅ Dashboard pages FIRST (to prevent LandingPage override) */}
        <Route path="/dashboard/*" element={<DashboardLayoutAccount />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="loan-accounts" element={<LoanAcounts />} />
          <Route path="Calculator" element={<Calculator />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="nominee-details" element={<NomineePage />} />
          <Route path="profile" element={<Profile/>} />
        </Route>

        {/* ✅ Landing page LAST — catches all non-dashboard routes */}
        <Route path="/*" element={<LandingPage />} />
      </Routes>
    </FlashProvider>
  );
}

export default App;
