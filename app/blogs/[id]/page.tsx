import type { Metadata } from "next";

import { getExcerpt, getPublishedBlogBySlug } from "@/lib/public-blogs";

import { BlogDetailsClient } from "./blog-details-client";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fallbackTitle = titleFromSlug(id) || "Blog";
  const blog = await getPublishedBlogBySlug(id);
  const title = blog?.title || fallbackTitle;
  const description = blog ? getExcerpt(blog.contentHtml) : "Thoughts on code, design, and building for the web.";
  const image = blog?.coverImage ?? undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/blogs/${id}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blogs/${id}`,
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      title,
      description,
      card: image ? "summary_large_image" : "summary",
      ...(image ? { images: [image] } : {}),
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
