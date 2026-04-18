"use client";

import { Input } from "@/components/ui/input";
import { debounce, useQueryState } from "nuqs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [search, setSearch] = useQueryState("q", {
    history: "replace",
    shallow: true,
    limitUrlUpdates: debounce(300),
  });

  if (
    pathname.startsWith("/admin/editor") ||
    pathname.startsWith("/xmdx/editor") ||
    pathname.startsWith("/xmdx/blogs")
  ) {
    return null;
  }

  return (
    <header className="sticky left-0 top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-6 sm:px-0">
        <Link
          href="/"
          className="font-mono text-foreground transition-colors hover:text-primary"
        >
          ~/sandip
        </Link>

        <div className="hidden items-center gap-5 sm:flex">
          <Input
            aria-label="Search posts"
            placeholder="Search"
            value={search ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              void setSearch(value || null);
            }}
            className="w-56"
          />
        </div>
      </nav>
    </header>
  );
}
