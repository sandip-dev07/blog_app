"use client";

import {
  Copy,
  Ellipsis,
  ThumbsUp,
  Pause,
  Play,
  Share2,
  Square,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const PREFERRED_FEMALE_VOICE_PATTERNS = [
  /female/i,
  /woman/i,
  /girl/i,
  /zira/i,
  /aria/i,
  /samantha/i,
  /victoria/i,
  /karen/i,
  /moira/i,
  /fiona/i,
  /ava/i,
  /allison/i,
  /susan/i,
];

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

function stripHtmlForSpeech(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatClapCount(clapCount: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(clapCount);
}

function getPreferredFemaleVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();

  if (!voices.length) {
    return null;
  }

  return (
    voices.find((voice) =>
      PREFERRED_FEMALE_VOICE_PATTERNS.some((pattern) =>
        pattern.test(voice.name),
      ),
    ) ?? null
  );
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
  const speechStartTimeoutRef = useRef<number | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmittingClap, setIsSubmittingClap] = useState(false);
  const clapEndpoint = `/api/blogs/${encodeURIComponent(blog.slug)}/clap`;
  const { data: clapSummary, mutate: mutateClapSummary } =
    useSWR<BlogClapSummary>(clapEndpoint, {
      fallbackData: {
        clapCount: 0,
        hasClapped: false,
      },
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
      const payload = await mutateClapSummary(async (currentSummary) => {
        const response = await fetch(clapEndpoint, {
          method: "POST",
        });
        const nextSummary = (await response.json()) as BlogClapSummary;

        if (!response.ok) {
          throw new Error(nextSummary.message ?? "Could not save clap right now.");
        }

        return {
          ...(currentSummary ?? optimisticSummary),
          ...nextSummary,
        };
      }, {
        optimisticData: optimisticSummary,
        rollbackOnError: true,
        revalidate: false,
      });

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

  const speechText = useMemo(
    () =>
      `${blog.title}. ${blog.excerpt}. ${stripHtmlForSpeech(blog.contentHtml)}`,
    [blog.contentHtml, blog.excerpt, blog.title],
  );

  useEffect(() => {
    return () => {
      if (speechStartTimeoutRef.current !== null) {
        window.clearTimeout(speechStartTimeoutRef.current);
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const stopReading = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (speechStartTimeoutRef.current !== null) {
      window.clearTimeout(speechStartTimeoutRef.current);
      speechStartTimeoutRef.current = null;
    }

    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
  }, []);

  const pauseReading = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resumeReading = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const handleVoiceToggle = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Voice reading is not supported in this browser.");
      return;
    }

    if (isReading && isPaused) {
      resumeReading();
      return;
    }

    if (isReading) {
      pauseReading();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    const preferredVoice = getPreferredFemaleVoice();

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => {
      if (speechStartTimeoutRef.current !== null) {
        window.clearTimeout(speechStartTimeoutRef.current);
        speechStartTimeoutRef.current = null;
      }

      setIsReading(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      if (speechStartTimeoutRef.current !== null) {
        window.clearTimeout(speechStartTimeoutRef.current);
        speechStartTimeoutRef.current = null;
      }

      setIsReading(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      if (speechStartTimeoutRef.current !== null) {
        window.clearTimeout(speechStartTimeoutRef.current);
        speechStartTimeoutRef.current = null;
      }

      setIsReading(false);
      setIsPaused(false);
      toast.error("Could not start voice reading.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    speechStartTimeoutRef.current = window.setTimeout(() => {
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        const voices = window.speechSynthesis.getVoices();

        if (!utterance.voice && voices.length > 0) {
          const fallbackVoice = getPreferredFemaleVoice() ?? voices[0];

          if (fallbackVoice) {
            utterance.voice = fallbackVoice;
          }
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }, 150);
  }, [isPaused, isReading, pauseReading, resumeReading, speechText]);

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
          aria-label={
            isReading
              ? isPaused
                ? "Resume reading aloud"
                : "Pause reading aloud"
              : "Read aloud"
          }
          onClick={handleVoiceToggle}
        >
          {isReading ? (
            isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Stop reading aloud"
          disabled={!isReading && !isPaused}
          onClick={stopReading}
        >
          <Square className="h-4 w-4" />
        </Button>

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

export function BlogDetailsClient({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR<BlogDetailResponse>(
    `/api/blogs/${encodeURIComponent(slug)}`,
  );
  const blog = data?.blog ?? null;
  const blogTags = parseBlogTags(blog?.tag);

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
