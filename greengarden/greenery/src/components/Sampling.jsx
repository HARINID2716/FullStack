import { useState, useEffect } from "react";

import { supabase } from "../config/supabase";

import { useCart } from "../context/CartContext";



const Sampling = () => {

  const [name, setName] = useState("");

  const [price, setPrice] = useState("");

  const [file, setFile] = useState(null);

  const [user, setUser] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [fileKey, setFileKey] = useState(Date.now());

  const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "product-images";

  const [userSamplings, setUserSamplings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {

    getUser();

  }, []);



  useEffect(() => {

    fetchApprovedSamplings();

    // Auto-refresh every 10 seconds to catch admin approvals

    const interval = setInterval(fetchApprovedSamplings, 10000);

    return () => clearInterval(interval);

  }, [user]);



  /* ================= AUTH USER ================= */

  const getUser = async () => {

    const { data: { user }, error } = await supabase.auth.getUser();

    if (user) setUser(user);

  };



const fetchApprovedSamplings = async () => {

  setRefreshing(true);

  try {

    // Normalize possible values for `approved` coming from the DB

    const normalizeApproved = (val) => {

      if (val === true || val === 'true' || val === 't' || val === 1) return true;

      return false;

    };



    // If no user: public view → only approved items

    if (!user) {

      const { data, error } = await supabase

        .from("sampling")

        .select("*")

        .eq("approved", true)

        .order("created_at", { ascending: false });



      if (error) console.error("Fetch sampling error:", error);

      else setUserSamplings((data || []).map(d => ({ ...d, approved: normalizeApproved(d.approved) })));

      return;

    }



    // If logged in: show approved + own items

    const { data, error } = await supabase

      .from("sampling")

      .select("*")

      .or(`approved.eq.true,user_id.eq.${user.id}`)

      .order("created_at", { ascending: false });



    if (error) console.error("Fetch sampling error:", error);

    else setUserSamplings((data || []).map(d => ({ ...d, approved: normalizeApproved(d.approved) })));

  } finally {

    setRefreshing(false);

    setLoading(false);

  }

};



  /* ================= ADD SAMPLING ================= */

  const handleAddSampling = async (e) => {

    e.preventDefault();

    

    // Validation

    if (!name.trim()) {

      alert("Please enter a sampling name");

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

      const { data: uploadData, error: uploadError } = await supabase.storage

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



      // Insert sampling with user_id

      const { data: samplingData, error: insertError } = await supabase.from("sampling").insert([

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



      console.log("Sampling inserted successfully:", samplingData);



      alert("Sampling added successfully ✅\nWaiting for admin approval...");



      // Reset form

      setName("");

      setPrice("");

      setFile(null);

      setFileKey(Date.now());



      // Refresh the list instead of reloading page

      fetchApprovedSamplings();

    } catch (err) {

      console.error("Add sampling error:", err);

      alert("Failed to add sampling ❌ Check console for details");

    }



    setUploading(false);

  };

  /* ================= DELETE SAMPLING ================= */
  const handleDeleteSampling = async (samplingId) => {
    if (!window.confirm("Are you sure you want to delete this sampling?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("sampling")
        .delete()
        .eq("id", samplingId)
        .eq("user_id", user.id); // Only delete if user_id matches

      if (error) throw error;

      alert("✅ Sampling deleted successfully");
      fetchApprovedSamplings();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete sampling");
    }
  };

  // Note: delete/edit handled by admin in AdminSales.jsx
  const allProducts = [...userSamplings];



  return (

    <section className="max-w-7xl mx-auto px-6 pt-32 pb-10">

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-2xl font-bold text-black">SAMPLING</h2>

        <button

          onClick={fetchApprovedSamplings}

          disabled={refreshing}

          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"

        >

          {refreshing ? "Refreshing..." : "Refresh"}

        </button>

      </div>



      {/* Upload Form */}

      {user && (

        <div className="max-w-md mx-auto mb-8 p-6 bg-white rounded-lg shadow">

          <h3 className="text-lg font-semibold mb-4">Add Your Sampling</h3>

          <form onSubmit={handleAddSampling} className="space-y-4">

            <input

              placeholder="Sampling Name (required)"

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

              {uploading ? "Uploading..." : "Add Sampling"}

            </button>

          </form>

        </div>

      )}



      {loading && <p className="text-center">Loading samplings...</p>}



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {allProducts.map((item) => (

          <ProductCard key={item.id || item.name} item={item} user={user} onDelete={handleDeleteSampling} />

        ))}

      </div>

    </section>

  );

};



const ProductCard = ({ item, user, onDelete }) => {
  const { addToCart } = useCart();
  // ⭐ Clamp rating between 0–5 (CRASH FIX)
  const rating = item.rating ? Math.min(Math.max(item.rating, 0), 5) : 0;



  // For user-uploaded items, use default values if not present

  const oldPrice = item.oldPrice || null;

  const reviews = item.reviews || 0;

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



export default Sampling;

