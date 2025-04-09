import React, { useState } from "react";

const EditableTextBubble = ({ bubble, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(bubble.text);

  const handleSave = () => {
    onUpdate({ ...bubble, text });
    setIsEditing(false);
  };

  return (
    <div className="relative bg-yellow-100 rounded px-3 py-2 text-black w-fit">
      {isEditing ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
            rows={2}
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={handleSave}
              className="text-xs text-green-600 hover:underline"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div onClick={() => setIsEditing(true)} className="cursor-pointer">
          {bubble.text}
        </div>
      )}
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
      >
        ×
      </button>
    </div>
  );
};

export default EditableTextBubble;
