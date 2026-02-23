import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, CreditCard, Clock, CheckCircle } from "lucide-react";

const RefundPolicy = () => {
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
              <RefreshCw size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Refund Policy</h1>
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
                <CreditCard className="text-indigo-600" size={24} />
                <span className="font-semibold text-indigo-800">30-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Clock className="text-purple-600" size={24} />
                <span className="font-semibold text-purple-800">Quick Processing</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <CheckCircle className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">Hassle-Free</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Subscription Refunds
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We offer a 30-day money-back guarantee for new subscriptions. If you're not satisfied within the first 30 days, you can request a full refund.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                Refund Process
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                To request a refund, contact our support team at{" "}
                <a href="mailto:info@tsaritservices.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  info@tsaritservices.com
                </a>{" "}
                or call{" "}
                <a href="tel:+919491301258" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  +91 9491301258
                </a>{" "}
                within the eligible period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Refund Timeline
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Approved refunds are processed within 5-7 business days and will be credited to your original payment method.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                Non-Refundable Items
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Custom development services</li>
                <li>Third-party integrations</li>
                <li>Training sessions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Contact Us
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                For refund requests or questions, reach out to our support team at{" "}
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

export default RefundPolicy;
