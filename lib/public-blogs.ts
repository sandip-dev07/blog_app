import { unstable_cache } from "next/cache";

import { BlogStatus } from "@/lib/prisma";
import { db } from "@/server/db";

const PUBLISHED_BLOGS_TAG = "published-blogs";

export function getPublishedBlogTag(slug: string) {
  return `published-blog:${slug}`;
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function getExcerpt(html: string, maxLength = 150) {
  const text = stripHtml(html);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

export function formatBlogDate(date: Date | string | number | null | undefined) {
  const value = date instanceof Date ? date : new Date(date ?? "");

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function estimateReadTime(html: string) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} min read`;
}

async function getPublishedBlogsUncached(search = "") {
  const query = search.trim();

  return db.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      publishedAt: {
        not: null,
      },
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { slug: { contains: query, mode: "insensitive" as const } },
              { tag: { contains: query, mode: "insensitive" as const } },
              {
                contentHtml: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      tag: true,
      contentHtml: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

async function getPublishedBlogBySlugUncached(slug: string) {
  return db.blog.findFirst({
    where: {
      slug,
      status: BlogStatus.PUBLISHED,
      publishedAt: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      tag: true,
      contentHtml: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getPublishedBlogs(search = "") {
  const query = search.trim();

  return unstable_cache(
    async () => getPublishedBlogsUncached(query),
    ["published-blogs", query],
    {
      tags: [PUBLISHED_BLOGS_TAG],
      revalidate: 300,
    },
  )();
}

export async function getPublishedBlogBySlug(slug: string) {
  return unstable_cache(
    async () => getPublishedBlogBySlugUncached(slug),
    ["published-blog-by-slug", slug],
    {
      tags: [PUBLISHED_BLOGS_TAG, getPublishedBlogTag(slug)],
      revalidate: 300,
    },
  )();
}
