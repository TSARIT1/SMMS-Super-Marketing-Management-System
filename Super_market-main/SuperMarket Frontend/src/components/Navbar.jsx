import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  BarChart3,
  UserRoundPen,
  Menu,
  X,
  Shield,
  AlertTriangle,
  Bell,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import PendingPaymentBar from "./PendingPaymentBar";
import PendingPaymentModal from "./PendingPaymentModal";
import ConfirmModal from "./ConfirmModal";
import LanguageThemeSelector from "./LanguageThemeSelector";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useTranslation } from "react-i18next";
import tsarItLogo from "../assets/tsar-it-logo.png";

const Navbar = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [frozenUsersCount, setFrozenUsersCount] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: "",
    initials: "",
    email: "",
    profilePhoto: null,
  });
  const [shopName, setShopName] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    try {
      const adminData = JSON.parse(localStorage.getItem("admin"));
      return adminData && adminData.role === "SUPER_ADMIN";
    } catch (err) {
      console.debug("Failed to parse admin from storage:", err);
      return false;
    }
  });

  // Pending payment UI state
  const [pendingExists, setPendingExists] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pendingPayment");
      setPendingExists(Boolean(raw));
    } catch {
      setPendingExists(false);
    }

    const handler = (e) => {
      if (e.key === "pendingPayment") setPendingExists(Boolean(e.newValue));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Load user details from localStorage and update on storage events
  const navigate = useNavigate();
  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) {
          setUserProfile({ name: "", initials: "", email: "" });
          setShopName("");
          return;
        }
        const u = JSON.parse(raw);
        const name =
          u.fullName ||
          u.name ||
          `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
          "";
        const email = u.email || "";
        const localShopName = u.shop_name || u.shopName || "";
        let initials = "";
        if (name) {
          const parts = name.split(" ").filter(Boolean);
          initials =
            parts.length === 1
              ? parts[0].slice(0, 2).toUpperCase()
              : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (email) {
          initials = email[0].toUpperCase();
        }
        setUserProfile({ name, initials, email });
        setShopName(localShopName);
      } catch (err) {
        console.debug("Failed to parse user from localStorage", err);
        setUserProfile({ name: "", initials: "", email: "" });
        setShopName("");
      }
    };
    loadUser();
    const handler2 = (e) => {
      if (e.key === "user") loadUser();
    };
    window.addEventListener("storage", handler2);
    window.addEventListener("user:update", loadUser);
    return () => {
      window.removeEventListener("storage", handler2);
      window.removeEventListener("user:update", loadUser);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchShopName = async () => {
      if (!userProfile.email) {
        return;
      }
      try {
        const resp = await api.get("/profile", {
          params: { email: userProfile.email },
        });
        const resolvedShopName =
          resp?.data?.shop_name || resp?.data?.shopName || "";
        const profilePhoto = resp?.data?.profile_photo || null;
        if (mounted) {
          if (resolvedShopName) {
            setShopName(resolvedShopName);
          }
          if (profilePhoto) {
            setUserProfile((prev) => ({ ...prev, profilePhoto }));
          }
        }
      } catch (err) {
        console.debug("Failed to load profile shop name", err);
      }
    };

    fetchShopName();

    // Listen for profile updates
    const handleProfileUpdate = () => fetchShopName();
    window.addEventListener("profile:update", handleProfileUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("profile:update", handleProfileUpdate);
    };
  }, [userProfile.email]);

  // Confirm logout state + performer
  const [confirmUserLogoutOpen, setConfirmUserLogoutOpen] = useState(false);
  const performUserLogout = React.useCallback(() => {
    setConfirmUserLogoutOpen(false);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (err) {
      console.debug("Failed to clear user from localStorage", err);
    }
    try {
      toast.success("Logged out successfully");
    } catch {
      /* ignore toast errors */
    }
    navigate("/login");
  }, [navigate]);

  // Show admin controls only when on admin routes
  const showAdminControls =
    isSuperAdmin &&
    (pathname.startsWith("/superadmindashboard") ||
      pathname.startsWith("/admin"));

  // Subscription status: show unobtrusive banner/CTA when subscription is not active
  const [hasSubscription, setHasSubscription] = useState(true);
  useEffect(() => {
    let mounted = true;
    const headers = {};
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.id) headers["userId"] = u.id;
      }
    } catch (err) {
      console.debug("Failed to parse user from localStorage", err);
    }

    api
      .get("/subscription/check-active", { headers })
      .then((res) => {
        if (mounted) setHasSubscription(Boolean(res.data?.isActive));
      })
      .catch((err) => {
        console.debug("Subscription check failed", err);
        if (mounted) setHasSubscription(false);
      });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const navItems = [
    { name: t("nav.dashboard", "Dashboard"), path: "/dashboard", icon: BarChart3 },
    { name: t("nav.inventory", "Inventory"), path: "/inventory", icon: Package },
    { name: t("nav.pos", "POS"), path: "/shop", icon: ShoppingCart },
    { name: t("nav.profile", "Profile"), path: "/profile", icon: UserRoundPen },
  ];
  const welcomeLabel = t("nav.welcome", "Welcome");
  const navBrandText = shopName
    ? `${welcomeLabel}, ${shopName}`
    : welcomeLabel;

  // Fetch frozen users count for super admin
  const fetchFrozenUsersCount = React.useCallback(async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem("admin")) || null;
      const currentIsSuper = adminData && adminData.role === "SUPER_ADMIN";
      setIsSuperAdmin(currentIsSuper);
      const isAdminRoute =
        pathname.startsWith("/superadmindashboard") ||
        pathname.startsWith("/admin");
      if (!currentIsSuper || !isAdminRoute) {
        setFrozenUsersCount(0);
        return;
      }
      const response = await api.get("/admin/users");
      const frozenCount = (response.data || []).filter(
        (user) => user.accountStatus === "FROZEN",
      ).length;
      setFrozenUsersCount(frozenCount);
    } catch (error) {
      console.error("Failed to fetch frozen users count:", error);
      setFrozenUsersCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    // initial load
    fetchFrozenUsersCount();
    const handler = () => fetchFrozenUsersCount();
    // listen for freeze updates and admin changes (set by login/auto-login)
    window.addEventListener("freeze:update", handler);
    window.addEventListener("admin:update", handler);
    // Also listen to storage changes (other tabs)
    const storageHandler = (e) => {
      if (e.key === "admin") handler();
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("freeze:update", handler);
      window.removeEventListener("admin:update", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, [fetchFrozenUsersCount]);

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src={tsarItLogo} 
              alt="TSAR-IT Logo" 
              className="w-8 h-8 rounded-lg shadow object-contain bg-white"
            />
            <span className="text-lg sm:text-xl font-bold brand-highlight max-w-[280px] truncate">
              {navBrandText}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-2 py-1 rounded-md transition text-sm relative ${
                    pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                  {item.badge === "AI" && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}
                </Link>
              );
            })}

            {/* User Profile - Desktop */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {userProfile.profilePhoto ? (
                  <img
                    src={userProfile.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {userProfile.initials}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {userProfile.name}
                </p>
                <p className="text-xs text-gray-500">{userProfile.email}</p>
              </div>
              {/* Pending payment icon */}
              <div className="ml-4 flex items-center">
                <button
                  title={t("nav.pendingPayments", "Pending payments — click to resume")}
                  onClick={() => setShowPendingModal(true)}
                  aria-label={t("nav.pendingPayments")}
                  className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell className="w-4 h-4 text-yellow-600" />
                  {pendingExists && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                  )}
                </button>
              </div>
              {/* Language & Theme Selector */}
              <div className="ml-2 flex items-center">
                <LanguageThemeSelector />
              </div>
              {/* Admin logout button - only visible in admin routes */}
              {showAdminControls && (
                <div className="ml-4">
                  <button
                    onClick={() => {
                      import("../utils/auth").then((m) => m.logoutAdmin());
                    }}
                    className="btn-sm bg-red-500 text-white"
                  >
                    {t("nav.logoutAdmin", "Logout Admin")}
                  </button>
                </div>
              )}

              {/* User logout button (shows when a user is present) */}
              {(userProfile.name || userProfile.email) && (
                <div className="ml-2">
                  <button
                    onClick={() => setConfirmUserLogoutOpen(true)}
                    className="btn-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    {t("nav.logout", "Logout")}
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* User Profile Icon - Mobile */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              {userProfile.profilePhoto ? (
                <img
                  src={userProfile.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {userProfile.initials}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Banner prompting subscription when user has no active plan */}
        {!hasSubscription && (
          <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-700" />
                <span className="font-medium">
                  No active subscription — some features may be unavailable.
                </span>
              </div>
              <div>
                <Link
                  to="/profile"
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                >
                  Choose a plan
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Freeze Account Bar for Super Admin (admin routes only) */}
        {showAdminControls && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-t border-red-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Account Freeze Management
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    {frozenUsersCount} account
                    {frozenUsersCount !== 1 ? "s" : ""} frozen
                  </span>
                </div>
                <Link
                  to="/superadmindashboard"
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Manage Freezes
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Global pending payment bar (shows for any user/store) */}
        <PendingPaymentBar />

        {/* Pending payment modal */}
        <PendingPaymentModal
          open={showPendingModal}
          onClose={() => setShowPendingModal(false)}
        />

        {/* Confirm Modal for user logout */}
        <ConfirmModal
          open={confirmUserLogoutOpen}
          title="Logout"
          message="Are you sure you want to logout?"
          confirmLabel="Logout"
          cancelLabel="Cancel"
          onConfirm={performUserLogout}
          onCancel={() => setConfirmUserLogoutOpen(false)}
        />

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      pathname === item.path
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge === "AI" && (
                      <span className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Sparkles className="w-3 h-3" />
                        AI
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* User Profile Info - Mobile */}
              <div className="px-4 py-3 border-t border-gray-200 mt-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {userProfile.profilePhoto ? (
                      <img
                        src={userProfile.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {userProfile.initials}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {userProfile.name}
                    </p>
                    <p className="text-sm text-gray-500">{userProfile.email}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {pendingExists && (
                      <button
                        onClick={() => {
                          setShowPendingModal(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="px-3 py-2 bg-yellow-500 text-white rounded"
                      >
                        Resume Payment
                      </button>
                    )}
                    {(userProfile.name || userProfile.email) && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setConfirmUserLogoutOpen(true);
                        }}
                        className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
