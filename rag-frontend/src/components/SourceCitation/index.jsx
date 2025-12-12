import React, { useState } from "react";

const SourceCitation = ({ source, index, isDark }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <span
        className={`
          inline-flex items-center px-2 py-1 text-xs font-medium rounded-md cursor-help
          ${
            isDark
              ? "text-blue-300 bg-blue-900/40"
              : "text-blue-700 bg-blue-100"
          }
        `}
      >
        [{index + 1}]
      </span>
      {showDetails && (
        <div
          className={`
            absolute z-10 w-80 p-4 mt-2 border rounded-lg shadow-lg
            ${
              isDark
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
        >
          <div className="mb-2">
            <p
              className={`
                text-xs font-semibold mb-1
                ${isDark ? "text-gray-200" : "text-gray-900"}
              `}
            >
              {source.filename}
            </p>
            <p
              className={`
                text-xs
                ${isDark ? "text-gray-400" : "text-gray-500"}
              `}
            >
              Chunk {source.chunkIndex}
            </p>
          </div>
          <div
            className={`
              text-xs p-2 rounded max-h-32 overflow-y-auto
              ${
                isDark
                  ? "text-gray-300 bg-gray-800"
                  : "text-gray-700 bg-gray-50"
              }
            `}
          >
            {source.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceCitation;
