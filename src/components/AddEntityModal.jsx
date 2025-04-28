import React, { useState, useEffect } from "react";

const AddEntityModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contribution: "",
    linkedin: "",
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.contribution.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const newEntity = {
      ...formData,
      x: Math.random() * 800,
      y: Math.random() * 600,
    };

    onSave(newEntity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
          Add New Entity
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="City"
            value={formData.address}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="text"
            name="contribution"
            placeholder="Unique Contribution"
            value={formData.contribution}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="url"
            name="linkedin"
            placeholder="LinkedIn URL (Optional)"
            value={formData.linkedin}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-400"
          />

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntityModal;
