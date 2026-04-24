"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Reveal({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.18, ease: "easeOut" as const },
      };

  return (
    <motion.div {...animationProps}>{children}</motion.div>
  );
}
