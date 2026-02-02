import { useEffect, useState } from "react";
import supabase from "../config/supabase";

const AdminMessagesView = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  // Fetch all admin messages
  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch messages error:", error.message);
      setMessages([]);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center p-6">Loading admin messages...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Admin Messages</h2>

      {messages.length === 0 && (
        <p className="text-gray-500 text-center">No admin messages yet</p>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 rounded"
        >
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            {message.title}
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-3">
            {message.content}
          </p>
          <p className="text-xs text-gray-500">
            Posted: {new Date(message.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminMessagesView;
