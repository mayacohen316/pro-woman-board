import React, { useState } from "react";

const AddTextBubbleModal = ({ onClose, onSave, entities }) => {
  const [text, setText] = useState("");
  const [targetId, setTargetId] = useState(entities[0]?.id || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ text, targetId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Add Text Bubble</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTextBubbleModal;
