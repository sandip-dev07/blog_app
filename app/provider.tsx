"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { swrConfig } from "@/lib/swr-config";
import { SWRConfig } from "swr";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      <TooltipProvider>
        {children}
        <Toaster richColors />
      </TooltipProvider>
    </SWRConfig>
  );
}
