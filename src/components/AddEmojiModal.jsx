import React, { useState, useEffect } from "react";

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
  const [symbol, setSymbol] = useState(emojiList[0]);
  const [targetId, setTargetId] = useState("");
  const [isSaving, setIsSaving] = useState(false); // נוסיף סטייט

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSaving) {
        // לא לאפשר בריחה תוך כדי שמירה
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isSaving]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbol || !targetId) {
      alert("Please choose an emoji and entity.");
      return;
    }
    setIsSaving(true); // התחלת שמירה
    await onSave({ symbol, targetId }); // ממתין לסיום השמירה
    setIsSaving(false); // סיום שמירה
    onClose(); // רק אז סוגר
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-2xl font-bold text-[#9d174d] mb-6 text-center">
          Add Emoji
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-6 gap-2">
            {emojiList.map((em) => (
              <button
                key={em}
                type="button"
                className={`text-2xl p-2 border rounded ${
                  symbol === em
                    ? "bg-yellow-100 border-yellow-500"
                    : "border-gray-300"
                }`}
                onClick={() => setSymbol(em)}
                disabled={isSaving}
              >
                {em}
              </button>
            ))}
          </div>

          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-400"
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
              className="px-4 py-2 rounded bg-[#9d174d] hover:bg-[#831843] text-white font-semibold flex items-center justify-center gap-2"
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

export default AddEmojiModal;
