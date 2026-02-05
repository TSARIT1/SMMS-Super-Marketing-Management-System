// Notification API utility functions

const API_BASE = "/api/notifications";

/**
 * Get all notifications for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of notification objects
 */
export const getUserNotifications = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add auth headers if needed
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Object with unreadCount property
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/user/${userId}/unread-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Response object
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const response = await fetch(
      `${API_BASE}/${notificationId}/read?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Response object
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/user/${userId}/read-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Create a new notification (Admin only)
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification object
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Get all notifications (Admin only)
 * @returns {Promise<Array>} Array of all notifications
 */
export const getAllNotifications = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
};

/**
 * Update a notification (Admin only)
 * @param {number} notificationId - Notification ID
 * @param {Object} updateData - Updated notification data
 * @returns {Promise<Object>} Response object
 */
export const updateNotification = async (notificationId, updateData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/${notificationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

/**
 * Delete a notification (Admin only)
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Response object
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await fetch(`${API_BASE}/admin/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Toggle notification active status (Admin only)
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Response object
 */
export const toggleNotificationStatus = async (notificationId) => {
  try {
    const response = await fetch(`${API_BASE}/admin/${notificationId}/toggle`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling notification status:", error);
    throw error;
  }
};
