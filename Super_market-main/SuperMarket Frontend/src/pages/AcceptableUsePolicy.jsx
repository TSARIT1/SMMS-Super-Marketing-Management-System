import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, X, AlertTriangle, Users } from "lucide-react";

const AcceptableUsePolicy = () => {
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
              <CheckCircle size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Acceptable Use Policy</h1>
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
                <CheckCircle className="text-indigo-600" size={24} />
                <span className="font-semibold text-indigo-800">Permitted Use</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                <X className="text-red-600" size={24} />
                <span className="font-semibold text-red-800">Prohibited Activities</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Users className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">User Guidelines</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Permitted Use
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                You may use TSAR IT SMMS only for lawful purposes and in accordance with these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">2</span>
                Prohibited Activities
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Transmit harmful code or malware</li>
                <li>Interfere with the service's operation</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Content Guidelines
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                All data entered into the system must comply with applicable laws and regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                Monitoring
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We reserve the right to monitor usage to ensure compliance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Contact Information
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                For questions about acceptable use, contact us at{" "}
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

export default AcceptableUsePolicy;
