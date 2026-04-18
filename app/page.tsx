import Image from "next/image";

import BlogList from "@/components/blog-list";
import Reveal from "@/components/reveal";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-background px-6 py-10 text-foreground sm:px-0 sm:py-14">
      <section id="blog" className="space-y-10">
        <Reveal>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Engineering Notes
              </p>
              <h1 className="max-w-xl text-4xl font-medium leading-tight tracking-normal text-foreground sm:text-5xl">
                Useful ideas for building better software.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
                Practical notes on backend design, system architecture,
                frontend engineering, AI, and the perspective behind reliable
                software decisions.
              </p>
            </div>

            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card sm:flex">
              <Image
                src="/globe.svg"
                alt=""
                width={18}
                height={18}
                className="opacity-70 invert"
                priority
              />
            </div>
          </div>
        </Reveal>

        <div className="border-t border-border pt-6">
          <BlogList />
        </div>
      </section>
    </main>
  );
}
