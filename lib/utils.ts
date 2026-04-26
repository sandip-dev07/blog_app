import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_BLOG_TAG = "Blog";

export function parseBlogTags(tag: string | null | undefined) {
  const tags = (tag ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return tags.length ? [...new Set(tags)] : [DEFAULT_BLOG_TAG];
}

export function formatBlogTags(tag: string | null | undefined) {
  return parseBlogTags(tag).join(", ");
}
