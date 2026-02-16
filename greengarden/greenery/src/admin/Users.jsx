import React, { useEffect, useState } from "react";
import supabase from "../config/supabase"; // adjust path if needed

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // First try to get all users (requires admin policy)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, name, phone, avatar_url, is_admin, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all users:", error);

        // Fallback: try to get current user only
        const { data: currentUserData, error: currentError } = await supabase
          .from("profiles")
          .select("id, email, full_name, name, avatar_url, is_admin, created_at, updated_at")
          .eq("id", currentUser.id)
          .single();

        if (currentError) {
          throw new Error("Cannot access user data. Please run this SQL in Supabase dashboard:\n\nCREATE POLICY \"Admin read all profiles\" ON profiles FOR SELECT USING (auth.role() = 'authenticated');");
        }

        // If we can only get current user, show that with a warning
        setUsers([currentUserData]);
        setError("⚠️ RLS Policy Limitation: Only showing your profile. To see all users, run this SQL in Supabase SQL Editor:\n\nCREATE POLICY \"Admin read all profiles\" ON profiles FOR SELECT USING (auth.role() = 'authenticated');");
        setLoading(false);
        return;
      }

      // Sort users so current admin appears first
      if (currentUser) {
        const sortedUsers = data.sort((a, b) => {
          if (a.id === currentUser.id) return -1;
          if (b.id === currentUser.id) return 1;
          return 0;
        });
        setUsers(sortedUsers);
      } else {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isUserActive = (user) => {
    if (!user.updated_at) return false;

    const lastActivity = new Date(user.updated_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return lastActivity > thirtyDaysAgo;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err.message);
      alert("Failed to delete user. Make sure your API key allows this action.");
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return (
    <div className="p-6 text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">User Management (Admin View)</h1>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <h3 className="font-bold">Database Policy Issue</h3>
        <p className="text-sm mt-2">{error}</p>
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono">
          <p className="font-bold mb-2">Run this SQL in Supabase Dashboard → SQL Editor:</p>
          <code>
            CREATE POLICY "Admin read all profiles"<br/>
            ON profiles<br/>
            FOR SELECT<br/>
            USING (auth.role() = 'authenticated');
          </code>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">User Management (Admin View)</h1>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-400">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Last Active</th>
            <th className="p-3">Registered</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={`border-t border-gray-700 ${currentUser && currentUser.id === user.id ? 'bg-blue-100' : ''}`}>
              <td className="p-3">{user.full_name || user.name || user.email || "N/A"}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.phone || "N/A"}</td>
              <td className="p-3">
                {currentUser && currentUser.id === user.id ? (
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">Admin</span>
                ) : (
                  <span className="bg-gray-600 text-white px-2 py-1 rounded text-sm">User</span>
                )}
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-sm ${isUserActive(user) ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {isUserActive(user) ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-3 text-sm">{formatDate(user.updated_at)}</td>
              <td className="p-3 text-sm">{formatDate(user.created_at)}</td>
              <td className="p-3">
                {currentUser && currentUser.id === user.id ? (
                  <span className="text-gray-500 text-sm">Current Admin</span>
                ) : (
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
