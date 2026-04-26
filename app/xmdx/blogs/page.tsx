import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { BlogStatus } from "@/lib/prisma";
import { parseBlogTags } from "@/lib/utils";
import { getXmdxAdminUser } from "@/lib/xmdx-admin";
import { db } from "@/server/db";
import { DeleteBlogButton } from "./delete-blog-button";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getExcerpt(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

export default async function XmdxBlogsPage() {
  const user = await getXmdxAdminUser();

  if (!user) {
    redirect("/xmdx/login");
  }

  const blogs = await db.blog.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      tag: true,
      contentHtml: true,
      coverImage: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <main className="flex flex-1 justify-center px-6 py-12">
      <section className="w-full max-w-3xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
              XMDX
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
              Blogs
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage drafts and published posts.
            </p>
          </div>
          <Button asChild>
            <Link href="/xmdx/editor">New blog</Link>
          </Button>
        </div>

        {blogs.length ? (
          <div className="overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border bg-muted/35 px-4 py-3 text-sm font-medium text-muted-foreground">
              <span>Post</span>
              <span>Status</span>
              <span>Updated</span>
              <span>Options</span>
            </div>
            <div className="divide-y divide-border">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="grid grid-cols-1 gap-4 px-4 py-4 transition hover:bg-muted/25 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
                >
                  <div className="flex min-w-0 gap-4">
                    {blog.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        className="h-16 w-20 shrink-0 rounded-md object-cover"
                        src={blog.coverImage}
                      />
                    ) : (
                      <div className="h-16 w-20 shrink-0 rounded-md border border-border bg-muted" />
                    )}
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-foreground">
                        {blog.title}
                      </h2>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {parseBlogTags(blog.tag).map((tag) => (
                          <p
                            key={tag}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            {tag}
                          </p>
                        ))}
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm leading-6 text-muted-foreground">
                        {getExcerpt(blog.contentHtml) || "No preview text yet."}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {blog.author.name || blog.author.email} - /{blog.slug}
                      </p>
                    </div>
                  </div>

                  <span
                    className={
                      blog.status === BlogStatus.PUBLISHED
                        ? "w-fit rounded-md border border-border bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                        : "w-fit rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {blog.status === BlogStatus.PUBLISHED ? "Published" : "Draft"}
                  </span>

                  <div className="text-sm text-muted-foreground md:text-right">
                    <p>{formatDate(blog.updatedAt)}</p>
                    {blog.publishedAt ? (
                      <p className="mt-1 text-xs">
                        Live {formatDate(blog.publishedAt)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/xmdx/editor?blogId=${blog.id}`}>Edit</Link>
                    </Button>
                    <DeleteBlogButton blogId={blog.id} title={blog.title} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-border px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No blogs yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a draft and it will appear here.
            </p>
            <Button asChild className="mt-5">
              <Link href="/xmdx/editor">Create blog</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
