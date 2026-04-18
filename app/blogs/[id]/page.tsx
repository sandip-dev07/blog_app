import type { Metadata } from "next";

import {
  getExcerpt,
  getPublishedBlogBySlug,
  getPublishedBlogs,
} from "@/lib/public-blogs";
import { BlogDetailsClient } from "./blog-details-client";

export async function generateStaticParams() {
  const posts = await getPublishedBlogs();

  return posts.map((post) => ({ id: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublishedBlogBySlug(id);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: getExcerpt(post.contentHtml, 160),
    openGraph: {
      title: post.title,
      description: getExcerpt(post.contentHtml, 160),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BlogDetailsClient slug={id} />;
}
