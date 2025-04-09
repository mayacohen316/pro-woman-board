import React, { useState } from "react";

const emojiList = [
  "🔥",
  "🌟",
  "💡",
  "🎯",
  "💪",
  "💖",
  "🧐",
  "🎉",
  "🌈",
  "📌",
  "🫔",
  "🎨",
  "🚀",
  "🍀",
  "👑",
  "📚",
  "🧩",
  "🌻",
  "✨",
];

const AddEmojiModal = ({ onClose, onSave, entities }) => {
  const [symbol, setSymbol] = useState("🔥");
  const [targetId, setTargetId] = useState(entities[0]?.id || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ symbol, targetId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl z-20"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">📌 Add Emoji</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Choose an emoji
            </label>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {emojiList.map((em) => (
                <div key={em} className="relative">
                  <button
                    type="button"
                    onClick={() => setSymbol(em)}
                    className={`text-xl w-12 h-12 flex items-center justify-center border rounded transition ${
                      symbol === em
                        ? "bg-yellow-100 border-yellow-500"
                        : "border-gray-300"
                    }`}
                  >
                    {em}
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              maxLength={2}
              className="w-full border border-gray-300 rounded px-2 py-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Connect to</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
              required
            >
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmojiModal;
