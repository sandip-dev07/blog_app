import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";

import { jsonWithETag } from "@/lib/etag";
import {
  estimateReadTime,
  formatBlogDate,
  getExcerpt,
  getPublishedBlogBySlug,
} from "@/lib/public-blogs";

type BlogRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: BlogRouteContext) {
  const { slug } = await context.params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const payload = {
    blog: {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      tag: blog.tag,
      excerpt: getExcerpt(blog.contentHtml),
      contentHtml: blog.contentHtml,
      coverImage: blog.coverImage,
      publishedAt: blog.publishedAt,
      updatedAt: blog.updatedAt,
      date: formatBlogDate(blog.publishedAt ?? blog.updatedAt),
      readTime: estimateReadTime(blog.contentHtml),
      author: blog.author,
    },
  };

  return jsonWithETag({
    request,
    payload,
  });
}
