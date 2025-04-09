import React, { useState } from "react";

const AddEntityModal = ({ onClose, onSave, entity }) => {
  const [formData, setFormData] = useState({
    name: entity?.name || "",
    address: entity?.address || "",
    contribution: entity?.contribution || "",
    linkedin: entity?.linkedin || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(entity ? { ...entity, ...formData } : formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">
          {entity ? "Edit Entity" : "Add Entity"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="contribution"
            placeholder="Contribution"
            value={formData.contribution}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="linkedin"
            placeholder="LinkedIn URL"
            value={formData.linkedin}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="text-gray-600">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-1 rounded"
            >
              {entity ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntityModal;
