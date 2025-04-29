import React, { useState, useEffect } from "react";

const UploadImageModal = ({ onClose, onSave, entities = [], isSaving }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isSaving]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert(
        "The selected image is too large. Please choose an image under 5MB."
      );
      return;
    }

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

    await onSave({ url: previewUrl, targetId }); // רק שולח ל-App
    onClose(); // סוגר רק אחרי שהשמירה הסתיימה
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <h2 className="text-2xl font-bold text-[#9d174d] mb-6 text-center">
          Upload Image
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={isSaving}
          />

          <div className="flex justify-center items-center min-h-[160px]">
            {isSaving ? (
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
            disabled={isSaving}
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
              disabled={isSaving}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded ${
                isSaving
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#9d174d] hover:bg-[#831843] text-white font-semibold"
              } flex items-center justify-center gap-2`}
            >
              {isSaving ? (
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
