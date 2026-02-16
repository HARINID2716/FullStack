import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Home, Users, FileText, Video, Book, ShoppingCart } from "lucide-react";
import { supabase } from "../config/supabase";

const AdminNavbar = () => {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-md transition ${
      isActive
        ? "text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  // Immediate, deterministic logout
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
      localStorage.removeItem("isAdmin");
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      navigate("/login", { replace: true });
      setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }, 150);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-900 text-white px-4 py-3 flex justify-between items-center z-50">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
        <button onClick={() => setOpen(true)}>
          <Menu size={26} />
        </button>
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-2 p-4">
          <NavLink to="/admin" className={linkClass}>
            <Home size={18} /> Dashboard
          </NavLink>

          <NavLink to="/admin/users" className={linkClass}>
            <Users size={18} /> Users
          </NavLink>

          <NavLink to="/admin/sales" className={linkClass}>
            <ShoppingCart size={18} /> Product Management
          </NavLink>

          <NavLink to="/admin/posts" className={linkClass}>
            <FileText size={18} /> Posts
          </NavLink>

          <NavLink to="/admin/videos" className={linkClass}>
            <Video size={18} /> Videos
          </NavLink>

          <NavLink to="/admin/messages" className={linkClass}>
            <Book size={18} /> Methods
          </NavLink>

          {/* 🔴 LOGOUT */}
          <button
            onClick={handleLogout} 
            disabled={loggingOut}
            className="flex items-center gap-3 px-4 py-3 mt-6 text-red-400 hover:bg-red-600 hover:text-white rounded-md transition disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </nav>
      </aside>

      {/* ===== OVERLAY ===== */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== CONTENT SPACER ===== */}
      <div className="md:ml-64 pt-14 md:pt-0"></div>
    </>
  );
};

export default AdminNavbar;
