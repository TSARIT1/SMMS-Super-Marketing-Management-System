// User authentication functions
export function getUser() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user;
  } catch (err) {
    console.error("Error reading user from localStorage:", err);
    return null;
  }
}

export function isUserLoggedIn() {
  const user = getUser();
  const token = localStorage.getItem("token");
  return !!(user && token);
}

export function logoutUser() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "/login";
}

// Admin authentication functions
export function getAdmin() {
  try {
    const admin = JSON.parse(localStorage.getItem("admin"));
    // Normalize legacy 'ADMIN' role to 'SUPER_ADMIN' for consistency
    if (admin && admin.role === "ADMIN") {
      admin.role = "SUPER_ADMIN";
      localStorage.setItem("admin", JSON.stringify(admin));
    }
    return admin;
  } catch (err) {
    console.error("Error reading admin from localStorage:", err);
    return null;
  }
}

// Keep the function name for compatibility. It returns true when a SUPER_ADMIN is logged in.
export function isAdminLoggedIn() {
  const admin = getAdmin();
  return !!(admin && (admin.role === "SUPER_ADMIN" || admin.role === "ADMIN"));
}

export function logoutAdmin() {
  localStorage.removeItem("admin");
  localStorage.removeItem("adminToken");
  window.location.href = "/admin/login";
}
