import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";

const FileUpload = ({ onUpload, isUploading , isDark }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length > 0) {
      onUpload(pdfFiles[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onUpload(file);
    }
  };

  return (
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
        accept=".pdf"
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
              : isDark
              ? "text-gray-400"
              : "text-gray-400"
          }
        `}
      />
      <p
        className={`
          text-sm font-medium mb-1
          ${isDark ? "text-gray-200" : "text-gray-700"}
        `}
      >
        {isUploading ? "Uploading..." : "Drop PDF here or click to upload"}
      </p>
      <p
        className={`
          text-xs
          ${isDark ? "text-gray-400" : "text-gray-500"}
        `}
      >
        PDF files only
      </p>
    </div>
  );
};

export default FileUpload;
