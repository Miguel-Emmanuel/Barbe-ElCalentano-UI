"use client";

import { motion } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { easeOut, useIsMobile } from "@/lib/motion";

function setRipplePos(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--rx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  el.style.setProperty("--ry", `${((e.clientY - rect.top) / rect.height) * 100}%`);
}

type LinkProps = {
  children: ReactNode;
  className?: string;
  variant?: "gold" | "ghost";
  loading?: boolean;
  href: string;
  target?: string;
  rel?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export function MotionLinkButton({
  children,
  className = "",
  variant = "gold",
  loading = false,
  onClick,
  href,
  target,
  rel,
}: LinkProps) {
  const mobile = useIsMobile();
  const base =
    variant === "gold"
      ? "btn-gold relative overflow-hidden"
      : "btn-ghost relative overflow-hidden";

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      whileHover={mobile ? undefined : { scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`${base} ${className}`}
      onClick={(e) => {
        setRipplePos(e);
        onClick?.(e);
      }}
    >
      <motion.span
        className="relative z-10 inline-flex items-center gap-2"
        initial={false}
        animate={{ opacity: loading ? 0.7 : 1 }}
        transition={{ duration: 0.2, ease: easeOut }}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
        ) : null}
        {children}
      </motion.span>
    </motion.a>
  );
}

type ButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "gold" | "ghost";
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  "aria-label"?: string;
};

export function MotionButton({
  children,
  className = "",
  variant = "gold",
  loading = false,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const mobile = useIsMobile();
  const base =
    variant === "gold"
      ? "btn-gold relative overflow-hidden"
      : "btn-ghost relative overflow-hidden";

  return (
    <motion.button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={mobile ? undefined : { scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`${base} ${className}`}
      onClick={(e) => {
        setRipplePos(e);
        onClick?.(e);
      }}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        ) : null}
        {children}
      </span>
    </motion.button>
  );
}
