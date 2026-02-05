import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";

const PrivacyPolicy = () => {
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
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
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
                <Lock className="text-indigo-600" size={24} />
                <span className="font-semibold text-indigo-800">Data Security</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Eye className="text-purple-600" size={24} />
                <span className="font-semibold text-purple-800">Transparency</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Database className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">Your Rights</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Information We Collect
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Name, email address, and contact information</li>
                <li>Business information for store registration</li>
                <li>Payment information for subscription services</li>
                <li>Usage data and analytics from our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                How We Use Your Information
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Communicate with you about products, services, and promotions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Information Sharing
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                Data Security
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Contact Us
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:info@tsaritservices.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  info@tsaritservices.com
                </a>{" "}
                or call{" "}
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

export default PrivacyPolicy;
