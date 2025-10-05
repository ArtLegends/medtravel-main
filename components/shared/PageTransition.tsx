// components/shared/PageTransition.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const PageTransition = React.memo(
  ({ children }: PageTransitionProps) => {
    const pathname = usePathname();

    return (
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={pathname}
          animate="enter"
          className="flex-1 flex flex-col"
          exit="exit"
          initial="initial"
          variants={pageVariants}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  },
);

PageTransition.displayName = "PageTransition";
