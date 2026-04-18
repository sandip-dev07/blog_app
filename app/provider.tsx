"use client";

import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { swrConfig } from "@/lib/swr-config";
import { SWRConfig } from "swr";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      <TooltipProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster richColors />
      </TooltipProvider>
    </SWRConfig>
  );
}
