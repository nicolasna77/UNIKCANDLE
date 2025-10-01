"use client";

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatBytes, type FileMetadata } from "@/hooks/use-file-upload";
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
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const generateUniqueId = (file: File): string => {
    return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      console.log("🔍 handleFileSelect appelé avec:", files);
      if (!files || files.length === 0) return;

      const validateFile = (file: File): string | null => {
        if (file.size > maxSize) {
          return `Le fichier "${file.name}" dépasse la taille maximale de ${formatBytes(maxSize)}.`;
        }

        const acceptedTypes =
          "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif"
            .split(",")
            .map((type) => type.trim());
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0];
            return file.type.startsWith(`${baseType}/`);
          }
          return file.type === type;
        });

        if (!isAccepted) {
          return `Le fichier "${file.name}" n'est pas un type de fichier accepté.`;
        }

        return null;
      };

      const newErrors: string[] = [];
      const newFiles: FileMetadata[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          // Vérifier si on ne dépasse pas le nombre maximum de fichiers
          if (localFiles.length + newFiles.length >= maxFiles) {
            newErrors.push(
              `Vous ne pouvez uploader qu'un maximum de ${maxFiles} fichiers.`
            );
            return;
          }

          const url = URL.createObjectURL(file);
          newFiles.push({
            id: generateUniqueId(file),
            name: file.name,
            size: file.size,
            type: file.type,
            url,
            file,
          });
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        return;
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...localFiles, ...newFiles];
        console.log("✅ Nouveaux fichiers ajoutés:", updatedFiles);
        handleFilesChange(updatedFiles);
        setErrors([]);
      } else {
        console.log("⚠️ Aucun fichier valide à ajouter");
      }
    },
    [localFiles, maxFiles, handleFilesChange, maxSize]
  );

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
      const remainingFiles = localFiles.filter((f) => f.id !== fileId);
      handleFilesChange(remainingFiles);
    },
    [disabled, localFiles, handleFilesChange]
  );

  const handleClearFiles = useCallback(() => {
    if (disabled) return;
    localFiles.forEach((file) => {
      if (file.file instanceof File && file.url.startsWith("blob:")) {
        URL.revokeObjectURL(file.url);
      }
    });
    handleFilesChange([]);
  }, [disabled, handleFilesChange, localFiles]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [disabled, handleFileSelect]
  );

  const openFileDialog = useCallback(() => {
    console.log("🖱️ openFileDialog appelé, disabled:", disabled);
    if (disabled) return;
    console.log("📂 Click sur input file");
    fileInputRef.current?.click();
  }, [disabled]);

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
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif"
          className="sr-only"
          aria-label="Upload image file"
          disabled={disabled}
          onChange={(e) => handleFileSelect(e.target.files)}
          onClick={(e) => {
            // Empêcher la propagation vers le formulaire parent
            e.stopPropagation();
          }}
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
            ou cliquez pour sélectionner
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openFileDialog();
            }}
            disabled={disabled}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
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
      {(() => {
        console.log("🎨 Rendu de la liste des fichiers, localFiles:", localFiles);
        return localFiles.length > 0;
      })() && (
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
                type="button"
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          ))}

          {/* Remove all files button */}
          {localFiles.length > 1 && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFiles}
                disabled={disabled}
              >
                Supprimer tous les fichiers
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
