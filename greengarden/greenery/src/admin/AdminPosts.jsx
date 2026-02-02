import { useEffect, useState } from "react";
import supabase from "../config/supabase";

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch all posts
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch posts error:", error.message);
      setPosts([]);
      return;
    }

    setPosts(data || []);
  };

  // Delete any post (admin)
  const deletePost = async (postId) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.error(error.message);
      alert("Failed to delete post");
      return;
    }

    setPosts(posts.filter((p) => p.id !== postId));
  };

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Admin Posts</h1>

      {posts.length === 0 && <p className="text-gray-400">No posts found</p>}

      {posts.map((post) => (
        <div key={post.id} className="mb-4 p-4 bg-gray-200 rounded">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">{post.title}</h2>
            <button
              onClick={() => deletePost(post.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete Post
            </button>
          </div>
          <p className="text-gray-700">{post.content}</p>
          <p className="text-xs text-gray-500">
            Posted: {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminPosts;
