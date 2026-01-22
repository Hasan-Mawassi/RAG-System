import React, { useState, useRef } from "react";
import { Upload, AlertCircle } from "lucide-react";

// Supported document MIME types from backend
const SUPPORTED_MIME_TYPES = [
  "application/pdf", // PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "text/plain", // TXT
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
];

// Human-readable file extensions
const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".xlsx"];
const FILE_SIZE_LIMITS_MB = {
  "application/pdf": 10,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10, // DOCX
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 5, // XLSX
  "text/plain": 2,
};
const validateFile = (file) => {
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload PDF, DOCX, XLSX, or TXT.";
  }

  const maxSizeMB = FILE_SIZE_LIMITS_MB[file.type];
  if (!maxSizeMB) {
    return "File type is not allowed.";
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File too large. Max allowed for this file type is ${maxSizeMB} MB.`;
  }

  return null;
};

const FileUpload = ({ onUpload, isUploading, isDark }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);



  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
      setError("");
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = ""; // reset input
      return;
    }

    setError("");
    onUpload(file);
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${
            isDragging
              ? isDark
                ? "border-blue-400 bg-blue-900/20"
                : "border-blue-500 bg-blue-50"
              : isDark
                ? "border-gray-700 hover:border-blue-400 hover:bg-gray-800"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <Upload
          className={`
            w-8 h-8 mx-auto mb-3
            ${
              isDragging
                ? isDark
                  ? "text-blue-400"
                  : "text-blue-500"
                : "text-gray-400"
            }
          `}
        />

        <p
          className={`text-sm font-medium mb-1 ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {isUploading
            ? "Uploading..."
            : "Drop document here or click to upload"}
        </p>

        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Supported: PDF, DOCX, XLSX, TXT
        </p>
      </div>

      {error && (
        <div
          className={`mt-2 flex items-center gap-2 text-xs ${
            isDark ? "text-red-400" : "text-red-600"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
