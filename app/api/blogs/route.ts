import type { NextRequest } from "next/server";

import { jsonWithETag } from "@/lib/etag";
import {
  estimateReadTime,
  formatBlogDate,
  getExcerpt,
  getPublishedBlogs,
} from "@/lib/public-blogs";

export async function GET(request: NextRequest) {
  const blogs = await getPublishedBlogs();
  const payload = {
    blogs: blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
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

  return jsonWithETag({
    request,
    payload,
  });
}
