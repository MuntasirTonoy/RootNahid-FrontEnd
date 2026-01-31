"use client";

import { useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "rootover_unsigned",
    );

    try {
      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success("Image uploaded successfully!");
      } else {
        console.error("Cloudinary Error:", data);
        toast.error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Something went wrong during upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="form-control w-full space-y-2">
      <label className="label">
        <span className="label-text font-bold text-lg flex items-center gap-2 text-foreground">
          <ImageIcon className="w-5 h-5 text-primary" />
          {label || "Course Thumbnail"}
        </span>
      </label>

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-border h-[216px] bg-muted/20 w-full">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={removeImage}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`
            relative block w-full h-[216px] rounded-2xl border-2 border-dashed 
            ${uploading ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/10"} 
            transition-all cursor-pointer overflow-hidden
          `}
        >
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-primary">
                  Uploading image...
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <div className="text-center group-hover:translate-y-[-2px] transition-transform">
                  <p className="text-sm font-bold text-foreground">
                    Click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or WEBP (Max 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
