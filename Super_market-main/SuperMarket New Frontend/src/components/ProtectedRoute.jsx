import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isUserLoggedIn, isAdminLoggedIn } from "../utils/auth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function verify() {
      if (requireAdmin) {
        // Check for admin authentication
        if (isAdminLoggedIn()) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      } else {
        // Check for user authentication
        if (isUserLoggedIn()) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      }
      setChecking(false);
    }
    verify();
  }, [requireAdmin]);

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  
  if (!allowed) {
    // Redirect to appropriate login page
    const redirectTo = requireAdmin ? "/admin/login" : "/login";
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
}
