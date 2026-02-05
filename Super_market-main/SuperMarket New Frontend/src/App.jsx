

import React from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import CustomerShop from "./pages/Shop";
import Cart from "./pages/Cart";
import InventoryManagement from "./pages/Inventory";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import AdminUsers from "./pages/AdminUsers";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import UserSupportTickets from "./pages/UserSupportTickets";


// Super Admin Pages
import SuperAdminOverview from "./pages/SuperAdminOverview";
import SuperAdminUsers from "./pages/SuperAdminUsers";
import SuperAdminSubscriptions from "./pages/SuperAdminSubscriptions";
import SuperAdminAuditLogs from "./pages/SuperAdminAuditLogs";
import SuperAdminSupportTickets from "./pages/SuperAdminSupportTickets";
import SuperAdminEmailManagement from "./pages/SuperAdminEmailManagement";
import SuperAdminAIControls from "./pages/SuperAdminAIControls";
import SuperAdminSystemSettings from "./pages/SuperAdminSystemSettings";
import SuperAdminOnboarding from "./pages/SuperAdminOnboarding";
import SuperAdminSettings from "./pages/SuperAdminSettings";
import SuperAdminReports from "./pages/SuperAdminReports";
import AuditLogDashboard from "./pages/AuditLogDashboard";

// Other Pages
import Plans from "./pages/Plans";
import Careers from "./pages/Careers";
import JobDetails from "./pages/JobDetails";
import AdminJobs from "./pages/AdminJobs";
import AdminApplications from "./pages/AdminApplications";


// Policy Pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import AcceptableUsePolicy from "./pages/AcceptableUsePolicy";
import SecurityPolicy from "./pages/SecurityPolicy";
import PaymentPolicy from "./pages/PaymentPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import InternationalPolicy from "./pages/InternationalPolicy";

// Components & Guards
import ProtectedRoute from "./components/ProtectedRoute";
import SubscriptionGuard from "./components/SubscriptionGuard";

// Layout helpers
const PageContainer = ({ children }) => (
  <div className="max-w-7xl mx-auto p-0">{children}</div>
);
const FullWidthContainer = ({ children }) => (
  <div className="w-full">{children}</div>
);
const RoutesWrapper = ({ children }) => <>{children}</>;

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Skip link for keyboard users */}
        <a
          href="#adminContent"
          className="skip-link absolute left-0 -top-20 focus:top-0 focus:left-0 bg-white px-4 py-2 rounded shadow-md z-50"
        >
          Skip to content
        </a>

        <RoutesWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/plans" element={<Plans />} />

            {/* Careers Routes */}
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:id" element={<JobDetails />} />

            {/* Policy Routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/acceptable-use-policy" element={<AcceptableUsePolicy />} />
            <Route path="/security-policy" element={<SecurityPolicy />} />
            <Route path="/payment-policy" element={<PaymentPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/international-policy" element={<InternationalPolicy />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageContainer>
                    <Dashboard />
                  </PageContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <PageContainer>
                      <CustomerShop />
                    </PageContainer>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <PageContainer>
                      <Cart />
                    </PageContainer>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <PageContainer>
                      <InventoryManagement />
                    </PageContainer>
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageContainer>
                    <Profile />
                  </PageContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <PageContainer>
                    <UserSupportTickets />
                  </PageContainer>
                </ProtectedRoute>
              }
            />
            {/* Protected Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <PageContainer>
                    <AdminUsers />
                  </PageContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <PageContainer>
                    <AdminJobs />
                  </PageContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <PageContainer>
                    <AdminApplications />
                  </PageContainer>
                </ProtectedRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/superadmindashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminDashboard />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminDashboard />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/overview"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminOverview />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminUsers />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/subscriptions"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminSubscriptions />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/audit-logs"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminAuditLogs />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/support-tickets"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminSupportTickets />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/email-management"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminEmailManagement />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/ai-controls"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminAIControls />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/system-settings"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminSystemSettings />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/settings"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminSettings />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/reports"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminReports />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/jobs"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <AdminJobs />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/applications"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <AdminApplications />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/onboarding"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FullWidthContainer>
                    <SuperAdminOnboarding />
                  </FullWidthContainer>
                </ProtectedRoute>
              }
            />
          </Routes>
        </RoutesWrapper>
      </div>
    </Router>
  );
};

export default App;
