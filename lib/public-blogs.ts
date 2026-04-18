import { BlogStatus } from "@/lib/prisma";
import { db } from "@/server/db";

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

export function formatBlogDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function estimateReadTime(html: string) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} min read`;
}

export async function getPublishedBlogs(search = "") {
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

export async function getPublishedBlogBySlug(slug: string) {
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
