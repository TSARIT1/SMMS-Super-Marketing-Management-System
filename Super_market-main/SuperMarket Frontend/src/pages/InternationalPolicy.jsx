import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Plane, Shield, AlertTriangle } from "lucide-react";

const InternationalPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-5 py-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">International Policy</h1>
              <p className="text-gray-600 mt-1">Last updated: January 1, 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                <Globe className="text-indigo-600" size={24} />
                <span className="font-semibold text-indigo-800">Global Reach</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Plane className="text-purple-600" size={24} />
                <span className="font-semibold text-purple-800">International Shipping</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Shield className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">Compliance</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Service Availability
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                TSAR IT SMMS is currently available for users in India. We are working on expanding our services to international markets.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                International Shipping
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                While our primary focus is on the Indian market, we may offer international shipping for select products and services in the future.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Data Protection Compliance
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We comply with Indian data protection laws and are preparing for international standards including GDPR compliance for future expansion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                Currency and Payments
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                All transactions are currently processed in Indian Rupees (INR). International payment methods will be supported as we expand globally.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Future Expansion
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We are committed to expanding our services internationally. Stay tuned for updates on our global availability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">6</span>
                Contact Information
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                For international inquiries, contact us at{" "}
                <a href="mailto:info@tsaritservices.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  info@tsaritservices.com
                </a>{" "}
                or{" "}
                <a href="tel:+919491301258" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  +91 9491301258
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalPolicy;
