import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  defaultImage?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  defaultImage,
  className = "",
}) => {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Local preview
      setPreview(URL.createObjectURL(file));
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", file);

      try {
        // Assume API client or fetch is used here. 
        // Using fetch directly for simplicity, but ideally should use API client from context
        const token = localStorage.getItem("token"); // Or however auth is handled
        const res = await fetch("http://localhost:3001/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Upload failed");
        }

        onUpload(data.data.url);
      } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.message || "Failed to upload image");
        setPreview(defaultImage || null); // Revert preview
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, defaultImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUpload("");
  };

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50/50"
          : "border-gray-300 hover:border-gray-400"
      } ${className}`}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <p className="text-sm text-gray-500">Uploading...</p>
        </div>
      ) : preview ? (
        <div className="relative group flex justify-center">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 rounded-md object-contain"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-gray-500">
          <Upload className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop image here" : "Click or drag image to upload"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
