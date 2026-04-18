import { redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

import { getXmdxAdminUser } from "@/lib/xmdx-admin";
import { db } from "@/server/db";
import { BlogEditor } from "./_components/blog-editor";

type AdminEditorPageProps = {
  searchParams: Promise<{
    blogId?: string | string[];
  }>;
};

export default async function AdminEditorPage({
  searchParams,
}: AdminEditorPageProps) {
  const user = await getXmdxAdminUser();

  if (!user) {
    redirect("/xmdx/login");
  }

  const { blogId } = await searchParams;
  const id = Array.isArray(blogId) ? blogId[0] : blogId;
  const blog = id
    ? await db.blog.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          tag: true,
          contentJson: true,
        },
      })
    : null;

  if (id && !blog) {
    redirect("/xmdx/blogs");
  }

  return (
    <BlogEditor
      initialBlog={
        blog
          ? {
              id: blog.id,
              title: blog.title,
              tag: blog.tag,
              contentJson: blog.contentJson as JSONContent,
            }
          : null
      }
    />
  );
}
