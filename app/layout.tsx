import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Provider from "./provider";
import Navbar from "./navbar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "~/sandip";
const siteDescription =
  "Practical notes on backend design, system architecture, frontend engineering, AI, and building reliable software.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: "Sandip Sarkar" }],
  creator: "Sandip Sarkar",
  publisher: "Sandip Sarkar",
  keywords: [
    "software engineering",
    "backend design",
    "system design",
    "frontend engineering",
    "AI engineering",
    "web development",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full dark antialiased"
    >
      <head>
        {/* Load heading font and preconnect external domains */}
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/satoshi" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Provider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          {children}
        </Provider>
      </body>
    </html>
  );
}
