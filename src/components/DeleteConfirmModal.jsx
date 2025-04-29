import React from "react";

const DeleteConfirmModal = ({ onCancel, onConfirm, isEntity, isDeleting }) => (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-96 text-center space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        {isEntity ? "Delete Entity?" : "Delete Item?"}
      </h2>
      <p className="text-gray-500">
        {isEntity
          ? "Deleting this entity will also remove all linked items."
          : "This action cannot be undone."}
      </p>

      <div className="flex justify-center gap-4 pt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className={`px-5 py-2 rounded-lg ${
            isDeleting
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          } text-white transition flex items-center justify-center gap-2`}
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;
