import type { NextRequest } from "next/server";

import { jsonWithETag } from "@/lib/etag";
import {
  buildPublicApiOptionsResponse,
  withPublicApiCors,
} from "@/lib/public-api";
import {
  estimateReadTime,
  formatBlogDate,
  getExcerpt,
  getPublishedBlogs,
} from "@/lib/public-blogs";

const DEFAULT_PUBLIC_BLOG_LIMIT = 3;
const MAX_PUBLIC_BLOG_LIMIT = 50;

function isInternalView(view: string | null) {
  return view === "internal";
}

function parseBlogLimit(limitValue: string | null, internalView: boolean) {
  if (!limitValue) {
    return internalView ? undefined : DEFAULT_PUBLIC_BLOG_LIMIT;
  }

  const parsedLimit = Number.parseInt(limitValue, 10);

  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    return internalView ? undefined : DEFAULT_PUBLIC_BLOG_LIMIT;
  }

  return Math.min(parsedLimit, MAX_PUBLIC_BLOG_LIMIT);
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("q") ?? "";
  const internalView = isInternalView(request.nextUrl.searchParams.get("view"));
  const limit = parseBlogLimit(
    request.nextUrl.searchParams.get("limit"),
    internalView,
  );
  const origin = request.nextUrl.origin;
  const blogs = await getPublishedBlogs(search, limit);
  const payload = {
    blogs: blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      url: `${origin}/blogs/${blog.slug}`,
      tag: blog.tag,
      excerpt: getExcerpt(blog.contentHtml),
      coverImage: blog.coverImage,
      date: formatBlogDate(blog.publishedAt ?? blog.updatedAt),
      author: blog.author,
      ...(internalView
        ? {
            slug: blog.slug,
            apiUrl: `${origin}/api/blogs/${blog.slug}`,
            publishedAt: blog.publishedAt,
            updatedAt: blog.updatedAt,
            readTime: estimateReadTime(blog.contentHtml),
          }
        : {}),
    })),
  };

  return withPublicApiCors(
    request,
    jsonWithETag({
      request,
      payload,
    }),
  );
}

export function OPTIONS(request: NextRequest) {
  return buildPublicApiOptionsResponse(request);
}
