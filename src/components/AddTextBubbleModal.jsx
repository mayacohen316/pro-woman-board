import React, { useState, useEffect } from "react";

const AddTextBubbleModal = ({ onClose, onSave, entities, isLoading }) => {
  const [text, setText] = useState("");
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    if (!targetId) {
      alert("Please select an entity to connect the bubble.");
      return;
    }

    onSave({ text: text.trim(), targetId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-2xl font-bold text-pink-500 mb-6 text-center">
          Add Text Bubble
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-pink-400"
            required
          />

          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-pink-400"
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
              disabled={isLoading} // החסמת כפתור אם יש לודר
              className={`px-4 py-2 rounded ${
                isLoading
                  ? "bg-pink-300 cursor-not-allowed"
                  : "bg-pink-500 hover:bg-pink-600 text-white font-semibold"
              }`}
            >
              {isLoading ? (
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

export default AddTextBubbleModal;
