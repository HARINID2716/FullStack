import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import supabase from "../config/supabase";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

const UserRegister = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (name.trim().length < 2) {
      setIsError(true);
      setMessage("Name must be at least 2 characters");
      return false;
    }
    if (!phoneRegex.test(phone.trim())) {
      setIsError(true);
      setMessage("Phone must be 10 digits");
      return false;
    }
    if (!emailRegex.test(email.trim().toLowerCase())) {
      setIsError(true);
      setMessage("Please enter a valid email");
      return false;
    }
    if (password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match ❌");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setIsError(true);
        setMessage(error.message);
        return;
      }

      const user = data.user;
      if (!user) {
        setIsError(true);
        setMessage("Registration failed. Please try again.");
        return;
      }

      // 2️⃣ Insert profile data
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
        },
      ]);

      if (profileError) {
        setIsError(true);
        setMessage("Profile save failed ❌");
        return;
      }

      setIsError(false);
      setMessage("Registration successful ✅ Redirecting...");
      setTimeout(() => navigate("/userlogin"), 1500);
    } catch {
      setIsError(true);
      setMessage("Something went wrong ❌ Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">User Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:ring-2 focus:ring-green-600"
          autoComplete="name"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:ring-2 focus:ring-green-600"
          autoComplete="tel"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:ring-2 focus:ring-green-600"
          autoComplete="email"
          required
        />

        {/* Password */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-600"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-600"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-2 text-gray-500"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-green-700 text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/userlogin")}
            className="w-1/2 border border-green-700 text-green-700 py-2 rounded"
          >
            Login
          </button>
        </div>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              isError ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default UserRegister;
