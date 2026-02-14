import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { useCartHook } from "../hooks/useCart";

const Seeds = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [seeds, setSeeds] = useState([]);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now());
  const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "product-images";
  const { addToCart } = useCartHook();

  /* ================= AUTH USER ================= */
  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    fetchSeeds();
  }, [user]);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  /* ================= FETCH SEEDS ================= */
  const fetchSeeds = async () => {
    // If no user: show only approved seeds (public view)
    if (!user) {
      const { data, error } = await supabase
        .from("seeds")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch seeds error:", error);
      } else {
        setSeeds(data || []);
      }
      return;
    }

    // If logged in: show approved + own seeds
    const { data, error } = await supabase
      .from("seeds")
      .select("*")
      .or(`approved.eq.true,user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch seeds error:", error);
    else setSeeds(data || []);
  };

  /* ================= UPLOAD SEED ================= */
  const handleAddSeed = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) return alert("Please login first");

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        // Provide a clearer message when the bucket is missing
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

      // Insert seed with user_id
      const { data: seedData, error: insertError } = await supabase.from("seeds").insert([
        {
          name,
          price: parseInt(price),
          image_url,
          user_id: currentUser.id,
        },
      ]);

      if (insertError) {
        console.error("Insert error details:", insertError);
        throw insertError;
      }
      
      console.log("Seed inserted successfully:", seedData);

      alert("Seed added successfully ✅");

      // Reset form
      setName("");
      setPrice("");
      setFile(null);
      setFileKey(Date.now());

      fetchSeeds();
    } catch (err) {
      console.error("Add seed error:", err);
      alert("Failed to add seed ❌ Check console");
    }

    setUploading(false);
  };

  /* ================= DELETE SEED ================= */
  const handleDeleteSeed = async (seedId) => {
    if (!window.confirm("Are you sure you want to delete this seed?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("seeds")
        .delete()
        .eq("id", seedId)
        .eq("user_id", user.id); // Only delete if user_id matches

      if (error) throw error;

      alert("✅ Seed deleted successfully");
      fetchSeeds();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete seed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
      <h2 className="text-2xl font-bold mb-4">Add Seed</h2>

      <form onSubmit={handleAddSeed} className="space-y-4 max-w-md">
        <input
          placeholder="Seed Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Price"
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
          required
        />

        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add Seed"}
        </button>
      </form>

      <h2 className="text-2xl font-bold my-6">All Seeds</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {seeds.map((seed) => (
          <div key={seed.id} className="bg-white rounded shadow p-4">
            <img src={seed.image_url} className="w-full aspect-square object-contain bg-gray-100 rounded" />
            <h3 className="font-bold mt-2">{seed.name}</h3>
            <p>₹{seed.price}</p>
            {!seed.approved && (
              <p className="text-orange-600 text-sm font-medium mt-1">⏳ Pending Approval</p>
            )}
            <button
              onClick={() => addToCart(seed)}
              className="mt-3 w-full bg-[#87b446] text-white py-2 rounded-full disabled:opacity-60"
              disabled={!seed.approved}
            >
              Add to Cart
            </button>

            {/* Delete if owner */}
            {user && user.id === seed.user_id && (
              <button
                onClick={() => handleDeleteSeed(seed.id)}
                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-full text-sm font-semibold"
              >
                🗑️ Delete This Product
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Seeds;
