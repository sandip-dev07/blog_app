"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";

import { Input } from "@/components/ui/input";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useQueryState("search", {
    history: "replace",
    shallow: true,
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
          ~/blogg-x
        </Link>

        <div className="items-center gap-5 flex">
          <form
            key={`${pathname}:${search ?? ""}`}
            onSubmit={(event) => {
              event.preventDefault();

              const formData = new FormData(event.currentTarget);
              const value = String(formData.get("search") ?? "").trim();

              if (pathname === "/") {
                void setSearch(value || null);
                return;
              }

              router.push(value ? `/?search=${encodeURIComponent(value)}` : "/");
            }}
          >
            <Input
              name="search"
              aria-label="Search posts"
              placeholder="Search"
              defaultValue={search ?? ""}
              className="w-56"
            />
          </form>
        </div>
      </nav>
    </header>
  );
}
