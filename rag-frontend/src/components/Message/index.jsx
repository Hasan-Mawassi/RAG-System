import React from "react";
import SourceCitation from "../SourceCitation";

const Message = ({ message, isUser, showSources }) => {
  if (isUser || message?.role === "USER") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="animate-pulse inline-block">▍</span>
            )}
          </p>
        </div>
        {showSources && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Sources:</span>

            {/* For live responses (array directly returned) */}
            {Array.isArray(message.sources) &&
              message.sources.map((source, index) => (
                <SourceCitation key={index} source={source} index={index} />
              ))}

            {/*  For saved DB responses (message.sources.sourcesJson) */}
            {message.sources?.sourcesJson &&
              message.sources.sourcesJson.map((source, index) => (
                <SourceCitation key={index} source={source} index={index} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
