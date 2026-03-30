import imageCompression from "browser-image-compression";
import { useRef, useState } from "react";
import { convertToWebP } from "../../utils/webPConverter";

export default function ImageUploader({
  onUpload,
  multiple = false,
}: {
  onUpload: (files: File[]) => Promise<void>;
  multiple?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    try {
      setLoading(true);

      const list = Array.isArray(files) ? files : Array.from(files);
      const imageFiles = list.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      const toProcess = multiple ? imageFiles : [imageFiles[0]];

      const webpFiles = await Promise.all(
        toProcess.map(async (file) => {
          const compressed = await imageCompression(file, {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          });

          const webp = await convertToWebP(compressed);

          return webp;
        }),
      );

      await onUpload(webpFiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full'>
      <label
        className={[
          "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--accent-primary)] hover:bg-[var(--accent-light-hover)] rounded-lg cursor-pointer transition-colors duration-200",
          isDragging || loading ? "animate-border" : "",
        ].join(" ")}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          if (e.dataTransfer?.files?.length)
            void handleFiles(e.dataTransfer.files);
        }}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          multiple={multiple}
          className='hidden'
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />

        <div className='text-center'>
          <p className='text-sm text-[var(--text-secondary)]'>
            Drag & drop or click to upload
          </p>
          <p className='text-xs text-[var(--text-muted)]'>
            PNG, JPG, WebP (max 800px)
          </p>
        </div>
      </label>
    </div>
  );
}
