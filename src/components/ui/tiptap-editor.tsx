"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TiptapImage from "@tiptap/extension-image";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  ImageIcon,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef } from "react";
import { toast } from "sonner";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  icon,
  tooltip,
}: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Toggle
        size="sm"
        pressed={isActive}
        onPressedChange={onClick}
        disabled={disabled}
        className="h-8 w-8"
      >
        {icon}
      </Toggle>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type et la taille
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    const loadingToast = toast.loading("Upload de l'image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const data = await response.json();

      // Insérer l'image dans l'éditeur
      editor.chain().focus().setImage({ src: data.url }).run();

      toast.success("Image ajoutée avec succès", { id: loadingToast });

      // Reset le input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erreur d'upload:", error);
      toast.error("Erreur lors de l'upload de l'image", { id: loadingToast });
    }
  };

  return (
    <TooltipProvider>
      <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={<Bold className="h-4 w-4" />}
          tooltip="Gras (Ctrl+B)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={<Italic className="h-4 w-4" />}
          tooltip="Italique (Ctrl+I)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={<UnderlineIcon className="h-4 w-4" />}
          tooltip="Souligné (Ctrl+U)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon={<Strikethrough className="h-4 w-4" />}
          tooltip="Barré"
        />

        <Separator orientation="vertical" className="h-8 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          icon={<Heading2 className="h-4 w-4" />}
          tooltip="Titre 2"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          icon={<Heading3 className="h-4 w-4" />}
          tooltip="Titre 3"
        />

        <Separator orientation="vertical" className="h-8 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={<List className="h-4 w-4" />}
          tooltip="Liste à puces"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={<ListOrdered className="h-4 w-4" />}
          tooltip="Liste numérotée"
        />

        <Separator orientation="vertical" className="h-8 mx-1" />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insérer une image</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          icon={<AlignLeft className="h-4 w-4" />}
          tooltip="Aligner à gauche"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          icon={<AlignCenter className="h-4 w-4" />}
          tooltip="Centrer"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          icon={<AlignRight className="h-4 w-4" />}
          tooltip="Aligner à droite"
        />

        <Separator orientation="vertical" className="h-8 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo className="h-4 w-4" />}
          tooltip="Annuler (Ctrl+Z)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo className="h-4 w-4" />}
          tooltip="Refaire (Ctrl+Y)"
        />
      </div>
    </TooltipProvider>
  );
};

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  className,
  disabled = false,
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 my-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 my-2",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "my-1",
          },
        },
      }),
      Underline,
      TiptapImage.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[150px] p-4 focus:outline-none",
          disabled && "opacity-50 cursor-not-allowed",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!disabled) {
        onChange(editor.getHTML());
      }
    },
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-background shadow-sm transition-colors",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "[&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:p-4",
          "[&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none",
          // Styles pour les listes
          "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-2",
          "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-2",
          "[&_.ProseMirror_li]:my-1",
          "[&_.ProseMirror_ul_li]:marker:text-foreground",
          "[&_.ProseMirror_ol_li]:marker:text-foreground"
        )}
      />
    </div>
  );
}
