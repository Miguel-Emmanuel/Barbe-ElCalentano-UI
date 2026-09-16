import type { ReactNode } from "react";

/** Brand wordmark in Cream Cake — only for “Calentano” / “EL CALENTANO”. */
export function BrandTitle({
  children = "El Calentano",
  className = "",
  as: Tag = "span",
}: {
  children?: ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
}) {
  return <Tag className={`font-display font-bold normal-case ${className}`}>{children}</Tag>;
}

