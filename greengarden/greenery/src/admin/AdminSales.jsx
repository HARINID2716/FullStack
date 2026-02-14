import React, { useEffect, useState } from "react";
import supabase from "../config/supabase";
import { X, Pencil } from "lucide-react";

const AdminSales = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const normalizeApproved = (val) => {
    if (val === true || val === "true" || val === "t" || val === 1 || val === "1") return true;
    if (val === false || val === "false" || val === "f" || val === 0 || val === "0") return false;
    if (val === null || typeof val === "undefined") return true; // legacy default approved
    return false;
  };

  const fetchProducts = async () => {
    setLoading(true);
    const tables = ["seeds", "vegetables", "plants", "fertilizers", "sampling"];
    const allProducts = [];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        continue;
      }

      const normalized = (data || []).map((d) => ({ ...d, approved: normalizeApproved(d.approved) }));
      allProducts.push(...normalized.map((p) => ({ ...p, table })));
    }

    allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setProducts(allProducts);
    setLoading(false);
  };

  useEffect(() => {
    const initializeProducts = () => {
      fetchProducts();
    };
    initializeProducts();
  }, []);

  // Delete product
  const handleDelete = async (product) => {
    if (!confirm(`Delete this ${product.table.slice(0, -1)}?`)) return;

    try {
      // Remove image from storage if it exists
      if (product.image_url && product.image_url.includes("supabase")) {
        try {
          const path = product.image_url.split("/storage/v1/object/public/product-images/")[1];
          if (path) {
            await supabase.storage.from("product-images").remove([path]);
          }
        } catch (storageErr) {
          console.error("Storage deletion error (continuing):", storageErr);
        }
      }

      // Delete from database and request the deleted row back so we can detect RLS/no-op
      const { data, error } = await supabase
        .from(product.table)
        .delete()
        .eq("id", product.id)
        .select("*");

      if (error) {
        console.error("Delete error:", error);
        alert(`Failed to delete: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error("Delete no-op: likely blocked by RLS or row not found", { product });
        alert("Delete failed: no rows were removed. This may be caused by database row-level-security (RLS) policies blocking the action.");
        return;
      }

      alert(`${product.name} deleted successfully ✅`);
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete ❌ Check console");
    }
  };

  // Approve product
  const handleApprove = async (product) => {
    if (!confirm(`Approve this ${product.table.slice(0, -1)}?`)) return;

    try {
      // Attempt to update and return the updated row so we can detect if RLS prevented it
      const { data, error } = await supabase
        .from(product.table)
        .update({ approved: true })
        .eq("id", product.id)
        .select("*");

      if (error) {
        console.error("Approve error:", error);
        alert(`Failed to approve: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error("Approve no-op: likely blocked by RLS or row not found", { product });
        alert("Approve failed: no rows were updated. This may be caused by database row-level-security (RLS) policies blocking the action.");
        return;
      }

      alert(`${product.name} approved successfully ✅`);
      fetchProducts();
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve ❌ Check console");
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
    
    // Validate inputs
    if (!name.trim()) {
      alert("Product name cannot be empty");
      return;
    }
    if (!price || price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    try {
      const { data, error } = await supabase
        .from(editingProduct.table)
        .update({ name: name.trim(), price: parseFloat(price) })
        .eq("id", editingProduct.id)
        .select("*");

      if (error) {
        console.error("Edit error:", error);
        alert(`Failed to save: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error("Edit no-op: likely blocked by RLS or row not found", { editingProduct });
        alert("Save failed: no rows were updated. This may be caused by database row-level-security (RLS) policies blocking the action.");
        return;
      }

      alert(`${name} updated successfully ✅`);
      
      // Close modal, reset form, and refetch to ensure fresh data types
      setEditingProduct(null);
      setName("");
      setPrice("");
      fetchProducts();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save ❌ Check console");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Product Management</h2>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && <p className="text-center text-gray-600">Loading products...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={`${product.table}-${product.id}`} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <div className="relative mb-3">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="h-44 w-full object-contain rounded" 
              />
              <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${product.approved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                {product.approved ? '✓ Approved' : '⏳ Pending'}
              </span>
            </div>

            <h3 className="mt-3 font-medium text-gray-800 line-clamp-2">{product.name}</h3>
            <p className="font-bold text-lg text-gray-900 mt-2">₹ {product.price}</p>
            
            <div className="flex gap-1 items-center mt-2 text-xs text-gray-600">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                {product.table.slice(0, -1)}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">User: {product.user_id?.substring(0, 8)}...</p>

            <div className="flex gap-2 mt-4 flex-wrap">
              {!product.approved && (
                <button
                  onClick={() => handleApprove(product)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded text-sm font-medium transition"
                  title="Approve this product"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => startEdit(product)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded flex items-center justify-center gap-1 text-sm font-medium transition"
                title="Edit product details"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(product)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm font-medium transition"
                title="Delete this product"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit {editingProduct.table.slice(0, -1)}</h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Product Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800"
                  onClick={saveEdit}
                >
                  Save Changes
                </button>
                <button
                  className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSales;
