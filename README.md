This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Public Blog API

Published blogs are available as a read-only public API for use on external websites.

- `GET /api/blogs`
- `GET /api/blogs?limit=3`
- `GET /api/blogs?q=react`
- `GET /api/blogs?q=react&limit=6`
- `GET /api/blogs?view=internal`
- `GET /api/blogs/[slug]`

`GET /api/blogs` returns the latest 3 published posts by default. You can override that with the `limit` query param, for example `GET /api/blogs?limit=6`. Invalid or missing limits fall back to `3`, and the maximum accepted limit is `50`. These endpoints now send CORS headers, so browser-side fetches from other domains work without a proxy. If you want to restrict allowed origins, set `PUBLIC_BLOG_API_ORIGINS` as a comma-separated list, for example:

```bash
PUBLIC_BLOG_API_ORIGINS=https://site-one.com,https://site-two.com
```

Example usage from another site:

```ts
const response = await fetch("https://your-domain.com/api/blogs/my-post-slug");
const { blog } = await response.json();

document.querySelector("#blog-title")!.textContent = blog.title;
document.querySelector("#blog-content")!.innerHTML = blog.contentHtml;
```

The default public list response only includes `id`, `title`, `url`, `tag`, `excerpt`, `coverImage`, `date`, and `author.name`. The optional `view=internal` query param keeps the richer list shape used by this app itself. Public responses do not expose `author.email`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
