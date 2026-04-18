import BlogList from "@/components/blog-list";
import Reveal from "@/components/reveal";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-background px-6 py-8 text-foreground sm:px-0">
      <section id="blog" className="py-8">
        <Reveal>
          <h2 className="mb-2 text-4xl font-medium tracking-normal">
            Thoughts on code, design, and <br /> building for the web.
          </h2>
          <p className="mb-10 text-sm leading-6 text-muted-foreground"></p>
        </Reveal>

        <BlogList />
      </section>
    </main>
  );
}
