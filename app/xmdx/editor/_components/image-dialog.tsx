"use client";

import type { Editor } from "@tiptap/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ImageDialogProps = {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImageDialog({ editor, open, onOpenChange }: ImageDialogProps) {
  const [url, setUrl] = useState("");

  const insertImage = (src: string) => {
    if (!src) {
      return;
    }

    editor.chain().focus().setImage({ src }).run();
    setUrl("");
    onOpenChange(false);
  };

  const uploadImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Use a file smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => insertImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <label
              htmlFor="editor-image-file"
              className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-sm text-muted-foreground transition hover:bg-accent/40"
            >
              <span className="font-medium text-foreground">Click to upload</span>
              <span className="text-xs">PNG, JPG, GIF. Max 5MB.</span>
              <input
                id="editor-image-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    uploadImage(file);
                  }
                }}
              />
            </label>
          </TabsContent>
          <TabsContent value="url" className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => insertImage(url)}>
                Embed
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
