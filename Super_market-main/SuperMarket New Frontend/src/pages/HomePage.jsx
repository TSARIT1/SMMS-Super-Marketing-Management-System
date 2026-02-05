import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ShoppingCart,
  CreditCard,
  Server,
  BarChart2,
  Truck,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  X,
  Menu,
  Sun,
  Moon,
  Cpu,
  Zap,
  Award,
  MessageSquare,
  Search,
  Store,
  Package,
  Shield,
  Clock,
  TrendingUp,
  Heart,
  Star,
  ChevronRight,
  Play,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HERO_IMAGE =
  "https://s3-alpha.figma.com/hub/file/5756596760/4a94ee92-e636-45d7-bdc2-ee4161a55553-cover.png";
const COUNTER_IMAGE =
  "https://i.pinimg.com/474x/0e/cc/bf/0eccbfe09300ca7e61a634419c9acfdd.jpg";
const STORE_INTERIOR =
  "https://media.istockphoto.com/id/1142105235/photo/view-of-supermarket-interior-snacks-section.jpg?s=612x612&w=0&k=20&c=mIvBBopdc03XwG9rW1jseko-OqtBEH3tREojYVSgsy8=";
const DASHBOARD_IMAGE =
  "https://cdn.dribbble.com/userupload/33908188/file/original-3cd7212862e3e1061aa8ffdd4955e617.png?resize=752x&vertical=center";

function Navbar() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  return (
    <header className="w-full bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Store className="text-white" size={24} />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TSAR IT SMMS
              </div>
              <div className="text-xs text-gray-500 -mt-0.5">
                Super Market Management System
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <a href="#main" className="hover:text-indigo-600 transition-colors">
            Home
          </a>
          <a href="#about" className="hover:text-indigo-600 transition-colors">
            About
          </a>
          <a
            href="#features"
            className="hover:text-indigo-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hover:text-indigo-600 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#testimonials"
            className="hover:text-indigo-600 transition-colors"
          >
            Testimonials
          </a>
          <a
            href="#contact"
            className="hover:text-indigo-600 transition-colors"
          >
            Contact
          </a>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <LogIn size={20} />
            Login
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-full bg-white border-t shadow-lg md:hidden">
            <div className="px-4 py-6 space-y-4">
              <a href="#main" className="block py-2 hover:text-indigo-600">
                Home
              </a>
              <a href="#about" className="block py-2 hover:text-indigo-600">
                About
              </a>
              <a href="#features" className="block py-2 hover:text-indigo-600">
                Features
              </a>
              <a href="#pricing" className="block py-2 hover:text-indigo-600">
                Pricing
              </a>
              <a href="#contact" className="block py-2 hover:text-indigo-600">
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm font-medium border border-indigo-100">
      <Zap size={16} className="text-indigo-600" /> {children}
    </span>
  );
}

function FeatureCard({ icon, title, desc, color = "indigo" }) {
  const Icon = icon;
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-800 mb-2">{title}</h4>
          <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("light");
  const [showDemo, setShowDemo] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    storeName: "",
  });

  const [landing, setLanding] = useState(null); // loaded from /api/landing (public)


  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.background = "#0f172a";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.background = "";
    }
  }, [mode]);

  // Demo SSE: open EventSource when demo modal is visible
  const [demoStats, setDemoStats] = useState({ todaySales: 0, pendingOrders: 0, activeStores: 0 });
  const demoSourceRef = useRef(null);

  useEffect(() => {
    if (!showDemo) {
      if (demoSourceRef.current) {
        demoSourceRef.current.close();
        demoSourceRef.current = null;
      }
      return;
    }

    const src = new EventSource('/api/demo/stream');
    demoSourceRef.current = src;

    src.addEventListener('demo-stats', (e) => {
      try {
        const data = JSON.parse(e.data);
        setDemoStats(data);
      } catch (err) {
        console.error('Invalid demo event', err);
      }
    });

    src.onerror = (err) => {
      console.error('EventSource error', err);
      src.close();
    };

    return () => {
      if (demoSourceRef.current) {
        demoSourceRef.current.close();
        demoSourceRef.current = null;
      }
    };
  }, [showDemo]);

  // Load public landing content
  useEffect(() => {
    let cancelled = false;
    axios
      .get('/api/landing')
      .then((res) => {
        if (!cancelled && res?.data) {
          setLanding(res.data);
        }
      })
      .catch((err) => {
        console.error('Could not load landing content', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);


  const submitContact = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message,
        storeName: contactForm.storeName || null,
      };
      await axios.post('/api/leads', payload);
      toast.success(`Thanks ${contactForm.name}! We'll contact you shortly.`);
      setContactForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Please try again later.');
    }
  };

  return (
    <div
      className={`min-h-screen text-gray-800 ${mode === "dark" ? "dark" : ""}`}
    >
      <Navbar mode={mode} setMode={setMode} />
      <Toaster position="top-right" />

      <main id="main" className="pt-8">
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-20">
            <div className="space-y-6 z-10">
              <Badge>{landing?.heroSubtitle || "Complete Retail Management Solution"}</Badge>
              <h1 className="text-5xl md:text-6xl font-black leading-tight">
                {landing?.heroTitle ? (
                  <span dangerouslySetInnerHTML={{ __html: landing.heroTitle }} />
                ) : (
                  <>
                    Transform Your Retail Business with{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      TSAR IT SMMS
                    </span>
                  </>
                )}
              </h1>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed">
                {landing?.heroSubtitle || "Advanced billing, inventory management, and analytics platform designed for modern retailers. Streamline operations, boost sales, and delight customers."}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    if (landing?.ctaPrimaryUrl && landing?.ctaPrimaryUrl !== '/contact') {
                      window.location.href = landing.ctaPrimaryUrl;
                    } else {
                      setShowDemo(true);
                    }
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Play size={20} className="fill-white" />
                  {landing?.ctaPrimaryText || 'Watch Demo'}
                </button>
                <a
                  href={landing?.ctaSecondaryUrl || '#pricing'}
                  className="border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300"
                >
                  <CreditCard size={20} />
                  {landing?.ctaSecondaryText || 'View Pricing'}
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">99.9% Uptime</div>
                    <div className="text-sm text-gray-500">
                      Reliable cloud infrastructure
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg border border-purple-100 text-purple-600 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">GST Ready</div>
                    <div className="text-sm text-gray-500">
                      Compliant billing system
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src={landing?.heroImageUrl || HERO_IMAGE}
                  alt="Supermarket billing"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-indigo-600 font-medium">
                              Today Sales
                            </div>
                            <div className="text-2xl font-bold text-gray-800">
                              ₹ 1,25,400
                            </div>
                          </div>
                          <BarChart2 size={28} className="text-indigo-600" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-green-600 font-medium">
                              Pending Orders
                            </div>
                            <div className="text-2xl font-bold text-gray-800">
                              12
                            </div>
                          </div>
                          <Truck size={28} className="text-green-600" />
                        </div>
                      </div>

                      <div className="col-span-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-blue-600 font-medium">
                              Active Stores
                            </div>
                            <div className="text-xl font-bold text-gray-800">
                              4 Locations
                            </div>
                          </div>
                          <Users size={28} className="text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge>About TSAR IT SMMS</Badge>
              <h2 className="text-4xl font-bold text-gray-800">
                Revolutionizing Retail Management
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                TSAR IT SMMS (Super Market Management System) is built for modern supermarkets and retail chains. Our
                platform combines intuitive point-of-sale, intelligent inventory
                tracking, supplier management, customer loyalty programs, and
                powerful analytics — all in a beautiful interface your team will
                love.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      Lightning Fast Performance
                    </div>
                    <div className="text-gray-600">
                      Optimized to run smoothly on any device, from tablets to
                      desktop systems.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <Server size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      Cloud Powered
                    </div>
                    <div className="text-gray-600">
                      Real-time sync across all your stores with automatic cloud
                      backups.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="#features"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Explore Features
                </a>
                <a
                  href="#contact"
                  className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  Contact Sales
                </a>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={STORE_INTERIOR}
                alt="Store interior"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50"
        >
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-16">
              <Badge>Powerful Features</Badge>
              <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Comprehensive tools designed to streamline your retail
                operations and drive growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {landing && landing.featuresJson ? (
                (() => {
                  try {
                    const features = JSON.parse(landing.featuresJson);
                    return features.map((f, idx) => (
                      <FeatureCard
                        key={idx}
                        icon={Package}
                        title={f.title}
                        desc={f.desc}
                        color={f.color || (idx % 2 === 0 ? 'indigo' : 'purple')}
                      />
                    ));
                  } catch (err) {
                    console.error('Invalid features JSON', err);
                    return null;
                  }
                })()
              ) : (
                <>
                  <FeatureCard
                    icon={CreditCard}
                    title="Smart Billing"
                    desc="Fast barcode scanning, quick product search, and multi-payment handling with split payment support."
                    color="indigo"
                  />
                  <FeatureCard
                    icon={BarChart2}
                    title="Advanced Analytics"
                    desc="Real-time dashboards for sales trends, margin reports, and easy export to multiple formats."
                    color="purple"
                  />
                  <FeatureCard
                    icon={Package}
                    title="Inventory Management"
                    desc="Track stock levels, manage suppliers, auto-generate reorder suggestions and expiry alerts."
                    color="blue"
                  />
                  <FeatureCard
                    icon={Truck}
                    title="Multi-Store Sync"
                    desc="Centralized inventory and sales management across all your locations in real-time."
                    color="teal"
                  />
                  <FeatureCard
                    icon={Users}
                    title="Role Management"
                    desc="Create cashier/admin roles with granular permissions and complete audit trails."
                    color="indigo"
                  />
                  <FeatureCard
                    icon={FileText}
                    title="GST Compliance"
                    desc="Automated invoice formats, tax computation, and e-invoice support for full compliance."
                    color="purple"
                  />
                </>
              )}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge>Why Choose TSAR IT SMMS</Badge>
              <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-6">
                Built for Retail Success
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-indigo-600 pt-1">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      Reduce Queue Time
                    </div>
                    <div className="text-gray-600">
                      Optimized checkout flow with one-click repeat items and
                      barcode shortcuts.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-indigo-600 pt-1">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      Data-Driven Decisions
                    </div>
                    <div className="text-gray-600">
                      Make informed purchasing decisions using AI-powered demand
                      forecasts.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-indigo-600 pt-1">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      Seamless Payments
                    </div>
                    <div className="text-gray-600">
                      Accept UPI, cards, and digital wallets with integrated QR
                      code support.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <div className="text-white/80">Average Performance</div>
                    <div className="text-2xl font-bold">18s Checkout Time</div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/80 text-sm">
                    Top Selling Category
                  </div>
                  <div className="font-bold text-lg">Personal Care</div>
                  <div className="text-white/60 text-xs mt-2">
                    Suggested reorder in 6 days
                  </div>
                </div>

                <div className="text-white/80 text-sm">
                  <strong>24/7 Support:</strong> Dedicated chat, phone support,
                  and onsite setup for enterprise customers.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="py-20 bg-gradient-to-br from-gray-50 to-purple-50"
        >
          <div className="max-w-7xl mx-auto px-5 text-center">
            <Badge>Simple Pricing</Badge>
            <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-4">
              Plans for Every Business Size
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              No hidden fees. Start small and scale as your business grows.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/plans")}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View all plans
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mt-12 grid md:grid-cols-5 gap-6 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-lg font-bold text-gray-800">Free</div>
                <div className="text-3xl font-black text-gray-800 mt-4">
                  ₹0{" "}
                  <span className="text-sm font-medium text-gray-500">
                    /5 days
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> 5 Days
                    Trial
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> Basic
                    Features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    Limited Support
                  </li>
                </ul>
                <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-xl font-semibold mt-6 hover:bg-gray-200 transition-colors text-sm">
                  Start Free Trial
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-indigo-500 shadow-2xl transform scale-105 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-800">Silver</div>
                <div className="text-3xl font-black text-gray-800 mt-4">
                  ₹6,000{" "}
                  <span className="text-sm font-medium text-gray-500">
                    /6 months
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> 180
                    Days
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    Unlimited Features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    Priority Support
                  </li>
                </ul>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold mt-6 hover:bg-indigo-700 transition-colors text-sm">
                  Choose Silver
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-lg font-bold text-gray-800">Platinum</div>
                <div className="text-3xl font-black text-gray-800 mt-4">
                  ₹12,000{" "}
                  <span className="text-sm font-medium text-gray-500">
                    /1 year
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> 365
                    Days
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    Unlimited Features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    Premium Support
                  </li>
                </ul>
                <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-xl font-semibold mt-6 hover:bg-gray-200 transition-colors text-sm">
                  Choose Platinum
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-lg font-bold text-gray-800">Gold</div>
                <div className="text-3xl font-black text-gray-800 mt-4">
                  ₹25,000{" "}
                  <span className="text-sm font-medium text-gray-500">
                    /2 years
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> 730
                    Days
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    Unlimited Features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> VIP
                    Support
                  </li>
                </ul>
                <button className="w-full bg-yellow-500 text-white py-2 rounded-xl font-semibold mt-6 hover:bg-yellow-600 transition-colors text-sm">
                  Choose Gold
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-lg font-bold text-gray-800">Custom</div>
                <div className="text-3xl font-black text-gray-800 mt-4">
                  Contact Us
                </div>
                <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> Custom
                    Duration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> Custom
                    Features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    Dedicated Support
                  </li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-2 rounded-xl font-semibold mt-6 hover:bg-purple-700 transition-colors text-sm">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge>Beautiful Interface</Badge>
              <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-4">
                Designed for Efficiency
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Clean, intuitive interfaces for both cashiers and managers with
                responsive design and keyboard shortcuts.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-indigo-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      Custom Invoice Designer
                    </div>
                    <div className="text-gray-600">
                      Create professional GST-compliant invoices with your
                      branding.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-indigo-600">
                    <Search size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Smart Search</div>
                    <div className="text-gray-600">
                      Instant lookup by barcode, name, SKU, or category.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={DASHBOARD_IMAGE}
                alt="Dashboard"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50"
        >
          <div className="max-w-7xl mx-auto px-5 text-center">
            <Badge>Success Stories</Badge>
            <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-4">
              Trusted by Retailers Nationwide
            </h2>

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-gray-600 text-lg leading-relaxed">
                  "TSAR IT SMMS reduced our billing time by 40%. The support team was
                  incredibly helpful during our transition."
                </div>
                <div className="mt-6 font-bold text-gray-800">
                  — Ramesh Kumar, Grocery Owner
                </div>
                <div className="flex justify-center mt-2">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-gray-600 text-lg leading-relaxed">
                  "Inventory tracking and expiry alerts have saved us thousands
                  in food wastage. Game changer!"
                </div>
                <div className="mt-6 font-bold text-gray-800">
                  — Priya Sharma, Chain Manager
                </div>
                <div className="flex justify-center mt-2">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-gray-600 text-lg leading-relaxed">
                  "Integration with our payment partners was seamless. Customers
                  love the QR checkout experience."
                </div>
                <div className="mt-6 font-bold text-gray-800">
                  — Ahmed Khan, Superstore Owner
                </div>
                <div className="flex justify-center mt-2">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <Star className="text-yellow-400 fill-current" size={16} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-start">
            <div>
              <Badge>Get In Touch</Badge>
              <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-6">
                Let's Transform Your Business
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Request a demo, ask about pricing, or get support from our
                expert team.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Email</div>
                    <div className="text-gray-600">info@tsaritservices.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Support Phone</div>
                    <div className="text-gray-600">+91 9491301258</div>
                  </div>
                  <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-indigo-600 mb-2">
                      <Phone size={24} />
                    </div>
                    <div className="font-bold text-gray-800">Support Phone (Alt)</div>
                    <div className="text-gray-600">+91 8142616767</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Office</div>
                    <div className="text-gray-600">Chennai, India</div>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={submitContact}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                  placeholder="your@email.com"
                  type="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                  placeholder="+91 9491301258"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 h-32"
                  placeholder="How can we help your business?"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex-1"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => alert("We'll call you at +91 9491301258")}
                  className="border-2 border-indigo-200 text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Request Callback
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="py-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-white/80 text-sm">Ready to Get Started?</div>
              <div className="text-2xl font-bold">
                Transform Your Retail Business Today
              </div>
            </div>
            <div className="flex gap-4">
              <a
                href="#pricing"
                className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="#contact"
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>



        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Store className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-bold text-xl">TSAR-IT</div>
                  <div className="text-xs text-gray-400">
                    Smart Retail Solutions
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced retail management platform helping businesses
                streamline operations and drive growth.
              </p>
            </div>

            <div>
              <div className="font-semibold text-lg mb-4">Product</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-white transition-colors"
                  >
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-lg mb-4">Company</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-lg mb-4">Policies</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-of-service"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/refund-policy"
                    className="hover:text-white transition-colors"
                  >
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/cookie-policy"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/acceptable-use-policy"
                    className="hover:text-white transition-colors"
                  >
                    Acceptable Use Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/security-policy"
                    className="hover:text-white transition-colors"
                  >
                    Security Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-lg mb-4">Contact Support</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>info@tsaritservices.com</div>
                <div>+91 9491301258 / +91 8142616767</div>
              </div>
              <button
                onClick={() => navigate("/admin/login")}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mt-4"
              >
                <Shield size={16} />
                Admin Login
              </button>
              <div className="flex gap-3 mt-4">
                <button className="w-10 h-10 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  FB
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  LI
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  TW
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-5 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} TSAR IT SMMS — Super Market Management System. All
            rights reserved.
          </div>
        </footer>
      </main>

      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Play size={24} />
                </div>
                <div>
                  <div className="font-bold text-xl">Request Demo</div>
                  <div className="text-gray-500">See TSAR IT SMMS in action</div>
                </div>
              </div>
              <button
                onClick={() => setShowDemo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-8 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  What You'll See
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-500" /> POS
                    checkout flow & keyboard shortcuts
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-500" />{" "}
                    Inventory management & expiry alerts
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-500" />{" "}
                    Reporting dashboard & GST invoices
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-500" />{" "}
                    Payment QR integration
                  </li>
                </ul>

                <div className="mt-8 flex gap-4">
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                    Book Demo
                  </button>
                  <button
                    onClick={() => alert("Starting instant demo...")}
                    className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    Instant Demo
                  </button>
                </div>
              </div>

              <div>
                <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-500">Today Sales</div>
                      <div className="text-lg font-bold text-gray-800">₹ {demoStats.todaySales.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pending Orders</div>
                      <div className="text-lg font-bold text-gray-800">{demoStats.pendingOrders}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Active Stores</div>
                      <div className="text-lg font-bold text-gray-800">{demoStats.activeStores}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                  <img
                    src={COUNTER_IMAGE}
                    alt="demo"
                    className="w-full h-36 object-cover"
                  />
                </div>

                <div className="mt-3 text-sm text-gray-500 text-center">
                  Live demo preview (updates every 2s)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
