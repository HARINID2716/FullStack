import React, { useEffect, useState } from "react";
import supabase from "../config/supabase";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all admin messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("admin_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch messages error:", error.message);
      setMessages([]);
      return;
    }

    setMessages(data || []);
  };

  useEffect(() => {
    const initializeMessages = () => {
      fetchMessages();
    };
    initializeMessages();
  }, []);

  // Create a new admin message
  const createMessage = async () => {
    if (!title || !content) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      alert("You must be logged in");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("admin_messages").insert([
      {
        title,
        content,
        admin_id: userData.user.id,
      },
    ]);

    if (error) {
      console.error(error.message);
      alert("Failed to create message");
      setLoading(false);
      return;
    }

    setTitle("");
    setContent("");
    fetchMessages();
    setLoading(false);
  };

  // Delete an admin message
  const deleteMessage = async (messageId) => {
    const { error } = await supabase
      .from("admin_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error(error.message);
      alert("Failed to delete message");
      return;
    }

    setMessages(messages.filter((m) => m.id !== messageId));
  };

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Admin Messages</h1>

      {/* Create Message Form */}
      <div className="mb-8 p-4 bg-blue-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Post New Message</h2>
        <input
          type="text"
          placeholder="Message Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />
        <textarea
          placeholder="Message Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />
        <button
          onClick={createMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Posting..." : "Post Message"}
        </button>
      </div>

      {/* Messages List */}
      <h2 className="text-xl font-semibold mb-4">All Messages</h2>
      {messages.length === 0 && <p className="text-gray-400">No messages yet</p>}

      {messages.map((message) => (
        <div key={message.id} className="mb-4 p-4 bg-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{message.title}</h3>
              <p className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => deleteMessage(message.id)}
              className="text-red-500 hover:text-red-700 text-sm font-semibold"
            >
              Delete
            </button>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminMessages;
