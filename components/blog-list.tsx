"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import { parseBlogTags } from "@/lib/utils";

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
    <div id="posts" className="divide-y divide-border" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="py-5"
          aria-hidden="true"
        >
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="mt-2 h-4 w-full" />
          <div className="mt-3 flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogList() {
  const [search] = useQueryState("search");
  const normalizedSearch = (search ?? "").trim();
  const blogsUrl = normalizedSearch
    ? `/api/blogs?q=${encodeURIComponent(normalizedSearch)}`
    : "/api/blogs";
  const { data, error, isLoading } = useSWR<BlogsResponse>(blogsUrl);
  const posts = data?.blogs ?? [];

  if (isLoading) {
    return <BlogListSkeleton />;
  }

  if (error) {
    return (
      <div id="posts" className="rounded-md border border-border px-5 py-8">
        <p className="text-center text-sm text-muted-foreground">
          Unable to load posts right now.
        </p>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div id="posts" className="rounded-md border border-border px-5 py-8">
        <p className="text-sm text-muted-foreground text-center">
          {normalizedSearch
            ? `No posts found for "${normalizedSearch}".`
            : "No published posts yet."}
        </p>
      </div>
    );
  }

  return (
    <div id="posts" className="">
      {posts.map((post, index) => (
        <Link
          key={post.id}
          href={`/blogs/${post.slug}`}
          className="group flex items-start gap-4 rounded-md py-5 transition-colors hover:bg-card/60 sm:-mx-3 sm:px-3"
        >
          <span className="mt-0.5 shrink-0 font-mono text-sm font-semibold tracking-[0.28em] text-muted-foreground/70 transition-colors group-hover:text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-medium tracking-normal text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {post.excerpt}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {parseBlogTags(post.tag).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] leading-4 text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
              <span className="text-xs text-muted-foreground">
                {post.date}
              </span>
              <span className="text-xs text-muted-foreground">&middot;</span>
              <span className="text-xs text-muted-foreground">
                {post.readTime}
              </span>
            </div>
          </div>

          <ArrowUpRight
            size={14}
            className="mt-8 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary sm:ml-auto"
          />
        </Link>
      ))}
    </div>
  );
}
