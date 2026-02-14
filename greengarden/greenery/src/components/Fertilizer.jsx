import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { useCartHook } from "../hooks/useCart";

const Fertilizer = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now());
  const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "product-images";
  const [userFertilizers, setUserFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    fetchApprovedFertilizers();
    // Auto-refresh every 10 seconds to catch admin approvals
    const interval = setInterval(fetchApprovedFertilizers, 10000);
    return () => clearInterval(interval);
  }, [user]);

  /* ================= AUTH USER ================= */
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser(user);
  };

  const fetchApprovedFertilizers = async () => {
    setRefreshing(true);
    try {
      // Normalize possible values for `approved` coming from the DB
      const normalizeApproved = (val) => {
        if (val === true || val === "true" || val === "t" || val === 1 || val === "1") return true;
        if (val === false || val === "false" || val === "f" || val === 0 || val === "0") return false;
        if (val === null || typeof val === "undefined") return true; // legacy rows default to approved
        return false;
      };

      const { data, error } = await supabase
        .from("fertilizers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch fertilizers error:", error);
        return;
      }

      const normalized = (data || []).map((d) => ({ ...d, approved: normalizeApproved(d.approved) }));

      if (!user) {
        setUserFertilizers(normalized.filter((item) => item.approved));
        return;
      }

      // Logged in: show approved items plus own submissions (even if pending)
      setUserFertilizers(
        normalized.filter((item) => item.approved || item.user_id === user.id)
      );
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  /* ================= ADD FERTILIZER ================= */
  const handleAddFertilizer = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      alert("Please enter a fertilizer name");
      return;
    }
    if (!price || price <= 0) {
      alert("Please enter a valid price");
      return;
    }
    if (!file) {
      alert("Please select an image");
      return;
    }
    if (!user) {
      alert("Please login first");
      return;
    }

    setUploading(true);

    try {
      const currentUser = user;
      const fileName = `${Date.now()}-${file.name}`;

      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const image_url = publicData?.publicUrl || null;

      // Insert fertilizer with user_id
      const { data: fertilizerData, error: insertError } = await supabase.from("fertilizers").insert([
        {
          name: name.trim(),
          price: parseFloat(price),
          image_url,
          user_id: currentUser.id,
        },
      ]);

      if (insertError) {
        console.error("Insert error details:", insertError);
        throw insertError;
      }

      console.log("Fertilizer inserted successfully:", fertilizerData);

      alert("Fertilizer added successfully ✅\nWaiting for admin approval...");

      // Reset form
      setName("");
      setPrice("");
      setFile(null);
      setFileKey(Date.now());

      // Refresh the list instead of reloading page
      fetchApprovedFertilizers();
    } catch (err) {
      console.error("Add fertilizer error:", err);
      alert("Failed to add fertilizer ❌ Check console for details");
    }

    setUploading(false);
  };

  /* ================= DELETE FERTILIZER ================= */
  const handleDeleteFertilizer = async (fertilizerId) => {
    if (!window.confirm("Are you sure you want to delete this fertilizer?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("fertilizers")
        .delete()
        .eq("id", fertilizerId)
        .eq("user_id", user.id); // Only delete if user_id matches

      if (error) throw error;

      alert("✅ Fertilizer deleted successfully");
      fetchApprovedFertilizers();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete fertilizer");
    }
  };

  // Note: delete/edit handled by admin in AdminSales.jsx
  const allProducts = [...userFertilizers];

  return (
    <section className="max-w-7xl mx-auto px-6 pt-32 pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-black">FERTILIZER</h2>
        <button
          onClick={fetchApprovedFertilizers}
          disabled={refreshing}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Upload Form */}
      {user && (
        <div className="max-w-md mx-auto mb-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add Your Fertilizer</h3>
          <form onSubmit={handleAddFertilizer} className="space-y-4">
            <input
              placeholder="Fertilizer Name (required)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />

            <input
              type="number"
              step="0.01"
              placeholder="Price in ₹ (required)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Select Image (required)
              </label>
              <input
                key={fileKey}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 border rounded"
                required
              />
              {file && <p className="text-sm text-green-600 mt-1">✓ {file.name}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Add Fertilizer"}
            </button>
          </form>
        </div>
      )}

      {loading && <p className="text-center">Loading fertilizers...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProducts.map((item) => (
          <ProductCard key={item.id || item.name} item={item} user={user} onDelete={handleDeleteFertilizer} />
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ item, user, onDelete }) => {
  const { addToCart } = useCartHook();

  // For user-uploaded items, use default values if not present
  const rating = item.rating || 0;
  const reviews = item.reviews || 0;
  const oldPrice = item.oldPrice || null;
  const discount = item.discount || null;

  const isUserProduct = user && item.user_id === user.id;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition">
      
      {/* Image */}
      <div className="rounded-xl aspect-square flex items-center justify-center overflow-hidden bg-gray-100">
        <img
          src={item.image || item.image_url}
          alt={item.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Name */}
      <h3 className="mt-4 text-sm font-medium text-gray-800 line-clamp-2">
        {item.name}
      </h3>

      {/* Approval Status */}
      {isUserProduct && item.approved === false && (
        <p className="text-xs text-orange-600 font-medium mt-1">
          ⏳ Pending Approval
        </p>
      )}

      {/* Rating */}
      <div className="flex items-center gap-2 mt-2 text-sm">
        <div className="text-green-700">
          {rating > 0
            ? "★".repeat(rating) + "☆".repeat(5 - rating)
            : "No Rating"}
        </div>
        <span className="text-gray-500">
          {reviews} {reviews === 1 ? "Rating" : "Ratings"}
        </span>
      </div>

      {/* Price */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className="text-lg font-bold text-black">
          ₹ {item.price}
        </span>

        {oldPrice && (
          <span className="line-through text-sm text-gray-400">
            ₹ {oldPrice}
          </span>
        )}

        {discount && (
          <span className="text-green-700 text-sm font-semibold">
            {discount}
          </span>
        )}
      </div>

      {/* Button */}
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => addToCart(item)}
          className="flex-1 bg-[#87b446] hover:bg-[#588b21] text-white py-2 rounded-full text-sm font-medium transition disabled:opacity-60"
          disabled={!item.approved}
        >
          Add to Cart
        </button>
      </div>

      {isUserProduct && onDelete && (
        <button
          onClick={() => onDelete(item.id)}
          className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-full text-sm font-semibold"
        >
          🗑️ Delete This Product
        </button>
      )}
    </div>
  );
};

export default Fertilizer;
