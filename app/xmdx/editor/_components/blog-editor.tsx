"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CheckCircle2, Eye, Loader2, MoveLeft, Pencil } from "lucide-react";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { saveBlog } from "../actions";
import { FloatingDock } from "./floating-dock";
import { lowlight } from "./lowlight";

const STORAGE_KEY = "blog-editor:doc-v1";
const TITLE_KEY = "blog-editor:title-v1";
const BLOG_ID_KEY = "blog-editor:id-v1";
const TAG_KEY = "blog-editor:tag-v1";
const DEFAULT_TITLE = "Untitled post";
const DEFAULT_TAG = "Blog";
const DEFAULT_CONTENT =
  "<p>Start writing your story. Use the dock below to shape text, add images, links, code blocks, lists, and more.</p>";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type BlogSaveStatus = "DRAFT" | "PUBLISHED";

type BlogEditorProps = {
  initialBlog?: {
    id: string;
    title: string;
    tag: string;
    contentJson: JSONContent;
  } | null;
};

export function BlogEditor({ initialBlog = null }: BlogEditorProps) {
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [blogId, setBlogId] = useState<string | null>(initialBlog?.id ?? null);
  const [savingBlogStatus, setSavingBlogStatus] =
    useState<BlogSaveStatus | null>(null);
  const [title, setTitle] = useState(initialBlog?.title ?? DEFAULT_TITLE);
  const [tag, setTag] = useState(initialBlog?.tag ?? DEFAULT_TAG);
  const saveTimer = useRef<number | null>(null);
  const contentStorageKey = blogId ? `${STORAGE_KEY}:${blogId}` : STORAGE_KEY;
  const titleStorageKey = blogId ? `${TITLE_KEY}:${blogId}` : TITLE_KEY;
  const tagStorageKey = blogId ? `${TAG_KEY}:${blogId}` : TAG_KEY;

  const persist = (json: unknown) => {
    try {
      localStorage.setItem(contentStorageKey, JSON.stringify(json));
      return true;
    } catch (error) {
      const isQuotaError =
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" || error.code === 22);

      setStatus("error");
      toast.error(
        isQuotaError
          ? "Storage full. Try fewer or smaller embedded images."
          : "Could not save to browser storage."
      );
      return false;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false, underline: false }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({ allowBase64: true, inline: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === "paragraph"
            ? "Start writing, or choose a block from the dock below"
            : "",
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialBlog?.contentJson ?? DEFAULT_CONTENT,
    editorProps: {
      attributes: {
        class: "ProseMirror blog-editor-content",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setStatus("saving");

      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }

      saveTimer.current = window.setTimeout(() => {
        if (persist(currentEditor.getJSON())) {
          setStatus("saved");
        }
      }, 900);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (initialBlog) {
      editor.commands.setContent(initialBlog.contentJson);
      setTitle(initialBlog.title);
      setTag(initialBlog.tag);
      setBlogId(initialBlog.id);
      return;
    }

    try {
      const savedContent = localStorage.getItem(contentStorageKey);
      const savedTitle = localStorage.getItem(titleStorageKey);
      const savedTag = localStorage.getItem(tagStorageKey);
      const savedBlogId = localStorage.getItem(BLOG_ID_KEY);

      if (savedContent) {
        editor.commands.setContent(JSON.parse(savedContent));
      }

      if (savedTitle) {
        window.setTimeout(() => setTitle(savedTitle), 0);
      }

      if (savedTag) {
        window.setTimeout(() => setTag(savedTag), 0);
      }

      if (savedBlogId) {
        window.setTimeout(() => setBlogId(savedBlogId), 0);
      }
    } catch {
      toast.error("Could not restore the saved draft.");
    }
  }, [contentStorageKey, editor, initialBlog, tagStorageKey, titleStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(titleStorageKey, title);
    } catch {
      toast.error("Could not save the title to browser storage.");
    }
  }, [title, titleStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(tagStorageKey, tag);
    } catch {
      toast.error("Could not save the tag to browser storage.");
    }
  }, [tag, tagStorageKey]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, []);

  const manualSave = () => {
    if (!editor) {
      return;
    }

    if (persist(editor.getJSON())) {
      setStatus("saved");
      toast.success("Saved to browser storage.");
    }
  };

  const saveToDatabase = async (blogStatus: BlogSaveStatus) => {
    if (!editor) {
      return;
    }

    setStatus("saving");
    setSavingBlogStatus(blogStatus);

    try {
      const contentJson = JSON.parse(
        JSON.stringify(editor.getJSON())
      ) as JSONContent;
      const contentHtml = editor.getHTML();

      const savedBlog = await saveBlog({
        id: blogId,
        title,
        tag,
        contentJson,
        contentHtml,
        status: blogStatus,
      });

      setBlogId(savedBlog.id);
      editor.commands.setContent(savedBlog.contentJson as JSONContent);

      try {
        localStorage.setItem(BLOG_ID_KEY, savedBlog.id);
        localStorage.setItem(
          `${STORAGE_KEY}:${savedBlog.id}`,
          JSON.stringify(savedBlog.contentJson)
        );
        localStorage.setItem(`${TITLE_KEY}:${savedBlog.id}`, title);
        localStorage.setItem(`${TAG_KEY}:${savedBlog.id}`, tag);
      } catch {
        toast.error("Saved online, but local draft could not be updated.");
      }

      setStatus("saved");
      toast.success(
        blogStatus === "PUBLISHED" ? "Published." : "Draft saved."
      );
    } catch (error) {
      setStatus("error");
      toast.error(
        error instanceof Error ? error.message : "Could not save the post."
      );
    } finally {
      setSavingBlogStatus(null);
    }
  };

  const clearAll = () => {
    if (!editor) {
      return;
    }

    editor.commands.setContent(DEFAULT_CONTENT);
    setTitle(DEFAULT_TITLE);
    setTag(DEFAULT_TAG);

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TITLE_KEY);
      localStorage.removeItem(TAG_KEY);
      if (blogId) {
        localStorage.removeItem(`${STORAGE_KEY}:${blogId}`);
        localStorage.removeItem(`${TITLE_KEY}:${blogId}`);
        localStorage.removeItem(`${TAG_KEY}:${blogId}`);
      }
      localStorage.removeItem(BLOG_ID_KEY);
    } catch {
      setStatus("error");
      return;
    }

    setBlogId(null);
    setStatus("idle");
    toast.success("Cleared.");
  };

  const html = editor?.getHTML() ?? "";
  const publishLabel = blogId ? "Update" : "Publish";
  const publishingLabel = blogId ? "Updating..." : "Publishing...";
  const statusLabel =
    status === "saving"
      ? "Saving"
      : status === "saved"
        ? "Saved"
        : status === "error"
          ? "Save failed"
          : "Ready";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-14 w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-2 sm:px-6">
          <NextLink
            href="/xmdx/blogs"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <MoveLeft className="h-4 w-4" />
            Back
          </NextLink>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div
              className={
                status === "error"
                  ? "mr-1 flex min-w-20 items-center justify-end gap-2 text-xs text-destructive"
                  : "mr-1 flex min-w-20 items-center justify-end gap-2 text-xs text-muted-foreground"
              }
            >
              {status === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {status === "saved" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : null}
              <span>{statusLabel}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!editor || Boolean(savingBlogStatus)}
              onClick={() => saveToDatabase("DRAFT")}
            >
              {savingBlogStatus === "DRAFT" ? "Saving..." : "Save draft"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!editor || Boolean(savingBlogStatus)}
              onClick={() => saveToDatabase("PUBLISHED")}
            >
              {savingBlogStatus === "PUBLISHED" ? publishingLabel : publishLabel}
            </Button>

            <div className="flex items-center rounded-md border border-border bg-muted/35 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setPreview(false)}
                aria-pressed={!preview}
                className={
                  !preview
                    ? "flex h-8 items-center gap-1.5 rounded-md bg-background px-3 text-foreground shadow-sm"
                    : "flex h-8 items-center gap-1.5 rounded-md px-3 text-muted-foreground transition hover:text-foreground"
                }
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                aria-pressed={preview}
                className={
                  preview
                    ? "flex h-8 items-center gap-1.5 rounded-md bg-background px-3 text-foreground shadow-sm"
                    : "flex h-8 items-center gap-1.5 rounded-md px-3 text-muted-foreground transition hover:text-foreground"
                }
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-44 pt-6 sm:px-6">
        <div className="mb-5 border-b border-border/60 pb-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-normal text-muted-foreground">
            {blogId ? "Edit post" : "New post"}
          </p>

          {preview ? (
            <>
              <h1 className="text-4xl font-bold tracking-normal text-foreground md:text-5xl">
                {title || "Untitled"}
              </h1>
              <p className="mt-6 w-fit rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {tag || DEFAULT_TAG}
              </p>
            </>
          ) : (
            <>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Untitled"
                aria-label="Post title"
                className="w-full border-0 bg-transparent text-4xl font-bold tracking-normal text-foreground outline-none placeholder:text-muted-foreground/40 md:text-5xl"
              />
              <input
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                placeholder="Category"
                aria-label="Blog category"
                className="mt-6 h-9 w-full max-w-44 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            </>
          )}
        </div>

        {preview ? (
          <article className="pt-2">
            <div
              className="blog-editor-content ProseMirror"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>
        ) : (
          <EditorContent editor={editor} />
        )}
      </section>

      <FloatingDock
        editor={editor}
        preview={preview}
        onSave={manualSave}
        onClearAll={clearAll}
      />
    </main>
  );
}
