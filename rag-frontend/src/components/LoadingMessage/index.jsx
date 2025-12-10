import React from "react";

const LoadingMessage = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce text-blue-700"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
