import React from "react";
import { FileText, Trash2 } from "lucide-react";
const getFileIconColor = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return "text-red-600";
    case "doc":
    case "docx":
      return "text-blue-600";
    case "xlsx":
      return "text-green-600";
    case "txt":
      return "text-black";
    default:
      return "text-gray-400";
  }
};
const DocumentList = ({ documents, onDelete, isLoading ,isDark}) => {
  return (
    <div className="space-y-2">
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No documents uploaded in this chat
        </div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.documentId}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText
                className={`w-5 h-5 ${getFileIconColor(doc.filename)} shrink-0`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {doc.filename}
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {doc.chunksProcessed} chunks
                </p>
              </div>
            </div>

            <button
              onClick={() => onDelete(doc.documentId)}
              disabled={isLoading}
              className={`p-2 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ${
                isDark ? "text-gray-300" : "text-gray-500"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentList;
