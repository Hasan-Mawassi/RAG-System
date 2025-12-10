import React, { useState } from "react";

const SourceCitation = ({ source, index }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md cursor-help">
        [{index + 1}]
      </span>
      {showDetails && (
        <div className="absolute z-10 w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-900 mb-1">
              {source.filename}
            </p>
            <p className="text-xs text-gray-500">Chunk {source.chunkIndex}</p>
          </div>
          <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
            {source.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceCitation;
