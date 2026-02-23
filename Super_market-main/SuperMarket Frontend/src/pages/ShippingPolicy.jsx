import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, MapPin, Clock, Package } from "lucide-react";

const ShippingPolicy = () => {
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
              <Truck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Shipping Policy</h1>
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
                <Truck className="text-indigo-600" size={24} />
                <span className="font-semibold text-indigo-800">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <MapPin className="text-purple-600" size={24} />
                <span className="font-semibold text-purple-800">Wide Coverage</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Clock className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">Track Orders</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Shipping Coverage
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                We provide shipping services across India with reliable delivery partners to ensure your orders reach you safely and on time.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Pan-India delivery coverage</li>
                <li>Major metropolitan cities: 1-2 business days</li>
                <li>Tier 2 cities: 2-3 business days</li>
                <li>Rural areas: 3-5 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                Shipping Charges
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Shipping charges are calculated based on order value, weight, and delivery location.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Orders above ₹500: Free shipping</li>
                <li>Orders below ₹500: ₹50 shipping charge</li>
                <li>Bulk orders: Custom pricing available</li>
                <li>Express delivery: Additional charges apply</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Order Tracking
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Track your orders in real-time using the tracking number provided in your shipment confirmation email.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                Damaged or Lost Shipments
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                In case of damaged or lost shipments, please contact our customer support within 48 hours of delivery.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Contact Information
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                For shipping-related inquiries, contact us at{" "}
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

export default ShippingPolicy;
