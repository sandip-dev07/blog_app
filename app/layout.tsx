import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import Navbar from "./navbar";
import Provider from "./provider";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-hanken-grotesk",
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "sans-serif",
  ],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "~/sandip";
const siteDescription =
  "Practical insights on backend design, system architecture, frontend engineering, AI, and building reliable software.";

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
      className={`${hankenGrotesk.variable} h-full dark antialiased`}
    >
      <body className={`${hankenGrotesk.variable} min-h-full flex flex-col`} suppressHydrationWarning>
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
