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

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("q") ?? "";
  const origin = request.nextUrl.origin;
  const blogs = await getPublishedBlogs(search, DEFAULT_PUBLIC_BLOG_LIMIT);
  const payload = {
    blogs: blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      url: `${origin}/blogs/${blog.slug}`,
      apiUrl: `${origin}/api/blogs/${blog.slug}`,
      tag: blog.tag,
      excerpt: getExcerpt(blog.contentHtml),
      coverImage: blog.coverImage,
      publishedAt: blog.publishedAt,
      updatedAt: blog.updatedAt,
      date: formatBlogDate(blog.publishedAt ?? blog.updatedAt),
      readTime: estimateReadTime(blog.contentHtml),
      author: blog.author,
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
