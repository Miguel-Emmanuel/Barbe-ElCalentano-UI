"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  id?: string;
  as?: "input" | "textarea";
  maxLength?: number;
  pattern?: string;
  rows?: number;
};

export function FloatingField({
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
  required,
  placeholder = " ",
  id,
  as = "input",
  maxLength,
  pattern,
  rows = 3,
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const floated = focused || value.trim().length > 0;

  const shared =
    "peer input-field pt-6 pb-2 placeholder:text-transparent transition-colors hover:bg-ink/85";

  return (
    <div className={`relative ${error ? "animate-shake" : ""}`}>
      <label
        htmlFor={fieldId}
        className={`pointer-events-none absolute left-4 z-10 origin-left transition-all duration-200 ${
          floated
            ? "top-2 text-[10px] uppercase tracking-wider text-gold"
            : "top-1/2 -translate-y-1/2 text-sm text-bone/45"
        } ${as === "textarea" && !floated ? "top-4 translate-y-0" : ""}`}
      >
        {label}
        {required ? " *" : ""}
      </label>
      {as === "textarea" ? (
        <textarea
          id={fieldId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${shared} min-h-[5.5rem] resize-y`}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          required={required}
          maxLength={maxLength}
          pattern={pattern}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={shared}
          aria-invalid={Boolean(error)}
        />
      )}
      <AnimatePresence>
        {error ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-xs text-brick-soft"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
