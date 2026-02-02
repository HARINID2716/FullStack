import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import { supabase } from "../config/supabase";

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      if (!currentUser) {
        if (isMounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          navigate("/login");
        }
        return;
      }

      // Check admin flag from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        if (isMounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          navigate("/");
        }
        return;
      }

      if (isMounted) {
        setUser(currentUser);
        setIsAdmin(true);
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setUser(null);
        setIsAdmin(false);
        navigate("/login");
        return;
      }

      // On any other session change (SIGNED_IN, TOKEN_REFRESH, INITIAL_SESSION), re-check admin status
      if (session) {
        checkUser();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main content */}
      <div className="ml-20 md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
