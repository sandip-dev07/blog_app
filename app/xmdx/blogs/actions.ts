"use server";

import { revalidatePath } from "next/cache";

import { requireXmdxAdminUser } from "@/lib/xmdx-admin";
import { db } from "@/server/db";

export async function deleteBlog(blogId: string) {
  await requireXmdxAdminUser();

  const blog = await db.blog.findUnique({
    where: { id: blogId },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!blog) {
    throw new Error("Blog not found.");
  }

  await db.blog.delete({
    where: { id: blog.id },
  });

  revalidatePath("/");
  revalidatePath("/xmdx/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
}
