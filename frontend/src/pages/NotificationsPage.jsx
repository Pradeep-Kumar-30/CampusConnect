import { useEffect, useState } from "react";
import api from "../utils/apiClient";
import { useAuth } from "../state/AuthContext";
import Skeleton from "../components/Skeleton";
import useSocket from "../utils/socket";

export default function NotificationsPage() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all or unread
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      fetchUnreadCount();

      // Setup socket listener for new notifications
      if (socket) {
        socket.on("newNotification", (notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });

        return () => {
          socket.off("newNotification") ;
        };
      }
    }
  }, [user?._id, socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === "unread" ? "true" : "false";
      const res = await api.get(
        `/api/notifications?limit=50&offset=0&unreadOnly=${unreadOnly}`
      );
      setNotifications(res.data || []);
      setError("");
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/notifications/unread/count");
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error("Fetch unread count error:", err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/mark/all-read");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Delete all notifications?")) {
      try {
        await api.delete("/api/notifications");
        setNotifications([]);
        setUnreadCount(0);
      } catch (err) {
        console.error("Delete all notifications error:", err);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      mention: "🏷️",
      reply: "💬",
      message: "💌",
      announcement: "📢",
      bookmark: "🔖",
    };
    return icons[type] || "🔔";
  };

  const getNotificationColor = (type) => {
    const colors = {
      mention: "border-yellow-200 bg-yellow-50",
      reply: "border-blue-200 bg-blue-50",
      message: "border-purple-200 bg-purple-50",
      announcement: "border-red-200 bg-red-50",
      bookmark: "border-green-200 bg-green-50",
    };
    return colors[type] || "border-gray-200 bg-gray-50";
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => {
            setFilter("all");
            fetchNotifications();
          }}
          className={`px-4 py-2 font-medium ${
            filter === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilter("unread");
            fetchNotifications();
          }}
          className={`px-4 py-2 font-medium ${
            filter === "unread"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height={80} className="mb-2" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">🔔</p>
          <p className="text-gray-500">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`border rounded-lg p-4 ${getNotificationColor(
                notification.type
              )} ${
                !notification.isRead
                  ? "border-l-4 border-l-blue-500"
                  : "opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    {notification.relatedUser && (
                      <p className="text-xs text-gray-600 mt-1">
                        From {notification.relatedUser.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() =>
                        handleMarkAsRead(notification._id)
                      }
                      title="Mark as read"
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    title="Delete"
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
