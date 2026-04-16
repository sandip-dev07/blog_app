"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { blogPosts } from "@/data/blogPosts";

export default function BlogList() {
  return (
    <div id="posts" className="flex flex-col gap-1">
      {blogPosts.map((post, i) => (
        <motion.div
          key={post.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.4,
            delay: i * 0.08,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <Link
            href={`/blogs/${post.slug}`}
            className="group -mx-3 flex items-start justify-between gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-card"
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

              <h3 className="text-sm font-medium tracking-normal text-foreground transition-colors group-hover:text-orange-300">
                {post.title}
              </h3>

              <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-relaxed text-muted-foreground">
                {post.summary}
              </p>
            </div>

            <ArrowUpRight
              size={14}
              className="mt-6 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-500 group-hover:opacity-100"
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
