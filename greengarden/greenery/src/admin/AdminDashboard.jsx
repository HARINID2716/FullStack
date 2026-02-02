import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import AdminMessages from "./AdminMessages";
import {
  BarChart3,
  ShoppingCart,
  Users,
  FileText,
  Video,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    totalVideos: 0,
    totalPosts: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all products
      const tables = ["seeds", "vegetables", "plants", "fertilizers", "sampling"];
      let allProducts = [];
      let totalPending = 0;

      for (const table of tables) {
        const { data } = await supabase.from(table).select("*");
        if (data) {
          allProducts = [...allProducts, ...data.map((p) => ({ ...p, table }))];
          totalPending += data.filter((p) => !p.approved).length;
        }
      }

      // Fetch users count
      const { data: usersData } = await supabase.from("profiles").select("id", {
        count: "exact",
      });

      // Fetch posts count
      const { data: postsData } = await supabase.from("posts").select("id", {
        count: "exact",
      });

      // Fetch videos count
      const { data: videosData } = await supabase.from("videos").select("id", {
        count: "exact",
      });

      // Get recent sales (updated products)
      const recentProducts = allProducts
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Get pending approvals
      const pending = allProducts.filter((p) => !p.approved).slice(0, 5);

      setStats({
        totalSales: allProducts.length,
        pendingApprovals: totalPending,
        activeUsers: usersData?.length || 0,
        totalVideos: videosData?.length || 0,
        totalPosts: postsData?.length || 0,
      });

      setRecentSales(recentProducts);
      setPendingProducts(pending);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (product) => {
    try {
      const { error } = await supabase
        .from(product.table)
        .update({ approved: true })
        .eq("id", product.id);

      if (!error) {
        setPendingProducts((prev) =>
          prev.filter((p) => p.id !== product.id)
        );
        setStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (error) {
      console.error("Error approving product:", error);
    }
  };

  const handleRejectProduct = async (product) => {
    try {
      const { error } = await supabase
        .from(product.table)
        .delete()
        .eq("id", product.id);

      if (!error) {
        setPendingProducts((prev) =>
          prev.filter((p) => p.id !== product.id)
        );
        setStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
    }
  };

  const fetchCategoryProducts = async (categoryName) => {
    const tableMap = {
      Seeds: "seeds",
      Vegetables: "vegetables",
      Plants: "plants",
      Fertilizers: "fertilizers",
      Sampling: "sampling",
    };
    
    const tableName = tableMap[categoryName];
    if (!tableName) return;

    try {
      const { data } = await supabase.from(tableName).select("*");
      setCategoryProducts(
        data
          ? data.map((p) => ({ ...p, table: tableName }))
          : []
      );
    } catch (error) {
      console.error(`Error fetching ${categoryName}:`, error);
      setCategoryProducts([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage products, approve sales, and monitor user activity
        </p>
      </div>

      {/* ================= TAB NAVIGATION ================= */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-2 sm:gap-4 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "approvals", label: "Approvals", icon: CheckCircle },
              { id: "products", label: "Products", icon: ShoppingCart },
              { id: "users", label: "Users", icon: Users },
              { id: "content", label: "Content", icon: FileText },
              { id: "messages", label: "Messages", icon: Mail },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition ${
                  activeTab === id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* ===== STATS GRID ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Products
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.totalSales}
                    </p>
                  </div>
                  <ShoppingCart className="text-blue-500 opacity-20" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Pending Approval
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.pendingApprovals}
                    </p>
                  </div>
                  <Clock className="text-orange-500 opacity-20" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Active Users
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.activeUsers}
                    </p>
                  </div>
                  <Users className="text-green-500 opacity-20" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Videos
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.totalVideos}
                    </p>
                  </div>
                  <Video className="text-purple-500 opacity-20" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-pink-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Posts
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.totalPosts}
                    </p>
                  </div>
                  <FileText className="text-pink-500 opacity-20" size={40} />
                </div>
              </div>
            </div>

            {/* ===== RECENT SALES ===== */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-green-600" />
                  Recent Products
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSales.map((product) => (
                      <tr key={`${product.table}-${product.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-11 rounded object-cover"
                            />
                            <span className="font-medium text-gray-900 truncate">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                          {product.table.slice(0, -1)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          ₹{product.price}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              product.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {product.approved ? (
                              <>
                                <CheckCircle size={14} /> Approved
                              </>
                            ) : (
                              <>
                                <Clock size={14} /> Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Pending Approvals
            </h2>
            {pendingProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <p className="text-gray-600">No pending approvals!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProducts.map((product) => (
                  <div
                    key={`${product.table}-${product.id}`}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="h-70 w-full overflow-hidden bg-gray-100">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 flex-1">
                          {product.name}
                        </h3>
                        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded capitalize">
                          {product.table.slice(0, -1)}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-4">
                        ₹{product.price}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        {new Date(product.created_at).toLocaleDateString()} •{" "}
                        {new Date(product.created_at).toLocaleTimeString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveProduct(product)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectProduct(product)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {!selectedCategory ? (
              <>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Manage Products
                  </h2>
                  <button
                    onClick={() => navigate("/admin/sales")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    View Full Management
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { name: "Seeds", icon: "🌱" },
                    { name: "Vegetables", icon: "🥬" },
                    { name: "Sampling", icon: "📊" },
                    { name: "Fertilizers", icon: "🧪" },
                    { name: "Tools", icon: "🔧" },
                  ].map((category) => (
                    <button
                      key={category.name}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        fetchCategoryProducts(category.name);
                      }}
                      className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition"
                    >
                      <p className="text-4xl mb-2">{category.icon}</p>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setCategoryProducts([]);
                      }}
                      className="text-green-600 hover:text-green-700 font-medium mb-2 flex items-center gap-2"
                    >
                      ← Back to Categories
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCategory} Products
                    </h2>
                  </div>
                  <p className="text-gray-600 font-medium">
                    Total: {categoryProducts.length}
                  </p>
                </div>

                {categoryProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-600">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                      >
                        <div className="h-70 w-full overflow-hidden bg-gray-100">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="max-h-72 w-full object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-900 flex-1">
                              {product.name}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                                product.approved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {product.approved ? "✓ Approved" : "⏳ Pending"}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-2">
                            ₹{product.price}
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            {new Date(product.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            {!product.approved && (
                              <button
                                onClick={() => handleApproveProduct(product)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition"
                              >
                                ✓ Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleRejectProduct(product)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                User Activity
              </h2>
              <button
                onClick={() => navigate("/admin/users")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                View All Users
              </button>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Active Users</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.activeUsers} users
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center h-48">
                  <p className="text-gray-600 text-center">
                    User analytics and activity monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === "content" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Videos Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Video className="text-purple-600" />
                    Videos
                  </h2>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.totalVideos}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/videos")}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition"
                >
                  Manage
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Upload and manage educational videos
                </p>
              </div>
            </div>

            {/* Posts Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="text-pink-600" />
                    Posts
                  </h2>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.totalPosts}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/posts")}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-medium transition"
                >
                  Manage
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Create and manage blog posts
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && <AdminMessages />}
      </div>
    </div>
  );
};

export default AdminDashboard;
