import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import api from "../utils/apiClient";
import Skeleton from "../components/Skeleton";

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ bio: "", avatar: "" });
  const [bookmarks, setBookmarks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (userId) {
        const res = await api.get(`/api/users/${userId}`);
        setUser(res);
      } else {
        const res = await api.get("/api/users/profile");
        setUser(res);
      }

      setEditData(res ? { bio: res.bio, avatar: res.avatar } : {});
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!userId) return;
    try {
      const res = await api.get("/api/bookmarks");
      setBookmarks(res.data || []);
    } catch (err) {
      console.error("Fetch bookmarks error:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!authUser?._id) return;

    try {
      setSaving(true);
      const res = await api.put(`/api/users/${authUser._id}`, editData);
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const isOwnProfile = authUser?._id === userId && !userId;

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton height={200} className="mb-4" />
        <Skeleton height={100} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>📚 Roll: {user.rollNumber}</span>
                <span>📍 {user.department}</span>
                {user.semester > 0 && <span>📅 Sem {user.semester}</span>}
              </div>
            </div>
          </div>

          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Bio Section */}
        {isEditing && isOwnProfile ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={editData.avatar}
                onChange={(e) =>
                  setEditData({ ...editData, avatar: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={editData.bio}
                onChange={(e) =>
                  setEditData({ ...editData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                {editData.bio?.length || 0}/500 characters
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({ bio: user.bio, avatar: user.avatar });
                  setError("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : user.bio ? (
          <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Bio</p>
            <p>{user.bio}</p>
          </div>
        ) : isOwnProfile ? (
          <div className="text-gray-400 italic">No bio yet. Add one to tell others about yourself!</div>
        ) : null}

        {/* Online Status */}
        <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-600">
          <div
            className={`w-3 h-3 rounded-full ${
              user.isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          {user.isOnline ? (
            <span>Online</span>
          ) : (
            <span>
              Last seen{" "}
              {user.lastSeen
                ? new Date(user.lastSeen).toLocaleDateString()
                : "recently"}
            </span>
          )}
        </div>
      </div>

      {/* Bookmarks Section - Only for own profile */}
      {isOwnProfile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            My Bookmarks
          </h2>
          {bookmarks.length > 0 ? (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark._id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => {
                    if (bookmark.itemType === "thread") {
                      navigate(`/forum?threadId=${bookmark.itemId._id}`);
                    } else if (bookmark.itemType === "note") {
                      navigate(`/notes?noteId=${bookmark.itemId._id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {bookmark.itemId?.title ||
                          bookmark.itemId?.name ||
                          "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bookmark.itemType === "thread" ? "Forum Thread" : "Note"} •{" "}
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-lg">
                      {bookmark.itemType === "thread" ? "💬" : "📝"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No bookmarks yet</p>
          )}
        </div>
      )}
    </div>
  );
}
