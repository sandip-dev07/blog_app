"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { uploadDataUriImage } from "@/lib/cloudinary";
import { BlogStatus, type Prisma } from "@/lib/prisma";
import { getPublishedBlogTag } from "@/lib/public-blogs";
import { requireXmdxAdminUser } from "@/lib/xmdx-admin";
import { db } from "@/server/db";

type SaveBlogStatus = "DRAFT" | "PUBLISHED";

type SaveBlogInput = {
  id?: string | null;
  title: string;
  tag: string;
  contentJson: unknown;
  contentHtml: string;
  status: SaveBlogStatus;
};

function slugify(input: string) {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled-post";
}

async function getAvailableSlug(title: string, blogId?: string | null) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await db.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === blogId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function collectDataUriImages(html: string) {
  const images = new Set<string>();
  const imageSourcePattern = /<img\b[^>]*\bsrc=(["'])(data:image\/[^"']+)\1/gi;
  let match: RegExpExecArray | null;

  while ((match = imageSourcePattern.exec(html))) {
    images.add(match[2]);
  }

  return images;
}

function replaceHtmlImages(html: string, imageUrls: Map<string, string>) {
  let nextHtml = html;

  imageUrls.forEach((url, dataUri) => {
    nextHtml = nextHtml.split(dataUri).join(url);
  });

  return nextHtml;
}

function replaceJsonImages(
  contentJson: unknown,
  imageUrls: Map<string, string>,
) {
  let json = JSON.stringify(contentJson);

  if (!json) {
    throw new Error("Could not read editor content.");
  }

  imageUrls.forEach((url, dataUri) => {
    json = json.split(dataUri).join(url);
  });

  return JSON.parse(json) as Prisma.InputJsonValue;
}

function findCoverImage(html: string) {
  const match = /<img\b[^>]*\bsrc=(["'])([^"']+)\1/i.exec(html);

  return match?.[2] || null;
}

export async function saveBlog(input: SaveBlogInput) {
  const user = await requireXmdxAdminUser();
  const title = input.title.trim() || "Untitled post";
  const tag = input.tag.trim() || "Blog";
  const status =
    input.status === "PUBLISHED" ? BlogStatus.PUBLISHED : BlogStatus.DRAFT;
  const imageSources = collectDataUriImages(input.contentHtml);
  const imageUrls = new Map<string, string>();

  await Promise.all(
    [...imageSources].map(async (dataUri) => {
      imageUrls.set(dataUri, await uploadDataUriImage(dataUri));
    })
  );

  const contentJson = replaceJsonImages(input.contentJson, imageUrls);
  const contentHtml = replaceHtmlImages(input.contentHtml, imageUrls);
  const coverImage = findCoverImage(contentHtml);
  const slug = await getAvailableSlug(title, input.id);
  const publishedAt = status === BlogStatus.PUBLISHED ? new Date() : null;

  const existingBlog = input.id
    ? await db.blog.findFirst({
        where: {
          id: input.id,
          authorId: user.id,
        },
        select: {
          id: true,
          publishedAt: true,
          slug: true,
        },
      })
    : null;

  const blog = existingBlog
    ? await db.blog.update({
        where: { id: existingBlog.id },
        data: {
          title,
          slug,
          tag,
          contentJson,
          contentHtml,
          coverImage,
          status,
          publishedAt:
            status === BlogStatus.PUBLISHED
              ? existingBlog.publishedAt || publishedAt
              : null,
        },
        select: {
          id: true,
          slug: true,
          status: true,
        },
      })
    : await db.blog.create({
        data: {
          id: crypto.randomUUID(),
          title,
          slug,
          tag,
          contentJson,
          contentHtml,
          coverImage,
          status,
          publishedAt,
          authorId: user.id,
        },
        select: {
          id: true,
          slug: true,
          status: true,
        },
      });

  revalidatePath("/xmdx/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
  revalidateTag("published-blogs", "max");
  revalidateTag(getPublishedBlogTag(blog.slug), "max");

  if (existingBlog?.slug && existingBlog.slug !== blog.slug) {
    revalidatePath(`/blogs/${existingBlog.slug}`);
    revalidateTag(getPublishedBlogTag(existingBlog.slug), "max");
  }

  return {
    ...blog,
    contentJson,
  };
}
