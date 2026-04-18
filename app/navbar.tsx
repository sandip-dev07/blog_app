"use client";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin/editor") ||
    pathname.startsWith("/xmdx/editor") ||
    pathname.startsWith("/xmdx/blogs")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 left-0 z-40 w-full border-b border-border/60 bg-background">
      <nav className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-6 sm:px-0">
        <Link
          href="/"
          className="font-mono text-foreground hover:text-primary transition-colors"
        >
          ~/sandip
        </Link>

        <div className="flex items-center gap-5">
          <Input placeholder="Search" className="w-64" />
        </div>
      </nav>
    </header>
  );
}
