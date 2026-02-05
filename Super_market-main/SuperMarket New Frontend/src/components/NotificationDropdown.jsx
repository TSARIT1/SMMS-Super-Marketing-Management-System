import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, X, ExternalLink } from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../utils/notifications";

const NotificationDropdown = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId, userId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "SUCCESS":
        return "✅";
      case "WARNING":
        return "⚠️";
      case "ERROR":
        return "❌";
      case "ANNOUNCEMENT":
        return "📢";
      default:
        return "ℹ️";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4
                        className={`font-medium text-sm ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800 flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.link && (
                        <a
                          href={notification.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
