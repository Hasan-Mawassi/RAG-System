import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";

const FileUpload = ({ onUpload, isUploading }) => {
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
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
      } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
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
        className={`w-8 h-8 mx-auto mb-3 ${
          isDragging ? "text-blue-500" : "text-gray-400"
        }`}
      />
      <p className="text-sm font-medium text-gray-700 mb-1">
        {isUploading ? "Uploading..." : "Drop PDF here or click to upload"}
      </p>
      <p className="text-xs text-gray-500">PDF files only</p>
    </div>
  );
};

export default FileUpload;
