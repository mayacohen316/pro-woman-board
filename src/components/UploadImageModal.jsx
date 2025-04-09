import React, { useState } from "react";

const UploadImageModal = ({ onClose, onSave, entities }) => {
  const [image, setImage] = useState(null);
  const [targetId, setTargetId] = useState(entities[0]?.id || "");

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onSave({ url: reader.result, targetId });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Upload Image</h2>

        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="border p-2 rounded mb-4 w-full"
        >
          {entities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;
