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

type CloudinarySignaturePayload = {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
  transformation: string;
};

type ErrorPayload = {
  error?: string | { message?: string };
};

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return fallback;
}

export function ImageDialog({ editor, open, onOpenChange }: ImageDialogProps) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const insertImage = (src: string) => {
    if (!src) {
      return;
    }

    editor.chain().focus().setImage({ src }).run();
    setUrl("");
    onOpenChange(false);
  };

  const uploadImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Use a file smaller than 5MB.");
      return;
    }

    setUploading(true);

    try {
      const signatureResponse = await fetch("/api/xmdx/editor/images/sign", {
        method: "POST",
      });

      const signaturePayload = (await signatureResponse.json()) as
        | CloudinarySignaturePayload
        | ErrorPayload;

      if (!signatureResponse.ok || !("signature" in signaturePayload)) {
        throw new Error(getErrorMessage(signaturePayload, "Could not start the upload."));
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("folder", signaturePayload.folder);
      formData.append("signature", signaturePayload.signature);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("transformation", signaturePayload.transformation);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadPayload = (await uploadResponse.json()) as
        | { secure_url: string }
        | ErrorPayload;

      if (!uploadResponse.ok || !("secure_url" in uploadPayload)) {
        throw new Error(
          getErrorMessage(uploadPayload, "Cloudinary rejected the image upload.")
        );
      }

      insertImage(uploadPayload.secure_url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload the image."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" disabled={uploading}>
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" disabled={uploading}>
              URL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <label
              htmlFor="editor-image-file"
              className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-sm text-muted-foreground transition hover:bg-accent/40"
            >
              <span className="font-medium text-foreground">
                {uploading ? "Uploading..." : "Click to upload"}
              </span>
              <span className="text-xs">
                {uploading
                  ? "Please wait while the image is sent to Cloudinary."
                  : "PNG, JPG, GIF. Max 5MB."}
              </span>
              <input
                id="editor-image-file"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadImage(file);
                  }
                  event.currentTarget.value = "";
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
                disabled={uploading}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={uploading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={uploading}
                onClick={() => insertImage(url)}
              >
                Embed
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
