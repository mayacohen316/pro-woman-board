import React, { useState } from "react";

const AddEntityModal = ({ onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contribution: "",
    linkedin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEntity = {
      ...formData,
      x: Math.random() * 800,
      y: Math.random() * 600,
    };

    // שולח ל-App שמירה ואז יחזור עם הנתונים ויעדכן את הגריד
    onSave(newEntity);
    onClose(); // סוגר מודאל
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold text-[#9d174d] mb-6 text-center">
          New Prowoman Participant
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            placeholder="שם"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="עיר"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="contribution"
            placeholder="תרומה ייחודית"
            value={formData.contribution}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="url"
            name="linkedin"
            placeholder="קישור ללינקדאין"
            value={formData.linkedin}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              cancel
            </button>
            <button
              type="submit"
              className={`${
                isSaving ? "bg-gray-300 cursor-not-allowed" : "bg-[#9d174d]"
              }  hover:bg-[#831843] text-white px-4 py-2 rounded`}
              disabled={isSaving} // אם יש לודר, לא לאפשר שמירה
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntityModal;
