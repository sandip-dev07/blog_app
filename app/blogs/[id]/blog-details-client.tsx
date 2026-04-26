"use client";

import {
  ArrowUp,
  Copy,
  Ellipsis,
  ThumbsUp,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { parseBlogTags } from "@/lib/utils";

const EMPTY_CLAP_SUMMARY: BlogClapSummary = {
  clapCount: 0,
  hasClapped: false,
};
const READING_PROGRESS_SHOW_AT = 0.05;
const READING_PROGRESS_HIDE_OFFSET = 0.2;
const PROGRESS_RING_RADIUS = 15;
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;

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

type BlogClapSummary = {
  clapCount: number;
  hasClapped: boolean;
  alreadyClapped?: boolean;
  message?: string;
};

function formatClapCount(clapCount: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(clapCount);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useReadingProgress(targetRef: React.RefObject<HTMLDivElement | null>) {
  const [readingState, setReadingState] = useState({
    isVisible: false,
    progress: 0,
  });

  useEffect(() => {
    let frameId = 0;

    const updateReadingState = () => {
      const target = targetRef.current;

      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const articleTop = rect.top + scrollTop;
      const articleHeight = target.offsetHeight;
      const articleBottom = articleTop + articleHeight;
      const maxScrollableTop = Math.max(articleBottom - viewportHeight, articleTop);
      const normalizedScrollTop = clamp(scrollTop, articleTop, maxScrollableTop);
      const progressDenominator = Math.max(maxScrollableTop - articleTop, 1);
      const nextProgress = clamp(
        (normalizedScrollTop - articleTop) / progressDenominator,
        0,
        1,
      );
      const nextIsVisible =
        nextProgress >= READING_PROGRESS_SHOW_AT &&
        scrollTop < articleBottom - viewportHeight * READING_PROGRESS_HIDE_OFFSET;

      setReadingState((currentState) => {
        if (
          currentState.isVisible === nextIsVisible &&
          currentState.progress === nextProgress
        ) {
          return currentState;
        }

        return {
          isVisible: nextIsVisible,
          progress: nextProgress,
        };
      });
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateReadingState();
      });
    };

    updateReadingState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(requestUpdate);

    if (resizeObserver && targetRef.current) {
      resizeObserver.observe(targetRef.current);
    }

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      resizeObserver?.disconnect();
    };
  }, [targetRef]);

  return readingState;
}

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

        <div
          className="flex items-center justify-between border-b border-border py-4"
          aria-hidden="true"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

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

        <footer
          className="mt-12 border-t border-border pt-6"
          aria-hidden="true"
        >
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

function BlogActionBar({ blog }: { blog: BlogDetail }) {
  const [isSubmittingClap, setIsSubmittingClap] = useState(false);
  const clapEndpoint = `/api/blogs/${encodeURIComponent(blog.slug)}/clap`;
  const { data: clapSummary, mutate: mutateClapSummary } =
    useSWR<BlogClapSummary>(clapEndpoint, {
      fallbackData: EMPTY_CLAP_SUMMARY,
    });
  const clapCount = clapSummary?.clapCount ?? 0;
  const hasClapped = clapSummary?.hasClapped ?? false;

  const handleClap = useCallback(async () => {
    if (hasClapped) {
      toast.info("You already liked this post.");
      return;
    }

    setIsSubmittingClap(true);
    const optimisticSummary: BlogClapSummary = {
      clapCount: clapCount + 1,
      hasClapped: true,
    };

    try {
      const payload = await mutateClapSummary(
        async (currentSummary) => {
          const response = await fetch(clapEndpoint, {
            method: "POST",
          });
          const nextSummary = (await response.json()) as BlogClapSummary;

          if (!response.ok) {
            throw new Error(
              nextSummary.message ?? "Could not save clap right now.",
            );
          }

          return {
            ...(currentSummary ?? optimisticSummary),
            ...nextSummary,
          };
        },
        {
          optimisticData: optimisticSummary,
          rollbackOnError: true,
          revalidate: false,
        },
      );

      if (!payload) {
        return;
      }

      if (payload.alreadyClapped) {
        toast.info("You already liked this post.");
        return;
      }

      toast.success("Like saved.");
    } catch {
      toast.error("Could not save clap right now.");
    } finally {
      setIsSubmittingClap(false);
    }
  }, [clapCount, clapEndpoint, hasClapped, mutateClapSummary]);

  const getShareUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }

    return `/blogs/${blog.slug}`;
  }, [blog.slug]);

  const copyToClipboard = useCallback(async () => {
    const shareUrl = getShareUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy the link.");
    }
  }, [getShareUrl]);

  const openShareWindow = useCallback((url: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const handleShare = useCallback(async () => {
    const shareUrl = getShareUrl();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyToClipboard();
  }, [blog.excerpt, blog.title, copyToClipboard, getShareUrl]);

  return (
    <div className="flex items-center justify-between border-b border-border py-4">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button
          type="button"
          aria-pressed={hasClapped}
          onClick={() => {
            void handleClap();
          }}
          disabled={isSubmittingClap}
          className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
        >
          <ThumbsUp
            className={`h-4 w-4 ${hasClapped ? "fill-foreground text-foreground" : ""}`}
          />
          <span>{formatClapCount(clapCount)}</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Share post"
          onClick={() => {
            void handleShare();
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="More actions"
            >
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onSelect={() => {
                void copyToClipboard();
              }}
            >
              <Copy className="h-4 w-4" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const shareUrl = encodeURIComponent(getShareUrl());
                const text = encodeURIComponent(blog.title);
                openShareWindow(
                  `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
                );
              }}
            >
              <FaXTwitter className="h-4 w-4" />
              Share on X
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const shareUrl = encodeURIComponent(getShareUrl());
                openShareWindow(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
                );
              }}
            >
              <FaLinkedinIn className="h-4 w-4" />
              Share on LinkedIn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ReadingProgressIsland({
  title,
  targetRef,
}: {
  title: string;
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { isVisible, progress } = useReadingProgress(targetRef);
  const progressValue = Math.round(progress * 100);
  const progressLabel = `${Math.round(progress * 100)}%`;
  const strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress);
  const [isProgressHovered, setIsProgressHovered] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-5 scale-95 opacity-0"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="pointer-events-auto flex w-full max-w-xs items-center gap-2 rounded-full border border-white/10 bg-muted px-2 pl-3 py-1 text-white shadow-[0_18px_50px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="h-2 w-2 shrink-0 rounded-full bg-white/85" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium tracking-tight text-white">
            {title}
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          onMouseEnter={() => setIsProgressHovered(true)}
          onMouseLeave={() => setIsProgressHovered(false)}
          onFocus={() => setIsProgressHovered(true)}
          onBlur={() => setIsProgressHovered(false)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform cursor-pointer duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none"
          aria-label="Scroll to top"
        >
          <svg
            className={`-rotate-90 transition-opacity duration-200 ${
              isProgressHovered ? "opacity-80" : "opacity-100"
            }`}
            width="44"
            height="44"
            viewBox="0 0 44 44"
            role="img"
            aria-label={`Reading progress ${progressLabel}`}
          >
            <circle
              cx="22"
              cy="22"
              r={PROGRESS_RING_RADIUS}
              fill="none"
              stroke="rgba(148, 163, 184, 0.22)"
              strokeWidth="3.5"
            />
            <circle
              cx="22"
              cy="22"
              r={PROGRESS_RING_RADIUS}
              fill="none"
              stroke="rgba(255, 255, 255, 0.96)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <span className="absolute flex items-center justify-center text-[10px] font-semibold text-white transition-opacity duration-200">
            <span className={isProgressHovered ? "opacity-0" : "opacity-100"}>
              {progressValue}
            </span>
          </span>
          <ArrowUp
            className={`absolute h-4 w-4 text-white transition-all duration-200 ${
              isProgressHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export function BlogDetailsClient({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR<BlogDetailResponse>(
    `/api/blogs/${encodeURIComponent(slug)}`,
  );
  const blog = data?.blog ?? null;
  const blogTags = parseBlogTags(blog?.tag);
  const articleContentRef = useRef<HTMLDivElement | null>(null);

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
          {blogTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          <span>{blog.date}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{blog.readTime}</span>
        </div>

        <h1 className="text-[32px] font-semibold tracking-normal text-foreground">
          {blog.title}
        </h1>
      </header>

      <BlogActionBar blog={blog} />

      <div
        ref={articleContentRef}
        className="blog-editor-content ProseMirror pt-7"
        dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
      />

      <ReadingProgressIsland
        title={blog.title}
        targetRef={articleContentRef}
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
