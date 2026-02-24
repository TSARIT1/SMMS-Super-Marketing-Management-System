// Helper function to parse user ID from various formats
// Handles: number, string, or "id:role" format (e.g., "6:1")
export function parseUserId(id) {
  if (id == null) return null;
  const idStr = String(id);
  // If ID contains colon (like "6:1"), extract just the numeric part
  const numericId = idStr.split(':')[0];
  return numericId ? parseInt(numericId, 10) : null;
}

// Get the current user ID (from admin or user localStorage)
// Returns a properly parsed numeric ID
export function getCurrentUserId() {
  try {
    // Check admin first
    const adminRaw = localStorage.getItem("admin");
    if (adminRaw) {
      const admin = JSON.parse(adminRaw);
      if (admin?.id != null) {
        return parseUserId(admin.id);
      }
    }
    // Then check user
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user?.id != null) {
        return parseUserId(user.id);
      }
    }
  } catch (err) {
    console.error("Error getting user ID from localStorage:", err);
  }
  return null;
}

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
