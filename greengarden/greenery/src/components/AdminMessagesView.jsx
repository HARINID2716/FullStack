import React, { useEffect, useState } from "react";
import supabase from "../config/supabase";
import { Bell, X } from "lucide-react";

const AdminMessagesView = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <>
      {/* Bell Icon in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
        title="Admin Messages"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {messages.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {messages.length > 9 ? "9+" : messages.length}
          </span>
        )}
      </button>

      {/* Messages Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">📢 Admin Messages</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-800 p-1 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {loading ? (
                <div className="text-center text-gray-500 py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No admin messages</div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-600 rounded-lg hover:shadow-md transition"
                    >
                      <h3 className="font-bold text-lg text-green-800 mb-2">
                        {message.title}
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">{message.content}</p>
                      <p className="text-xs text-gray-500">
                        📅 {new Date(message.created_at).toLocaleDateString()} at{" "}
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-100 p-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminMessagesView;
