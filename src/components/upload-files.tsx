"use client";

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
} from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function UploadFiles({
  initialFiles,
  onFilesChange,
  disabled,
}: {
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileMetadata[]) => void;
  disabled?: boolean;
}) {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB default
  const maxFiles = 6;
  const isInitialMount = useRef(true);
  const [localFiles, setLocalFiles] = useState<FileMetadata[]>(
    initialFiles || []
  );
  const onFilesChangeRef = useRef(onFilesChange);

  useEffect(() => {
    onFilesChangeRef.current = onFilesChange;
  }, [onFilesChange]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (initialFiles) {
      setLocalFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleFilesChange = useCallback((newFiles: FileMetadata[]) => {
    setLocalFiles(newFiles);
    if (onFilesChangeRef.current) {
      onFilesChangeRef.current(newFiles);
    }
  }, []);

  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    multiple: true,
    maxFiles,
    initialFiles,
    onFilesChange: (uploadedFiles) => {
      const fileMetadata = uploadedFiles.map((f) => {
        const file = f.file instanceof File ? f.file : undefined;
        const url = file ? URL.createObjectURL(file) : f.preview || "";
        return {
          id: f.id,
          name: f.file.name,
          size: f.file.size,
          type: f.file.type,
          url,
          file,
        } satisfies FileMetadata;
      });
      handleFilesChange(fileMetadata);
    },
  });

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      if (disabled) return;
      const fileToRemove = localFiles.find((f) => f.id === fileId);
      if (
        fileToRemove?.file instanceof File &&
        fileToRemove.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      removeFile(fileId);
      const remainingFiles = localFiles.filter((f) => f.id !== fileId);
      handleFilesChange(remainingFiles);
    },
    [disabled, localFiles, handleFilesChange, removeFile]
  );

  const handleClearFiles = useCallback(() => {
    if (disabled) return;
    localFiles.forEach((file) => {
      if (file.file instanceof File && file.url.startsWith("blob:")) {
        URL.revokeObjectURL(file.url);
      }
    });
    clearFiles();
    handleFilesChange([]);
  }, [disabled, clearFiles, handleFilesChange, localFiles]);

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={!disabled ? handleDragEnter : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        data-dragging={isDragging || undefined}
        data-files={localFiles.length > 0 || undefined}
        className={`border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Glissez vos images ici</p>
          <p className="text-muted-foreground text-xs">
            SVG, PNG, JPG ou GIF (max. {maxSizeMB}MB)
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={openFileDialog}
            disabled={disabled}
          >
            <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
            Selectionner des images
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File list */}
      {localFiles.length > 0 && (
        <div className="space-y-2">
          {localFiles.map((file) => (
            <div
              key={file.id}
              className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-accent aspect-square shrink-0 rounded">
                  <Image
                    src={file.url}
                    alt={file.name}
                    width={100}
                    height={100}
                    className="size-10 rounded-[inherit] object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate max-w-[200px] overflow-hidden text-[13px] font-medium">
                    {file.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                onClick={() => handleRemoveFile(file.id)}
                aria-label="Supprimer le fichier"
                disabled={disabled}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          ))}

          {/* Remove all files button */}
          {localFiles.length > 1 && (
            <div className="flex justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFiles}
                disabled={disabled}
              >
                Supprimer toutes les images
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
