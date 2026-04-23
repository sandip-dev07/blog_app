"use client";

import Link from "next/link";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";

type BlogDetail = {
  id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string | null;
  date: string;
  readTime: string;
};

type BlogDetailResponse = {
  blog: BlogDetail;
};

const socialLinks = [
  {
    href: process.env.NEXT_PUBLIC_X_URL ?? "https://x.com/sandip_dev_07",
    label: "X",
    icon: FaXTwitter,
  },
  {
    href:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ??
      "https://www.linkedin.com/in/sarkar-sandip/",
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
];

function BlogDetailsShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-background px-6 py-6 text-foreground sm:px-0">
      <article className="mx-auto w-full pb-20">
        <Link
          href="/"
          className="mb-6 inline-flex text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back
        </Link>
        {children}
      </article>
    </main>
  );
}

function BlogDetailsSkeleton() {
  return (
    <BlogDetailsShell>
      <div aria-busy="true">
        <header className="border-b border-border pb-7" aria-hidden="true">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>

          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="mt-3 h-8 w-2/3" />
        </header>

        <div className="space-y-4 pt-7" aria-hidden="true">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[84%]" />
          <Skeleton className="mt-3 h-4 w-[90%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[86%]" />
        </div>

        <footer className="mt-12 border-t border-border pt-6" aria-hidden="true">
          <Skeleton className="mb-3 h-3 w-20" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </footer>
      </div>
    </BlogDetailsShell>
  );
}

export function BlogDetailsClient({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR<BlogDetailResponse>(
    `/api/blogs/${encodeURIComponent(slug)}`,
  );
  const blog = data?.blog ?? null;

  if (isLoading) {
    return <BlogDetailsSkeleton />;
  }

  if (error || !blog) {
    return (
      <BlogDetailsShell>
        <h1 className="text-[28px] font-medium leading-tight tracking-normal text-foreground">
          Could not load post.
        </h1>
      </BlogDetailsShell>
    );
  }

  return (
    <BlogDetailsShell>
      <header className="border-b border-border pb-7">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
            {blog.tag}
          </span>
          <span>{blog.date}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{blog.readTime}</span>
        </div>

        <h1 className="text-[28px] font-medium leading-tight tracking-normal text-foreground">
          {blog.title}
        </h1>
      </header>

      <div
        className="blog-editor-content ProseMirror pt-7"
        dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
      />

      <footer className="mt-12 border-t border-border pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Find me on
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {socialLinks.map((social) => {
            const Icon = social.icon;

            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </footer>
    </BlogDetailsShell>
  );
}
