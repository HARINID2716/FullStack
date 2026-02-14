import React, { useState, useEffect } from "react";
import supabase from "../config/supabase";
import { useCartHook } from "../hooks/useCart";

const Vegetable = () => {
  const [name, setName] = useState("");
  const [kg, setKg] = useState(1);
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileKey] = useState(Date.now());
  const [vegetables, setVegetables] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "product-images";

  // Load auth user once
  useEffect(() => {
    getUser();
  }, []);

  // Fetch vegetables when user state is known
  useEffect(() => {
    fetchVegetables();
    
    // Auto-refresh every 10 seconds to catch admin approvals
    const interval = setInterval(fetchVegetables, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  const fetchVegetables = async () => {
    setRefreshing(true);
    try {
      // If no user: public view → only approved items
      if (!user) {
        const { data, error } = await supabase
          .from("vegetables")
          .select("*")
          .eq("approved", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Fetch vegetables error:", error);
        } else {
          setVegetables(data || []);
        }
        return;
      }

      // If logged in: show approved + own items (like Seeds.jsx)
      const { data, error } = await supabase
        .from("vegetables")
        .select("*")
        .or(`approved.eq.true,user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch vegetables error:", error);
      } else {
        setVegetables(data || []);
      }
    } finally {
      setRefreshing(false);
    }
  };

  /* ================= ADD VEGETABLE ================= */
  const handleAddVegetable = async (e) => {
    e.preventDefault();

    if (!file) return alert("Select image");

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return alert("Login required");

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      await supabase.storage.from(BUCKET).upload(fileName, file);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

      const pricePerKg = Math.round(price / kg);

      // In DB, column is "price" (not price_per_kg)
      const { error } = await supabase.from("vegetables").insert([
        {
          name,
          image_url: data.publicUrl,
          price: pricePerKg,
          user_id: auth.user.id,
        },
      ]);

      if (error) throw error;

      alert("Vegetable added ✅");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }

    setUploading(false);
  };

  /* ================= DELETE VEGETABLE ================= */
  const handleDeleteVegetable = async (vegetableId) => {
    if (!window.confirm("Are you sure you want to delete this vegetable?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("vegetables")
        .delete()
        .eq("id", vegetableId)
        .eq("user_id", user.id); // Only delete if user_id matches

      if (error) throw error;

      alert("✅ Vegetable deleted successfully");
      fetchVegetables();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete vegetable");
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pt-32 pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">VEGETABLE</h2>
        <button
          onClick={fetchVegetables}
          disabled={refreshing}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* SELLER FORM */}
      {user && (
        <div className="max-w-md mx-auto mb-10 p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-4">Add Vegetable</h3>

          <form onSubmit={handleAddVegetable} className="space-y-4">
            <input
              placeholder="Vegetable Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />

            {/* KG SELECT */}
            <select
              value={kg}
              onChange={(e) => setKg(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={1}>1 Kg</option>
              <option value={2}>2 Kg</option>
              <option value={3}>3 Kg</option>
            </select>

            {/* PRICE UNDER KG */}
            <input
              type="number"
              placeholder={`Price for ${kg} Kg`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />

            <input
              key={fileKey}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border rounded"
              required
            />

            <button
              disabled={uploading}
              className="w-full bg-green-700 text-white py-2 rounded"
            >
              {uploading ? "Uploading..." : "Add Vegetable"}
            </button>
          </form>
        </div>
      )}

      {/* BUYER VIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {vegetables.map((item) => (
          <ProductCard key={item.id} item={item} user={user} onDelete={handleDeleteVegetable} />
        ))}
      </div>
    </section>
  );
};

/* ================= BUYER CARD ================= */
const ProductCard = ({ item, user, onDelete }) => {
  const { addToCart } = useCartHook();
  const [kg, setKg] = useState(1);

  const isOwner = user && item.user_id === user.id;

  // DB column is "price" (price per kg)
  const totalPrice = item.price * kg;

  return (
    <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg">
      <div className="h-40 mx-auto flex items-center justify-center bg-gray-100 rounded overflow-hidden">
        <img
          src={item.image_url}
          alt={item.name}
          className="h-40 w-full object-contain"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/160?text=No+Image";
          }}
        />
      </div>

      <h3 className="mt-3 font-medium">{item.name}</h3>

      <p className="text-sm text-gray-600">
        ₹ {item.price} / kg
      </p>

      {!item.approved && (
        <p className="text-orange-600 text-sm font-medium mt-1">
          ⏳ Pending Approval
        </p>
      )}

      <select
        value={kg}
        onChange={(e) => setKg(Number(e.target.value))}
        className="w-full mt-2 border p-2 rounded"
      >
        {[1, 2, 3].map((k) => (
          <option key={k} value={k}>
            {k} Kg
          </option>
        ))}
      </select>

      <p className="mt-2 font-bold text-lg">₹ {totalPrice}</p>

      <button
        onClick={() =>
          addToCart({
            ...item,
            kg,
            price: totalPrice,
          })
        }
        className="mt-3 w-full bg-[#87b446] text-white py-2 rounded-full disabled:opacity-60"
        disabled={!item.approved}
      >
        Add to Cart
      </button>

      {isOwner && (
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

export default Vegetable;
