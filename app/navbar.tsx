import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-border/60 bg-background sticky top-0 w-full left-0">
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
