import React, { Suspense, lazy } from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components & Guards (always loaded)
import ProtectedRoute from "./components/ProtectedRoute";
import SubscriptionGuard from "./components/SubscriptionGuard";
import SuperAdminLayout from "./components/SuperAdminLayout";
import ProfileLayout from "./components/ProfileLayout";

// Loading spinner for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Core pages (eager - used immediately after login)
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";

// Lazy-loaded pages (loaded on demand)
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CustomerShop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const InventoryManagement = lazy(() => import("./pages/Inventory"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileOverview = lazy(() => import("./pages/ProfileOverview"));
const ProfileContact = lazy(() => import("./pages/ProfileContact"));
const ProfileBusinessHours = lazy(() => import("./pages/ProfileBusinessHours"));
const ProfileAI = lazy(() => import("./pages/ProfileAI"));
const ProfileDiscounts = lazy(() => import("./pages/ProfileDiscounts"));
const ProfileSubscription = lazy(() => import("./pages/ProfileSubscription"));
const ProfilePayment = lazy(() => import("./pages/ProfilePayment"));
const ProfileSupport = lazy(() => import("./pages/ProfileSupport"));
const ProfileDevices = lazy(() => import("./pages/ProfileDevices"));
const ProfileOnboarding = lazy(() => import("./pages/ProfileOnboarding"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const UserSupportTickets = lazy(() => import("./pages/UserSupportTickets"));
const Plans = lazy(() => import("./pages/Plans"));

// Super Admin (lazy - only loaded for super admins)
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const SuperAdminOverview = lazy(() => import("./pages/SuperAdminOverview"));
const SuperAdminUsers = lazy(() => import("./pages/SuperAdminUsers"));
const SuperAdminSubscriptions = lazy(() => import("./pages/SuperAdminSubscriptions"));
const SuperAdminAuditLogs = lazy(() => import("./pages/SuperAdminAuditLogs"));
const SuperAdminSupportTickets = lazy(() => import("./pages/SuperAdminSupportTickets"));
const SuperAdminEmailManagement = lazy(() => import("./pages/SuperAdminEmailManagement"));
const SuperAdminAIControls = lazy(() => import("./pages/SuperAdminAIControls"));
const SuperAdminSystemSettings = lazy(() => import("./pages/SuperAdminSystemSettings"));
const SuperAdminOnboarding = lazy(() => import("./pages/SuperAdminOnboarding"));
const SuperAdminSettings = lazy(() => import("./pages/SuperAdminSettings"));
const SuperAdminReports = lazy(() => import("./pages/SuperAdminReports"));
const SuperAdminSalesMarketing = lazy(() => import("./pages/SuperAdminSalesMarketing"));
const SuperAdminAIOperations = lazy(() => import("./pages/SuperAdminAIOperations"));
const VoiceTest = lazy(() => import("./pages/VoiceTest"));

// Other pages (lazy)
const Careers = lazy(() => import("./pages/Careers"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const AdminJobs = lazy(() => import("./pages/AdminJobs"));
const AdminApplications = lazy(() => import("./pages/AdminApplications"));

// Policy pages (lazy - rarely visited)
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const AcceptableUsePolicy = lazy(() => import("./pages/AcceptableUsePolicy"));
const SecurityPolicy = lazy(() => import("./pages/SecurityPolicy"));
const PaymentPolicy = lazy(() => import("./pages/PaymentPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const InternationalPolicy = lazy(() => import("./pages/InternationalPolicy"));

// Layout helper
const PageContainer = ({ children }) => (
  <div className="max-w-7xl mx-auto p-0">{children}</div>
);

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Suspense fallback={<PageLoader />}>
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
            {/* Profile Routes with ProfileLayout (Left Sidebar) */}
            <Route
              path="/profile/overview"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileOverview />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/contact"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileContact />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/hours"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileBusinessHours />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/ai"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileAI />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/discounts"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileDiscounts />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/subscription"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileSubscription />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/payment"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfilePayment />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/support"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileSupport />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/devices"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileDevices />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/onboarding"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <ProfileOnboarding />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileLayout>
                    <Profile />
                  </ProfileLayout>
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
                  <SuperAdminLayout>
                    <SuperAdminDashboard />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminDashboard />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/overview"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminOverview />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminUsers />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/subscriptions"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminSubscriptions />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/audit-logs"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminAuditLogs />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/support-tickets"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminSupportTickets />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/email-management"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminEmailManagement />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/ai-controls"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminAIControls />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/system-settings"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminSystemSettings />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/settings"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminSettings />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/reports"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminReports />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/jobs"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <AdminJobs />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/applications"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <AdminApplications />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/onboarding"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminOnboarding />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/sales-marketing"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminSalesMarketing />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/ai-operations"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <SuperAdminAIOperations />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/voice-test"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminLayout>
                    <VoiceTest />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice-test"
              element={
                <ProtectedRoute>
                  <PageContainer>
                    <VoiceTest />
                  </PageContainer>
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-all Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-6">Page not found</p>
                    <a
                      href="/"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
