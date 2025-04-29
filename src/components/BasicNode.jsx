import { Handle, Position } from "reactflow";
import { FiTrash2 } from "react-icons/fi";

const BasicNode = ({ id, type, data }) => {
  return (
    <div className="relative bg-white border rounded-md shadow-sm p-2 w-40 group">
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-gray-500"
      />

      {/* כפתור מחיקה ב-hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onDelete(id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <FiTrash2 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>

      <div className="flex flex-col items-center justify-center h-full">
        {data.url ? (
          <img
            src={data.url}
            alt="Uploaded"
            className="max-w-full max-h-32 object-contain rounded"
          />
        ) : (
          <div className="text-center text-gray-800">{data.label}</div>
        )}
      </div>
    </div>
  );
};

export default BasicNode;
