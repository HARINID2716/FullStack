import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { useCart } from "../context/CartContext";

const ProductLayout = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now());
  const [userPlants, setUserPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "product-images";
  const { addToCart } = useCart();

  /* ================= AUTH USER ================= */
  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    fetchApprovedPlants();
    // Auto-refresh every 10 seconds to catch admin approvals
    const interval = setInterval(fetchApprovedPlants, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  const fetchApprovedPlants = async () => {
    setRefreshing(true);
    try {
      const normalizeApproved = (val) => {
        if (val === true || val === "true" || val === "t" || val === 1 || val === "1") return true;
        if (val === false || val === "false" || val === "f" || val === 0 || val === "0") return false;
        if (val === null || typeof val === "undefined") return true; // legacy rows default approved
        return false;
      };

      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch plants error:", error);
        return;
      }

      const normalized = (data || []).map((d) => ({ ...d, approved: normalizeApproved(d.approved) }));

      if (!user) {
        setUserPlants(normalized.filter((item) => item.approved));
        return;
      }

      // Logged in: show approved items plus own submissions (even if pending)
      setUserPlants(normalized.filter((item) => item.approved || item.user_id === user.id));
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  /* ================= UPLOAD PLANT ================= */
  const handleAddPlant = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      alert("Please enter a plant name");
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

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    setUploading(true);

    try {
      // Preflight: ensure the bucket exists
      const { data: listCheck, error: listError } = await supabase.storage
        .from(BUCKET)
        .list('', { limit: 1 });

      if (listError) {
        console.error('Bucket check error:', listError);
        if (listError.message?.includes('Bucket not found') || listError.status === 404) {
          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
            const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
              },
              body: JSON.stringify({
                name: BUCKET,
                public: true,
              }),
            });
            if (!response.ok) {
              throw new Error(`Failed to create bucket: ${response.statusText}`);
            }
            console.log(`Bucket "${BUCKET}" created successfully.`);
          } catch (createError) {
            console.error('Failed to create bucket:', createError);
            alert(
              `Storage bucket "${BUCKET}" not found and could not be created. Please create it manually in Supabase dashboard → Storage → Create bucket (name: ${BUCKET}).`
            );
            setUploading(false);
            return;
          }
        } else {
          alert(`Storage error: ${listError.message}`);
          setUploading(false);
          return;
        }
      }

      const fileName = `${Date.now()}-${file.name}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        const msg = uploadError?.message || "Storage upload error";
        console.error("Upload error details:", uploadError);
        if (msg.includes("Bucket not found") || uploadError?.status === 404) {
          alert(
            `Upload failed: storage bucket "${BUCKET}" not found. Create it in Supabase dashboard → Storage → Create bucket (name: ${BUCKET}).`
          );
          setUploading(false);
          return;
        }
        throw uploadError;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const image_url = publicData?.publicUrl || null;

      // Insert plant with user_id
      const { data: plantData, error: insertError } = await supabase.from("plants").insert([
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

      console.log("Plant inserted successfully:", plantData);

      alert("Plant added successfully ✅");

      // Reset form
      setName("");
      setPrice("");
      setFile(null);
      setFileKey(Date.now());

      // Refresh the list instead of reloading page
      fetchApprovedPlants();
    } catch (err) {
      console.error("Add plant error:", err);
      alert("Failed to add plant ❌ Check console for details");
    }

    setUploading(false);
  };

  /* ================= DELETE PLANT ================= */
  const handleDeletePlant = async (plantId) => {
    if (!window.confirm("Are you sure you want to delete this plant?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("plants")
        .delete()
        .eq("id", plantId)
        .eq("user_id", user.id); // Only delete if user_id matches

      if (error) throw error;

      alert("✅ Plant deleted successfully");
      fetchApprovedPlants();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete plant");
    }
  };

  const allProducts = [...userPlants];

  return (
    <section className="max-w-7xl mx-auto px-6 pt-32 pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#000000]">PLANTS</h2>
        <button
          onClick={fetchApprovedPlants}
          disabled={refreshing}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Upload Form */}
      {user && (
        <div className="max-w-md mx-auto mb-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add Your Plant</h3>
          <form onSubmit={handleAddPlant} className="space-y-4">
            <input
              placeholder="Plant Name (required)"
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
              {uploading ? "Uploading..." : "Add Plant"}
            </button>
          </form>
        </div>
      )}

      {loading && <p className="text-center">Loading plants...</p>}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProducts.map((item) => (
          <ProductCard key={item.id || item.name} item={item} user={user} onDelete={handleDeletePlant} />
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ item, user, onDelete }) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  // For user-uploaded items, use default values if not present
  const rating = item.rating || 0;
  const reviews = item.reviews || 0;
  const oldPrice = item.oldPrice || null;
  const discount = item.discount || null;

  const isUserProduct = user && item.user_id === user.id;

  return (
    <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm hover:shadow-lg transition">
      
      {/* IMAGE FIXED CONTAINER */}
      <div className="bg-[rgb(255,255,255)] rounded-xl aspect-square flex items-center justify-center overflow-hidden">
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

      {/* Rating - only show if reviews > 0 */}
      {reviews > 0 && (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <div className="text-green-700">
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
          </div>
          <span className="text-gray-500">
            {reviews} Rating
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-lg font-bold text-black">
          ₹ {item.price}
        </span>

        {oldPrice && (
          <>
            <span className="line-through text-sm text-gray-400">
              ₹ {oldPrice}
            </span>
            <span className="text-green-700 text-sm font-semibold">
              {discount}
            </span>
          </>
        )}
      </div>

      {/* Quantity & Button */}
      <div className="flex items-center justify-between mt-4">

        <button 
          onClick={() => addToCart(item)}
          className="bg-[#87b446] hover:bg-[#588b21] mt-3 w-full text-white py-2 rounded-full disabled:opacity-60"
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

export default ProductLayout;
