"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { ImageDialog } from "./image-dialog";
import { LinkDialog } from "./link-dialog";

const COLORS = [
  { name: "Default", value: "" },
  { name: "Gray", value: "oklch(0.55 0.01 60)" },
  { name: "Green", value: "oklch(0.58 0.14 155)" },
  { name: "Blue", value: "oklch(0.58 0.16 245)" },
  { name: "Violet", value: "oklch(0.56 0.17 300)" },
  { name: "Pink", value: "oklch(0.64 0.2 350)" },
  { name: "Red", value: "oklch(0.58 0.22 25)" },
  { name: "Amber", value: "oklch(0.74 0.16 80)" },
];

type FloatingDockProps = {
  editor: Editor | null;
  preview: boolean;
  onSave: () => void;
  onClearAll: () => void;
};

function DockItem({
  active,
  children,
  danger,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-all",
        "hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground/75 hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground"
      )}
    >
      {children}
      <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-border" />;
}

export function FloatingDock({
  editor,
  preview,
  onSave,
  onClearAll,
}: FloatingDockProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const disabled = !editor || preview;

  return (
    <>
      <div className="pointer-events-none max-w-3xl mx-auto fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-5xl flex-wrap items-center justify-center gap-1 rounded-md border border-border bg-muted p-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <DockItem label="Undo" disabled={disabled} onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </DockItem>
          <DockItem label="Redo" disabled={disabled} onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </DockItem>
          <Divider />
          <DockItem label="Heading 1" disabled={disabled} active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 className="h-4 w-4" />
          </DockItem>
          <DockItem label="Heading 2" disabled={disabled} active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="h-4 w-4" />
          </DockItem>
          <DockItem label="Heading 3" disabled={disabled} active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="h-4 w-4" />
          </DockItem>
          <DockItem label="Heading 4" disabled={disabled} active={editor?.isActive("heading", { level: 4 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}>
            <Heading4 className="h-4 w-4" />
          </DockItem>
          <Divider />
          <DockItem label="Bold" disabled={disabled} active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </DockItem>
          <DockItem label="Italic" disabled={disabled} active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </DockItem>
          <DockItem label="Underline" disabled={disabled} active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" />
          </DockItem>
          <DockItem label="Strikethrough" disabled={disabled} active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-4 w-4" />
          </DockItem>
          <DockItem label="Code box" disabled={disabled} active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
            <Code className="h-4 w-4" />
          </DockItem>
          <DockItem label="Highlight" disabled={disabled} active={editor?.isActive("highlight")} onClick={() => editor?.chain().focus().toggleHighlight().run()}>
            <Highlighter className="h-4 w-4" />
          </DockItem>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                title="Text color"
                aria-label="Text color"
                disabled={disabled}
                className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground/75 transition-all hover:scale-105 hover:bg-accent hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <Palette className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-44 p-2">
              <div className="grid grid-cols-4 gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    title={color.name}
                    onClick={() => {
                      if (!editor) {
                        return;
                      }

                      if (color.value) {
                        editor.chain().focus().setColor(color.value).run();
                      } else {
                        editor.chain().focus().unsetColor().run();
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs font-semibold transition hover:scale-105"
                    style={{ color: color.value || undefined }}
                  >
                    A
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Divider />
          <DockItem label="Bullet list" disabled={disabled} active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </DockItem>
          <DockItem label="Numbered list" disabled={disabled} active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </DockItem>
          <DockItem label="To-do list" disabled={disabled} active={editor?.isActive("taskList")} onClick={() => editor?.chain().focus().toggleTaskList().run()}>
            <ListChecks className="h-4 w-4" />
          </DockItem>
          <Divider />
          <DockItem label="Quote" disabled={disabled} active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" />
          </DockItem>
          <DockItem label="Divider" disabled={disabled} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </DockItem>
          <DockItem label="Insert link" disabled={disabled} active={editor?.isActive("link")} onClick={() => setLinkOpen(true)}>
            <LinkIcon className="h-4 w-4" />
          </DockItem>
          <DockItem label="Insert image" disabled={disabled} onClick={() => setImageOpen(true)}>
            <ImageIcon className="h-4 w-4" />
          </DockItem>
          <Divider />
          <DockItem label="Save" onClick={onSave}>
            <Save className="h-4 w-4" />
          </DockItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                title="Clear all"
                aria-label="Clear all"
                className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-destructive transition-all hover:scale-105 hover:bg-destructive/10 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  Clear all
                </span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all content?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the draft from browser storage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAll}>Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {editor ? (
        <>
          <LinkDialog editor={editor} open={linkOpen} onOpenChange={setLinkOpen} />
          <ImageDialog editor={editor} open={imageOpen} onOpenChange={setImageOpen} />
        </>
      ) : null}
    </>
  );
}
