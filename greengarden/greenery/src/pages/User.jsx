import React, { useEffect, useState } from "react";
import supabase from "../config/supabase";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_admin", false) // only regular users, hide admins
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch users error:", error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  /* ================= REALTIME ================= */
  useEffect(() => {
    const initializeUsers = () => {
      fetchUsers();
    };

    initializeUsers();

    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchUsers(); // auto refresh on insert/delete/update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= DELETE USER ================= */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      alert("Failed to delete user");
    }
  };

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-semibold mb-4">All Users</h1>

      <table className="w-full border border-gray-400">
        <thead className="bg-gray-300">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-gray-300">
              <td className="p-3">{user.name || "-"}</td>
              <td className="p-3">{user.email || "-"}</td>
              <td className="p-3">
                {user.email === "admin@gmail.com" ? "Admin" : "User"}
              </td>
              <td className="p-3">
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
