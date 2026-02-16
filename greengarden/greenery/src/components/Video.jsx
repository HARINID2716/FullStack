import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabase";

const Video = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("device");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(() => Date.now());

  /* ================= AUTH USER ================= */
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  /* ================= FETCH VIDEOS ================= */
  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    setVideos(data || []);
  };

  useEffect(() => {
    const initializeData = () => {
      getUser();
      fetchVideos();
    };
    initializeData();
  }, []);

  /* ================= HELPERS ================= */
  const isYouTube = (url) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const isInstagram = (url) =>
    url.includes("instagram.com/reel") || url.includes("instagram.com/p");

  const getYouTubeEmbed = (url) => {
    let id = "";
    if (url.includes("shorts/")) id = url.split("shorts/")[1]?.split("?")[0];
    else if (url.includes("v=")) id = url.split("v=")[1]?.split("&")[0];
    else if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  };

  const getInstagramEmbed = (url) => `${url}embed`;

  /* ================= UPLOAD ================= */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) return setMessage("Please login ❌");

    setUploading(true);
    let finalUrl = videoUrl;

    try {
      if (source === "device") {
        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from("videos").upload(fileName, file);
        finalUrl = supabase.storage.from("videos").getPublicUrl(fileName).data.publicUrl;
      }

      await supabase.from("videos").insert([
        {
          title,
          description,
          video_url: finalUrl,
          user_id: user.id,
          is_admin: false, // 🔒 USER VIDEO
        },
      ]);

      setMessage("Uploaded successfully ✅");
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setFile(null);
      setFileKey(Date.now());
      fetchVideos();
    } catch (err) {
      console.error(err);
      setMessage("Upload failed ❌");
    }

    setUploading(false);
  };

  /* ================= DELETE (USER OWN ONLY) ================= */
  const handleDelete = async (video) => {
    if (!confirm("Delete this video?")) return;

    await supabase.from("videos").delete().eq("id", video.id);

    if (video.video_url.includes("supabase")) {
      const path = video.video_url.split("/storage/v1/object/public/videos/")[1];
      if (path) await supabase.storage.from("videos").remove([path]);
    }

    fetchVideos();
  };

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Reel</h2>
        <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setSource("device")}
          className={`px-4 py-2 rounded ${
            source === "device" ? "bg-green-700 text-white" : "bg-gray-200"
          }`}
        >
          My Device
        </button>
        <button
          type="button"
          onClick={() => setSource("link")}
          className={`px-4 py-2 rounded ${
            source === "link" ? "bg-green-700 text-white" : "bg-gray-200"
          }`}
        >
          Link 
        </button>
      </div>
      <form onSubmit={handleUpload} className="space-y-4 max-w-xl">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />

        {source === "device" ? (
          <input
            key={fileKey}
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        ) : (
          <input
            type="url"
            placeholder="YouTube / Instagram URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}

        <button
          className="bg-green-700 text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {message && <p>{message}</p>}
      </form>

      {/* ================= VIDEOS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {videos.map((video) => {
          const canDelete =
            user?.id === video.user_id && video.is_admin === false;

          return (
            <div key={video.id} className="bg-black rounded-xl overflow-hidden">
              <div className="aspect-[9/16]">
                {isYouTube(video.video_url) ? (
                  <iframe src={getYouTubeEmbed(video.video_url)} className="w-full h-full" />
                ) : isInstagram(video.video_url) ? (
                  <iframe src={getInstagramEmbed(video.video_url)} className="w-full h-full" />
                ) : (
                  <video src={video.video_url} controls className="w-full h-full object-cover" />
                )}
              </div>

              <div className="p-2 text-white">
                <p className="font-bold text-sm">{video.title}</p>

                {/* ✅ USER DELETE OWN | ❌ ADMIN VIDEO LOCKED */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(video)}
                    className="mt-2 text-xs bg-red-600 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Video;
