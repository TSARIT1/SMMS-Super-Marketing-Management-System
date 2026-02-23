import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isUserLoggedIn } from "../utils/auth";
import api from "../utils/api";

export default function SubscriptionGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    
    // First check if user is logged in
    if (!isUserLoggedIn()) {
      setChecking(false);
      return;
    }

    // include userId header when a user or admin is available in localStorage
    let headers = {};
    try {
      const adminRaw = localStorage.getItem("admin");
      if (adminRaw) {
        const a = JSON.parse(adminRaw);
        if (a && a.id) headers["userId"] = a.id;
      }
    } catch (err) {
      console.debug("Failed to parse admin from localStorage", err);
    }

    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.id) headers["userId"] = headers["userId"] || u.id;
      }
    } catch (err) {
      console.debug("Failed to parse user from localStorage", err);
    }

    api
      .get("/subscription/check-active", { headers })
      .then((res) => {
        if (!mounted) return;
        setIsActive(Boolean(res.data?.isActive));
      })
      .catch((err) => {
        console.error("Subscription check failed", err);
        setIsActive(false);
      })
      .finally(() => mounted && setChecking(false));

    return () => {
      mounted = false;
    };
  }, []);

  // Check authentication first
  if (!isUserLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  if (!isActive)
    return (
      <Navigate
        to="/profile"
        state={{ showPlans: true, from: location.pathname }}
        replace
      />
    );
  return children;
}
