import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import Layout from "./Layout";
import AuthLayout from "./AuthLayout";
import AdminLayout from "../admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ErrorPage from "../pages/ErrorPage";
import CartPage from "../pages/CartPage";
import LoginPage from "../pages/LoginPage";
import UserLogin from "../pages/UserLogin";
import UserRegister from "../pages/UserRegister";
import UserProfile from "../pages/UserProfile";

// Admin Pages
import AdminDashboard from "../admin/AdminDashboard";
import AdminVideoUpload from "../admin/AdminVideoUpload";
import Users from "../admin/Users";
import AdminPosts from "../admin/AdminPosts";
import AdminSales from "../admin/AdminSales";
import AdminMessages from "../admin/AdminMessages";
import AdminMessagesView from "../components/AdminMessagesView";


// Components
import Video from "../components/Video";
import Vegetable from "../components/Vegetable";
import Fertilizer from "../components/Fertilizer";
import Seeds from "../components/Seeds";
import ProductLayout from "../components/ProductLayout";
import Sampling from "../components/Sampling";
import Post from "../components/Post";


const router = createBrowserRouter([
  // 🔁 shortcut
  { path: "/a", element: <Navigate to="/admin" replace /> },

  // ================= ADMIN ROUTES =================
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "videos", element: <AdminVideoUpload /> },
      { path: "users", element: <Users /> },
      { path: "posts", element: <AdminPosts /> },
      { path: "sales", element: <AdminSales /> },
      { path: "messages", element: <AdminMessages /> },
      { path: "messages/view", element: <AdminMessagesView /> }
    ],
  },

  // ================= USER AUTH ROUTES =================
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/userlogin" replace /> }, // ✅ FIRST PAGE
      { path: "login", element: <LoginPage /> },
      { path: "userlogin", element: <UserLogin /> },
      { path: "register", element: <UserRegister /> },
    ],
  },

  // ================= MAIN APP ROUTES =================
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "home", element: <HomePage /> }, // optional
      { path: "about", element: <AboutPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "video", element: <Video /> },
      { path: "products", element: <ProductLayout /> },
      { path: "vegetable", element: <Vegetable /> },
      { path: "seeds", element: <Seeds /> },
      { path: "fertilizer", element: <Fertilizer /> },
      { path: "sampling", element: <Sampling /> },
      { path: "post", element: <Post /> },
      { path: "profile", element: <UserProfile /> },
      { path: "messages", element: <AdminMessagesView /> },
    ],
  },

  // ================= FALLBACK =================
  { path: "*", element: <ErrorPage /> },
]);

export default router;
