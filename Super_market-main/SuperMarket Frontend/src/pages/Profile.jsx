import React from "react";
import { Link } from "react-router-dom";
import {
  User, MapPin, Clock, Sparkles, Percent, CreditCard,
  Layers, ChevronRight, Store, Building, ArrowRight,
  Star, TrendingUp, Shield, Zap
} from "lucide-react";

const profileSections = [
  {
    id: "overview",
    label: "Store Overview",
    icon: User,
    path: "/profile/overview",
    desc: "Manage your store information, categories, and basic settings",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    iconBg: "bg-blue-100",
    features: ["Shop Name", "Categories", "Tagline"]
  },
  {
    id: "contact",
    label: "Contact Details",
    icon: MapPin,
    path: "/profile/contact",
    desc: "Update your store address, phone, email, and website",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    features: ["Address", "Phone", "Email"]
  },
  {
    id: "hours",
    label: "Business Hours",
    icon: Clock,
    path: "/profile/hours",
    desc: "Set your operating hours and working days",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    iconBg: "bg-green-100",
    features: ["Open/Close", "Working Days"]
  },
  {
    id: "ai",
    label: "AI Configuration",
    icon: Sparkles,
    path: "/profile/ai",
    desc: "Configure AI features, automation, and billing settings",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    iconBg: "bg-purple-100",
    features: ["AI Mode", "Automation", "Billing"]
  },
  {
    id: "discounts",
    label: "Discounts & Offers",
    icon: Percent,
    path: "/profile/discounts",
    desc: "Create and manage discount offers and loyalty programs",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    iconBg: "bg-orange-100",
    features: ["Offers", "Loyalty Points", "Referrals"]
  },
  {
    id: "subscription",
    label: "Subscription Plan",
    icon: Layers,
    path: "/profile/subscription",
    desc: "View and manage your subscription plan and billing",
    color: "from-amber-500 to-yellow-600",
    bgColor: "bg-amber-50",
    iconBg: "bg-amber-100",
    features: ["Plan Details", "Upgrade", "Billing"]
  },
  {
    id: "payment",
    label: "Payment Methods",
    icon: CreditCard,
    path: "/profile/payment",
    desc: "Configure bank details and accepted payment methods",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    iconBg: "bg-pink-100",
    features: ["Bank Details", "UPI", "Payment Methods"]
  },
];

const quickStats = [
  { label: "Profile Completion", value: "85%", icon: TrendingUp, color: "text-green-600" },
  { label: "Active Features", value: "12", icon: Zap, color: "text-blue-600" },
  { label: "Security Score", value: "High", icon: Shield, color: "text-purple-600" },
];

const Profile = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Store className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">Welcome to Profile Settings</h2>
              </div>
              <p className="text-blue-100 text-lg max-w-xl">
                Manage your store information, configure AI features, set up payment methods, and customize your business settings all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/profile/overview"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <User size={18} />
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">{stat.label}</p>
                    <p className="text-white font-semibold text-lg">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {profileSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.id}
              to={section.path}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Border Top */}
              <div className={`h-1.5 bg-gradient-to-r ${section.color}`} />
              
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${section.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r ${section.color}`} style={{ stroke: 'url(#gradient)' }} />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: section.color.includes('blue') ? '#3b82f6' : section.color.includes('emerald') ? '#10b981' : section.color.includes('green') ? '#22c55e' : section.color.includes('purple') ? '#8b5cf6' : section.color.includes('orange') ? '#f97316' : section.color.includes('amber') ? '#f59e0b' : '#ec4899' }} />
                          <stop offset="100%" style={{ stopColor: section.color.includes('blue') ? '#4f46e5' : section.color.includes('emerald') ? '#14b8a6' : section.color.includes('green') ? '#10b981' : section.color.includes('purple') ? '#7c3aed' : section.color.includes('orange') ? '#ef4444' : section.color.includes('amber') ? '#eab308' : '#f43f5e' }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {section.label}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {section.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {section.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${section.bgColor} text-gray-600`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <p className="text-gray-500 text-sm">Get support from our team or browse documentation</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/support"
              className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Contact Support
            </Link>
            <Link
              to="/profile/overview"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;