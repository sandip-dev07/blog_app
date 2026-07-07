import { NextResponse, type NextRequest } from "next/server";

import { jsonWithETag } from "@/lib/etag";
import {
  buildPublicApiOptionsResponse,
  withPublicApiCors,
} from "@/lib/public-api";
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
  const origin = request.nextUrl.origin;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    return withPublicApiCors(
      request,
      NextResponse.json(
        {
          error: {
            code: "BLOG_NOT_FOUND",
            message: "Published blog not found.",
          },
        },
        { status: 404 },
      ),
    );
  }

  const payload = {
    blog: {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      url: `${origin}/blogs/${blog.slug}`,
      apiUrl: `${origin}/api/blogs/${blog.slug}`,
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
