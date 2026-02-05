import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle } from "lucide-react";

const PaymentPolicy = () => {
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
              <CreditCard size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Payment Policy</h1>
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
                <span className="font-semibold text-indigo-800">Secure Payments</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Shield className="text-purple-600" size={24} />
                <span className="font-semibold text-purple-800">Data Protection</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Clock className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">Instant Processing</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Accepted Payment Methods
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We accept various secure payment methods to provide you with convenient and safe transaction options.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Credit and Debit Cards (Visa, MasterCard, American Express)</li>
                <li>UPI (Unified Payments Interface)</li>
                <li>Digital Wallets (Paytm, PhonePe, Google Pay)</li>
                <li>Net Banking</li>
                <li>Cash on Delivery (for select locations)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                Payment Security
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Your payment information is protected using industry-standard encryption and security measures.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>SSL/TLS encryption for all transactions</li>
                <li>PCI DSS compliant payment processing</li>
                <li>Secure payment gateways</li>
                <li>No storage of complete card details</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Payment Processing
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Payments are processed immediately upon order confirmation. Subscription payments are billed according to your selected plan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                Failed Payments
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                If a payment fails, you will be notified and given an opportunity to retry with alternative payment methods.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Contact Information
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                For payment-related inquiries, contact us at{" "}
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

export default PaymentPolicy;
