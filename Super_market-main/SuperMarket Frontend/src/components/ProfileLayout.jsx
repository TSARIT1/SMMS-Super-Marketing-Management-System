import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User, MapPin, Clock, Sparkles, Percent, CreditCard,
  Layers, ChevronRight, Building, Store, Settings,
  LogOut, ChevronDown, Menu, X, Headphones, HardDrive
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../utils/api";

const profileSections = [
  {
    id: "overview",
    label: "Overview",
    icon: User,
    path: "/profile/overview",
    desc: "Store info & settings",
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "contact",
    label: "Contact",
    icon: MapPin,
    path: "/profile/contact",
    desc: "Address & contact details",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "hours",
    label: "Business Hours",
    icon: Clock,
    path: "/profile/hours",
    desc: "Operating schedule",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "ai",
    label: "AI Configuration",
    icon: Sparkles,
    path: "/profile/ai",
    desc: "AI & automation settings",
    color: "from-purple-500 to-violet-600"
  },
  {
    id: "discounts",
    label: "Discounts",
    icon: Percent,
    path: "/profile/discounts",
    desc: "Offers & promotions",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: Layers,
    path: "/profile/subscription",
    desc: "Plan & billing",
    color: "from-amber-500 to-yellow-600"
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    path: "/profile/payment",
    desc: "Bank & payment methods",
    color: "from-pink-500 to-rose-600"
  },
  {
    id: "support",
    label: "Support",
    icon: Headphones,
    path: "/profile/support",
    desc: "Help & support tickets",
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: "devices",
    label: "Devices",
    icon: HardDrive,
    path: "/profile/devices",
    desc: "Printers, scanners & more",
    color: "from-slate-500 to-gray-600"
  },
];

const ProfileLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const adminRaw = localStorage.getItem("admin");
      if (adminRaw) {
        const admin = JSON.parse(adminRaw);
        return {
          name: admin?.name || admin?.shop_name || "Admin User",
          email: admin?.email || "",
          role: "Admin"
        };
      }
    } catch { /* ignore */ }
    try {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        return {
          name: user?.name || user?.shop_name || "User",
          email: user?.email || "",
          role: "User"
        };
      }
    } catch { /* ignore */ }
    return { name: "Guest", email: "", role: "Guest" };
  };

  const user = getUserInfo();

  // Fetch profile photo from backend
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user.email) return;
      try {
        const resp = await api.get("/profile", { params: { email: user.email } });
        if (resp.data?.profile_photo) {
          setProfilePhoto(resp.data.profile_photo);
        }
      } catch (err) {
        console.debug("Failed to fetch profile photo:", err);
      }
    };
    fetchProfilePhoto();

    // Listen for profile updates
    const handleProfileUpdate = () => fetchProfilePhoto();
    window.addEventListener("profile:update", handleProfileUpdate);
    return () => window.removeEventListener("profile:update", handleProfileUpdate);
  }, [user.email]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                Profile Settings
              </h1>
              <p className="text-gray-500 mt-1 ml-1">Manage your store settings and preferences</p>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Navigation */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-80
              transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 transition-transform duration-300 ease-in-out
              lg:block
            `}
          >
            <div className="h-full lg:h-auto bg-white rounded-2xl shadow-xl overflow-hidden lg:sticky lg:top-24">
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden">
                    {profilePhoto ? (
                      <img 
                        src={profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn("Failed to load profile photo:", profilePhoto);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Store className={`w-7 h-7 ${profilePhoto ? 'hidden' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                    <p className="text-blue-100 text-sm truncate">{user.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 mt-1">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="p-3">
                <div className="space-y-1">
                  {profileSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = location.pathname === section.path;
                    
                    return (
                      <Link
                        key={section.id}
                        to={section.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                          ${isActive
                            ? "bg-gradient-to-r " + section.color + " text-white shadow-lg shadow-blue-500/25"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg transition-all duration-200
                          ${isActive
                            ? "bg-white/20"
                            : "bg-gray-100 group-hover:bg-gray-200"
                          }
                        `}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium block">{section.label}</span>
                          <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
                            {section.desc}
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`
                            transition-transform duration-200
                            ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}
                          `}
                        />
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-gray-100" />

                {/* Quick Actions */}
                <div className="px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                      <LogOut size={18} />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfileLayout;