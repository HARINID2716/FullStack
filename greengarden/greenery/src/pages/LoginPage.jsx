import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1️⃣ Login with Supabase
      const trimmedEmail = email.trim().toLowerCase();
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (loginError) {
        const msg = loginError.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setError("Invalid email or password");
        } else if (msg.includes("email not confirmed")) {
          setError("Please confirm your email before logging in");
        } else {
          setError(loginError.message);
        }
        return;
      }

      const userId = data.user.id;

      // 2️⃣ Check admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();

      if (profileError || !profile?.is_admin) {
        setError("Access denied ❌ Admin only");
        await supabase.auth.signOut();
        return;
      }

      // 3️⃣ Success
      localStorage.setItem("isAdmin", "true");
      navigate("/admin", { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          Admin Login
        </h2>

        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Demo admin</div>
              <div className="mt-1">Email: admin@gmail.com</div>
              <div>Pass: admin1234</div>
            </div>
            <button
              type="button"
              onClick={() => { setEmail("admin@gmail.com"); setPassword("admin1234"); }}
              className="ml-4 px-3 py-1 bg-green-700 text-white rounded text-sm"
            >
              Use demo
            </button>
          </div>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          autoComplete="email"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          autoComplete="current-password"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p className="mt-4 text-center text-red-600 text-sm">{error}</p>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
