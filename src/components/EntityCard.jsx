import React from "react";

const EntityCard = ({ entity }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-64">
      <h3 className="text-xl font-bold text-purple-700">{entity.name}</h3>
      <p className="text-gray-600">{entity.address}</p>
      <p className="italic text-sm text-purple-500 mt-1">
        {entity.contribution}
      </p>

      {entity.linkedin && (
        <p className="text-sm text-blue-600 underline break-all mt-2">
          <a href={entity.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      )}
    </div>
  );
};

export default EntityCard;
