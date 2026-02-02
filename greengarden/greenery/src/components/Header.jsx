import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react";
import AdminMessagesView from "./AdminMessagesView";
import { useCart } from "../context/CartContext";
import supabase from "../config/supabase";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [potsOpen, setPotsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  // 🔐 Auth
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const potsRef = useRef(null);
  const profileRef = useRef(null);

  // ✅ Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Get user + listen auth changes
  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        console.log("✅ Current User:", currentUser);
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();
          
          console.log("✅ Profile Data:", profileData);
          if (error) {
            console.error("❌ Profile fetch error:", error);
          }
          
          setProfile(profileData || null);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("❌ Fetch user error:", err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("🔄 Auth state changed:", _event);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();
          
          console.log("✅ Updated Profile:", profileData);
          if (error) {
            console.error("❌ Profile update error:", error);
          }
          
          setProfile(profileData || null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (potsRef.current && !potsRef.current.contains(event.target)) {
        setPotsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("isAdmin");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      setUser(null);
      setProfile(null);
      navigate("/userlogin", { replace: true });
      // Hard fallback to ensure redirect even if navigation hook fails
      setTimeout(() => {
        if (window.location.pathname !== "/userlogin") {
          window.location.assign("/userlogin");
        }
      }, 150);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-40 transition ${
          scrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between px-6 py-4 transition ${
            scrolled
              ? "max-w-full"
              : "max-w-6xl bg-white rounded-full shadow-lg mt-4"
          }`}
        >
          {/* Logo */}
          <img
            src="https://ik.imagekit.io/hhqmo4nv4/MERN/logo.svg"
            alt="Logo"
            className="h-10 cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex gap-6 font-medium items-center">
            <Link to="/">Home</Link>

            <div className="relative" ref={potsRef}>
              <button onClick={() => setPotsOpen(!potsOpen)}>
                Sales ▾
              </button>
              {potsOpen && (
                <div className="absolute top-full mt-2 w-44 bg-white shadow rounded-lg">
                  <Link to="/seeds" className="block px-4 py-2 hover:text-green-600">Seeds</Link>
                  <Link to="/vegetable" className="block px-4 py-2 hover:text-green-600">Vegetable</Link>
                  <Link to="/products" className="block px-4 py-2 hover:text-green-600">Sampling</Link>
                  <Link to="/sampling" className="block px-4 py-2 hover:text-green-600">Tools</Link>
                </div>
              )}
            </div>

            <Link to="/post" className="hover:text-green-600">Post</Link>
            <Link to="/video" className="hover:text-green-600">Video</Link>
            <Link to="/fertilizer" className="hover:text-green-600">Fertilizer</Link>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1 bg-green-700 px-3 py-1 rounded text-white"
            >
              <ShoppingCart size={20} />
              {cartCount}
            </button>

            {/* PROFILE / LOGOUT */}
            {user && !userLoading ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded cursor-pointer transition"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                      {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">
                    {profile?.full_name || user.email?.split("@")[0] || "User"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-lg rounded-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {profile?.full_name || user.email || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      👤 My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileOpen(false);
                      }}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400"
                    >
                      🚪 {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : userLoading ? (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <Link
                to="/userlogin"
                className="bg-green-600 px-3 py-1 rounded text-white"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile menu */}
          <button className="md:hidden" onClick={() => setMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-between px-6 py-4 border-b">
            <img
              src="https://ik.imagekit.io/hhqmo4nv4/MERN/logo.svg"
              className="h-10"
              alt="Logo"
            />
            <button onClick={() => setMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>

          <div className="px-8 py-6 space-y-4">
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>

            <button
              onClick={() => {
                navigate("/cart");
                setMenuOpen(false);
              }}
              className="bg-green-700 text-white w-full py-2 rounded"
            >
              Cart ({cartCount})
            </button>

            {user ? (
              <>
                <div className="text-center py-3 border-b">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-2">
                      {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-900">
                    {profile?.full_name || user.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center bg-blue-600 text-white py-2 rounded mb-2"
                >
                  👤 My Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  🚪 {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <Link
                to="/userlogin"
                onClick={() => setMenuOpen(false)}
                className="block text-center bg-green-600 text-white py-2 rounded"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="h-16"></div>
    </>
  );
};

export default Header;
