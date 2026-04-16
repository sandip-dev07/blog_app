import Link from "next/link";
import { notFound } from "next/navigation";

import { blogPosts } from "@/data/blogPosts";

const postBodies: Record<
  string,
  {
    sections: Array<
      | {
          type: "paragraphs";
          title: string;
          body: string[];
        }
      | {
          type: "code";
          title: string;
          body: string[];
          code: string;
        }
      | {
          type: "ordered";
          title: string;
          intro: string;
          items: Array<{ label: string; text: string }>;
        }
      | {
          type: "unordered";
          title: string;
          items: Array<{ label: string; text: string }>;
        }
    >;
  }
> = {
  "rest-to-trpc": {
    sections: [
      {
        type: "paragraphs",
        title: "The Problem with REST",
        body: [
          "After years of building REST APIs, I kept running into the same frustrations: mismatched types between frontend and backend, outdated API documentation, and runtime errors that could have been caught at compile time.",
          "Every time I changed a response shape on the server, I had to manually update the client code - and hope I didn't miss anything.",
        ],
      },
      {
        type: "code",
        title: "Enter tRPC",
        body: [
          "tRPC gives you end-to-end type safety without code generation. Your server defines procedures, and your client automatically knows the input and output types. Change a field on the server? TypeScript immediately flags every place in your frontend that needs updating.",
        ],
        code: `// server
export const appRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({ where: { id: input.id } });
    }),
});`,
      },
      {
        type: "ordered",
        title: "The Migration",
        intro:
          "I migrated three production projects over two months. The process was straightforward:",
        items: [
          {
            label: "Set up the tRPC server",
            text: "alongside the existing REST API",
          },
          {
            label: "Migrate endpoints one at a time",
            text: "starting with the simplest",
          },
          {
            label: "Remove old REST routes",
            text: "once the tRPC equivalents were stable",
          },
          {
            label: "Delete the manual type definitions",
            text: "that were no longer needed",
          },
        ],
      },
      {
        type: "unordered",
        title: "Results",
        items: [
          {
            label: "40% fewer bugs",
            text: "related to API contracts",
          },
          {
            label: "Faster iteration",
            text: "changing an API and its consumers takes minutes, not hours",
          },
          {
            label: "Better DX",
            text: "autocomplete for every API call, no more guessing field names",
          },
        ],
      },
      {
        type: "paragraphs",
        title: "Should You Switch?",
        body: [
          "tRPC shines when you control both the client and server, especially in monorepo setups. If you're building a public API consumed by third parties, REST or GraphQL might still be a better fit.",
          "But for full-stack TypeScript projects? It's been a game changer.",
        ],
      },
    ],
  },
  "design-systems-that-scale": {
    sections: [
      {
        type: "paragraphs",
        title: "Start with Decisions",
        body: [
          "A useful design system is less about collecting components and more about recording decisions. Tokens, variants, and naming rules keep every screen moving in the same direction.",
          "The system starts to scale when teams can ship new UI without asking the same questions again.",
        ],
      },
      {
        type: "unordered",
        title: "What Matters",
        items: [
          {
            label: "Tokens",
            text: "make color, spacing, and type changes predictable",
          },
          {
            label: "Variants",
            text: "keep component states explicit",
          },
          {
            label: "Examples",
            text: "show when a pattern should be used",
          },
        ],
      },
    ],
  },
  "shipping-side-projects": {
    sections: [
      {
        type: "paragraphs",
        title: "Scope Wins",
        body: [
          "Side projects usually fail from oversized ambition, not lack of ideas. The trick is to pick one sharp outcome and cut everything that does not support it.",
          "A small shipped project teaches more than a large private prototype.",
        ],
      },
      {
        type: "ordered",
        title: "A Practical Loop",
        intro: "The cadence that works for me is simple:",
        items: [
          {
            label: "Define the launch shape",
            text: "before writing code",
          },
          {
            label: "Set a short deadline",
            text: "and protect it",
          },
          {
            label: "Ship the useful version",
            text: "then improve from real feedback",
          },
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ id: post.slug }));
}

export default async function BlogDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = blogPosts.find((item) => item.slug === id);
  const body = post ? postBodies[post.slug] : null;

  if (!post || !body) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-background px-6 py-6 text-foreground sm:px-0">
      <article className="mx-auto w-full pb-20">
        <Link
          href="/"
          className="mb-6 inline-flex text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back
        </Link>

        <header className="border-b border-border pb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
              {post.tag}
            </span>
            <span>{post.date}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="text-[28px] font-medium leading-tight tracking-normal text-foreground">
            {post.title}
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {post.summary}
          </p>
        </header>

        <div className="space-y-10 pt-12">
          {body.sections.map((section) => {
            if (section.type === "code") {
              return (
                <section key={section.title}>
                  <h2 className="mb-4 text-base font-medium text-foreground">
                    {section.title}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mb-4 text-sm leading-6 text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                  <pre className="overflow-x-auto rounded-md bg-muted p-5 text-xs leading-5 text-foreground/80">
                    <code>{section.code}</code>
                  </pre>
                </section>
              );
            }

            if (section.type === "ordered") {
              return (
                <section key={section.title}>
                  <h2 className="mb-4 text-base font-medium text-foreground">
                    {section.title}
                  </h2>
                  <p className="mb-4 text-sm leading-6 text-muted-foreground">
                    {section.intro}
                  </p>
                  <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <strong className="font-medium text-foreground">
                          {item.label}
                        </strong>{" "}
                        {item.text}
                      </li>
                    ))}
                  </ol>
                </section>
              );
            }

            if (section.type === "unordered") {
              return (
                <section key={section.title}>
                  <h2 className="mb-4 text-base font-medium text-foreground">
                    {section.title}
                  </h2>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <strong className="font-medium text-foreground">
                          {item.label}
                        </strong>{" "}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            }

            return (
              <section key={section.title}>
                <h2 className="mb-4 text-base font-medium text-foreground">
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-4 text-sm leading-6 text-muted-foreground last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            );
          })}
        </div>
      </article>
    </main>
  );
}
