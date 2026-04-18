"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";

type BlogSummary = {
  id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  date: string;
  readTime: string;
};

type BlogsResponse = {
  blogs: BlogSummary[];
};

function BlogListSkeleton() {
  return (
    <div id="posts" className="flex flex-col gap-1" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="-mx-3 rounded-md px-3 py-4"
          aria-hidden="true"
        >
          <div className="mb-3 flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function BlogList() {
  const { data, error, isLoading } = useSWR<BlogsResponse>("/api/blogs");
  const posts = data?.blogs ?? [];

  if (isLoading) {
    return <BlogListSkeleton />;
  }

  if (error) {
    return (
      <div id="posts" className="rounded-md border border-border px-5 py-8">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div id="posts" className="rounded-md border border-border px-5 py-8">
        <p className="text-sm text-muted-foreground text-center">
          No published posts yet.
        </p>
      </div>
    );
  }

  return (
    <div id="posts" className="flex flex-col gap-1">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blogs/${post.slug}`}
          className="group -mx-3 flex items-start justify-between gap-4 rounded-md px-3 py-4 transition-colors hover:bg-card"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] leading-4 text-secondary-foreground">
                {post.tag}
              </span>
              <span className="text-xs text-muted-foreground">
                {post.date}
              </span>
              <span className="text-xs text-muted-foreground">&middot;</span>
              <span className="text-xs text-muted-foreground">
                {post.readTime}
              </span>
            </div>

            <h3 className="text-base mt-2 font-medium tracking-normal text-foreground transition-colors group-hover:text-green-300">
              {post.title}
            </h3>

            <p className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-relaxed text-muted-foreground line-clamp-1">
              {post.excerpt}
            </p>
          </div>

          <ArrowUpRight
            size={14}
            className="mt-6 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-green-500 group-hover:opacity-100"
          />
        </Link>
      ))}
    </div>
  );
}
