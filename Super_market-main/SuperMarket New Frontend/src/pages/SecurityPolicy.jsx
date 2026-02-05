import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle } from "lucide-react";

const SecurityPolicy = () => {
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
              <h1 className="text-3xl font-bold text-gray-800">Security Policy</h1>
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
                <span className="font-semibold text-indigo-800">Data Protection</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Eye className="text-purple-600" size={24} />
                <span className="font-semibold text-purple-800">Monitoring</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <AlertTriangle className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">Incident Response</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Security Commitment
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We are committed to maintaining the security and integrity of our systems and your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                Security Measures
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Multi-factor authentication for administrative access</li>
                <li>Regular security updates and patches</li>
                <li>Access controls and role-based permissions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Incident Response
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We have established procedures for responding to security incidents and will notify affected users promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                User Responsibilities
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Users are responsible for maintaining the security of their accounts and reporting any security concerns.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Contact Information
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                For security-related concerns, contact us at{" "}
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

export default SecurityPolicy;
