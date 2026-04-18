import type { Metadata } from "next";

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
  const title = titleFromSlug(id) || "Blog";

  return {
    title,
    description: "Thoughts on code, design, and building for the web.",
    openGraph: {
      title,
      description: "Thoughts on code, design, and building for the web.",
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
