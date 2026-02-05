import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  BarChart2,
  DollarSign,
  FileText,
  Settings,
  Home,
  Shield,
  Mail,
  Zap,
  Ticket,
  Briefcase,
  FileCheck,
  TrendingUp,
} from "lucide-react";

const SuperAdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: "Overview", icon: Home, path: "/superadmin/overview" },
    { name: "Users", icon: Users, path: "/superadmin/users" },
    { name: "Subscriptions", icon: DollarSign, path: "/superadmin/subscriptions" },
    { name: "Reports", icon: TrendingUp, path: "/superadmin/reports" },
    { name: "Audit Logs", icon: FileText, path: "/superadmin/audit-logs" },
    { name: "Support Tickets", icon: Ticket, path: "/superadmin/support-tickets" },
    { name: "Email Management", icon: Mail, path: "/superadmin/email-management" },
    { name: "AI Controls", icon: Zap, path: "/superadmin/ai-controls" },
    { name: "Jobs", icon: Briefcase, path: "/superadmin/jobs" },
    { name: "Onboarding", icon: FileCheck, path: "/superadmin/onboarding" },
    { name: "System Settings", icon: Settings, path: "/superadmin/system-settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 topbar-elevate">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Shield
                className="text-indigo-600"
                size={24}
                aria-hidden="true"
              />
              <span className="text-lg font-bold text-gray-800">
                Super Admin
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {navigation.find((item) => isActive(item.path))?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 whitespace-nowrap">
            <div className="hidden sm:block text-sm text-gray-500">
              Welcome, Super Admin
            </div>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2">
        <nav className="flex items-center justify-center space-x-1 overflow-x-auto">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive(item.path)
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon size={16} aria-hidden="true" />
              <span className="hidden sm:inline">{item.name}</span>
              <span className="sm:hidden">{item.name.split(" ")[0]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;
