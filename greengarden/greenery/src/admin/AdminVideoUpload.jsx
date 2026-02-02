import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AdminVideoUpload = ({ isAdmin = true }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("device"); // device | link
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now());
  const [editingVideo, setEditingVideo] = useState(null);

  if (!isAdmin) {
    
  }

  /* ================= FETCH VIDEOS ================= */
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setVideos(data);
  };

  /* ================= HELPERS ================= */
  const isYouTube = (url) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const isInstagram = (url) =>
    url.includes("instagram.com/reel") || url.includes("instagram.com/p");

  const getYouTubeEmbed = (url) => {
    let id = "";
    if (url.includes("shorts/")) {
      id = url.split("shorts/")[1].split("?")[0];
    } else if (url.includes("v=")) {
      id = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      id = url.split("youtu.be/")[1].split("?")[0];
    }
    return `https://www.youtube.com/embed/${id}`;
  };

  const getInstagramEmbed = (url) => `${url}embed`;

  /* ================= UPLOAD / UPDATE ================= */
  const handleUpload = async (e) => {
    e.preventDefault();

    if (source === "device" && !file) {
      setMessage("Please select a video ❌");
      return;
    }

    if (source === "link" && !videoUrl) {
      setMessage("Please provide a video URL ❌");
      return;
    }

    setUploading(true);
    setMessage("");
    let finalUrl = videoUrl;

    try {
      /* ---- Device upload ---- */
      if (source === "device") {
        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("videos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("videos")
          .getPublicUrl(fileName);

        finalUrl = data.publicUrl;
      }

      /* ---- Edit ---- */
      if (editingVideo) {
        const { error } = await supabase
          .from("videos")
          .update({
            title: title.trim(),
            description: description.trim(),
            video_url: finalUrl,
          })
          .eq("id", editingVideo.id);

        if (error) throw error;

        setMessage("Video updated successfully ✅");
        setEditingVideo(null);
      }
      /* ---- Insert ---- */
      else {
        const { error } = await supabase.from("videos").insert([
          {
            title: title.trim(),
            description: description.trim(),
            video_url: finalUrl,
          },
        ]);

        if (error) throw error;

        setMessage("Video uploaded successfully ✅");
      }

      setTitle("");
      setDescription("");
      setFile(null);
      setVideoUrl("");
      setFileKey(Date.now());
      fetchVideos();
    } catch (err) {
      console.error(err);
      setMessage("Operation failed ❌ Check console");
    }

    setUploading(false);
  };

  /* ================= EDIT ================= */
  const handleEdit = (video) => {
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description);
    setVideoUrl(video.video_url);
    setSource("link");
  };

  /* ================= DELETE ================= */
  const handleDelete = async (video) => {
    if (!confirm("Delete this video?")) return;

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id);

    if (error) {
      console.error(error);
      return;
    }

    if (video.video_url.includes("supabase")) {
      const path =
        video.video_url.split("/storage/v1/object/public/videos/")[1];
      if (path) {
        await supabase.storage.from("videos").remove([path]);
      }
    }

    fetchVideos();
  };

  /* ================= UI ================= */
  return (
  <div className="p-6 w-full">
    <h2 className="text-2xl font-bold mb-4">
      {editingVideo ? "Edit Reel" : "Upload Reel"}
    </h2>

    {/* rest of your code stays SAME */}


      {/* Source */}
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

      {/* Form */}
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Video Title"
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
            required={!editingVideo}
          />
        ) : (
          <input
            type="url"
            placeholder="YouTube / Instagram Reel URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        )}

        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-green-700 text-white rounded"
        >
          {uploading ? "Processing..." : editingVideo ? "Update" : "Upload"}
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>

      {/* ================= REELS LIST ================= */}
      <h3 className="mt-10 mb-4 text-xl font-bold">Uploaded Reels</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-black rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="aspect-[9/16] w-full">
              {isYouTube(video.video_url) ? (
                <iframe
                  src={getYouTubeEmbed(video.video_url)}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : isInstagram(video.video_url) ? (
                <iframe
                  src={getInstagramEmbed(video.video_url)}
                  className="w-full h-full"
                  scrolling="no"
                />
              ) : (
                <video
                  src={video.video_url}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-2 text-white">
              <p className="font-bold text-sm line-clamp-1">{video.title}</p>
              <p className="text-xs text-gray-300 line-clamp-2">
                {video.description}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="px-2 py-1 bg-yellow-500 rounded text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(video)}
                  className="px-2 py-1 bg-red-600 rounded text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVideoUpload;
