import { Handle, Position } from "reactflow";
import { FiTrash2 } from "react-icons/fi";

const EntityNode = ({ data }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4 w-64 group">
      <Handle
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500"
      />

      {/* כפתור מחיקה על hover בלבד */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onDelete(data);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <FiTrash2 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>

      {/* כותרת */}
      <div
        className="font-bold text-xl mb-3 text-center"
        style={{ color: "#9d174d" }}
      >
        {data.label}
      </div>

      {/* גוף הטקסט */}
      <div className="text-sm text-gray-700 space-y-2">
        <div className="flex gap-1">
          <span className="font-semibold">City:</span>
          <span>{data.address || "-"}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-semibold">Unique Contribution:</span>
          <span>{data.contribution || "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          {data.linkedin ? (
            <a
              href={data.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm"
            >
              LinkedIn
            </a>
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityNode;
