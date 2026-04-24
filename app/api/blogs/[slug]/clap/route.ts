import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

import {
  getBlogClapIp,
  getBlogClapSummary,
  hashIpAddress,
} from "@/lib/blog-claps";
import { getPublishedBlogBySlug } from "@/lib/public-blogs";
import { db } from "@/server/db";

type BlogClapRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: BlogClapRouteContext) {
  const { slug } = await context.params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    return NextResponse.json({ message: "Blog not found." }, { status: 404 });
  }

  const ipAddress = getBlogClapIp(request.headers);
  const clapSummary = await getBlogClapSummary(blog.id, ipAddress);

  return NextResponse.json(clapSummary);
}

export async function POST(request: NextRequest, context: BlogClapRouteContext) {
  const { slug } = await context.params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    return NextResponse.json({ message: "Blog not found." }, { status: 404 });
  }

  const ipAddress = getBlogClapIp(request.headers);

  if (!ipAddress) {
    return NextResponse.json(
      { message: "Could not determine your IP address." },
      { status: 400 },
    );
  }

  const ipHash = hashIpAddress(ipAddress);

  try {
    await db.blogClap.create({
      data: {
        id: randomUUID(),
        blogId: blog.id,
        ipHash,
      },
    });

    const clapSummary = await getBlogClapSummary(blog.id, ipAddress);

    return NextResponse.json({
      ...clapSummary,
      alreadyClapped: false,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const clapSummary = await getBlogClapSummary(blog.id, ipAddress);

      return NextResponse.json({
        ...clapSummary,
        alreadyClapped: true,
      });
    }

    console.error("Failed to save blog clap:", error);

    return NextResponse.json(
      { message: "Could not save clap right now." },
      { status: 500 },
    );
  }
}
