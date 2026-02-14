import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate("/userlogin");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData || null);
      setFormData({
        name: profileData?.name || profileData?.full_name || "",
        phone: profileData?.phone || "",
        email: profileData?.email || user.email,
      });
      setLoading(false);
    };
    getUser();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "❌ Name is required" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name.trim(),
          full_name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        setMessage({ type: "error", text: "❌ Update failed: " + error.message });
      } else {
        setMessage({ type: "success", text: "✅ Profile updated successfully!" });
        setEditing(false);
        
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(updatedProfile || null);
        
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "❌ Unexpected error: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-24">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">👤 My Profile</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-300"
              : "bg-red-50 text-red-800 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📱 Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {saving ? "💾 Saving..." : "💾 Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setMessage(null);
              }}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 space-y-6">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {profile?.name || profile?.full_name || "Not set"}
            </p>
          </div>
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">📱 Phone Number</p>
            <p className="text-lg text-gray-900 mt-2">
              {profile?.phone || "Not set"}
            </p>
          </div>
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">📧 Email Address</p>
            <p className="text-lg text-gray-900 mt-2">{profile?.email || user?.email}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition mt-6"
          >
            ✎ Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;