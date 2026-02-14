import React, { useEffect, useState } from "react";
import supabase from "../config/supabase";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch logged-in user
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) setUser(data.user);
  };

  // Fetch posts with nested comments
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        content,
        admin_id,
        created_at,
        comments (
          id,
          comment,
          user_id,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch posts error:", error.message);
      setPosts([]);
      return;
    }

    setPosts(data || []);
  };

  useEffect(() => {
    const initializeData = () => {
      fetchPosts();
      fetchUser();
    };
    initializeData();
  }, []);

  // Add a new post (users only)
  const createPost = async () => {
    if (!title || !content) {
      alert("Fill all fields");
      return;
    }

    if (!user) {
      alert("Login required");
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        admin_id: user.id, // For users, this is still stored in admin_id column
      },
    ]);

    if (error) {
      console.error(error.message);
      alert("Failed to create post");
      return;
    }

    setTitle("");
    setContent("");
    fetchPosts();
  };

  // Delete a post (users can delete their own)
  const deletePost = async (postId, ownerId) => {
    if (!user || user.id !== ownerId) {
      alert("You can delete only your own post");
      return;
    }

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.error(error.message);
      alert("Failed to delete post");
      return;
    }

    setPosts(posts.filter((p) => p.id !== postId));
  };

  // Add a comment
  const addComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    if (!user) {
      alert("Please login to reply");
      return;
    }

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: user.id,
        comment: text,
      },
    ]);

    if (error) {
      console.error(error.message);
      alert("Failed to post comment");
      return;
    }

    setCommentText({ ...commentText, [postId]: "" });
    fetchPosts();
  };

  // Delete a comment (users can delete only own comments)
  const deleteComment = async (commentId, commentUserId) => {
    if (!user || user.id !== commentUserId) {
      alert("You can delete only your own comment");
      return;
    }

    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      console.error(error.message);
      alert("Failed to delete comment");
      return;
    }

    fetchPosts();
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Posts</h1>

      {/* CREATE POST */}
      {user && (
        <div className="mb-6 p-4 bg-gray-800 rounded">
          <input
            type="text"
            placeholder="Post title"
            className="w-full p-2 mb-2 rounded text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Post content"
            className="w-full p-2 mb-2 rounded text-black"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={createPost}
            className="bg-green-600 px-4 py-2 rounded text-white"
          >
            Create Post
          </button>
        </div>
      )}

      {/* POSTS LIST */}
      {posts.length === 0 && <p className="text-gray-400">No posts yet</p>}

      {posts.map((post) => (
        <div key={post.id} className="bg-gray-800 p-5 mb-6 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{post.title}</h2>

            {user?.id === post.admin_id && (
              <button
                onClick={() => deletePost(post.id, post.admin_id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete Post
              </button>
            )}
          </div>

          <p className="text-gray-300 mb-4">{post.content}</p>
          <p className="text-xs text-gray-500 mb-2">
            Posted: {new Date(post.created_at).toLocaleString()}
          </p>

          {/* COMMENTS */}
          <div className="space-y-1 mb-2">
            {post.comments?.map((c) => (
              <div
                key={c.id}
                className="flex justify-between text-sm text-gray-400"
              >
                <span>💬 {c.comment}</span>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => deleteComment(c.id, c.user_id)}
                    className="text-red-400 text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ADD COMMENT */}
          {user && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Write a reply..."
                className="w-full p-2 rounded text-black placeholder-gray-500"
                value={commentText[post.id] || ""}
                onChange={(e) =>
                  setCommentText({ ...commentText, [post.id]: e.target.value })
                }
              />
              <button
                onClick={() => addComment(post.id)}
                className="mt-2 bg-blue-600 px-4 py-1 rounded hover:bg-blue-700"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Post;
