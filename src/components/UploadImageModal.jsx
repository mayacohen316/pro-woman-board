import React, { useState, useEffect } from "react"; // יש לוודא ש-import של useState קיים
import { supabase } from "../supabaseClient"; // ודא שזה הנתיב הנכון

const UploadImageModal = ({
  onClose,
  onSave,
  entities = [],
  setIsSaving,
  isSaving,
  setShowImageModal, // קבלת setShowImageModal כפרופס
}) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [targetId, setTargetId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert(
        "The selected image is too large. Please choose an image under 5MB."
      );
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 800;
        const scaleFactor = Math.min(1, maxWidth / img.width);

        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

        setPreviewUrl(compressedDataUrl);
        setFile(selectedFile);
        setIsUploading(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !previewUrl) {
      alert("Please select an image.");
      return;
    }
    if (!targetId) {
      alert("Please select an entity to connect to.");
      return;
    }

    setIsUploading(true);

    try {
      const { data, error } = await supabase
        .from("images")
        .insert([
          {
            url: previewUrl,
            targetId,
            x: Math.random() * 500,
            y: Math.random() * 500,
          },
        ])
        .select();

      if (!error && data && data.length > 0) {
        // אחרי השמירה, נקרא ל- onSave שנמצא ב-App.js
        onSave(data[0]);

        // סגירת המודל אחרי השמירה
        setShowImageModal(false);
      } else {
        console.error("❌ Error uploading image:", error);
        alert("Something went wrong while uploading the image.");
      }
    } catch (err) {
      console.error("❌ Unexpected error in UploadImageModal:", err);
      alert("Unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false); // כיבוי הלודר אחרי השמירה
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
          Upload Image
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* Preview Image or Loader */}
          <div className="flex justify-center items-center min-h-[160px]">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-40 object-contain border rounded mt-2"
                />
              )
            )}
          </div>

          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          >
            <option value="">Select Entity</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading} // חסום כפתור שמירה אם יש לודר
              className={`px-4 py-2 rounded ${
                isUploading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white font-semibold"
              }`}
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadImageModal;
