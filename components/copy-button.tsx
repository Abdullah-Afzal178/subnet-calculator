"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-900 transition hover:border-indigo-400 hover:bg-indigo-50"
    >
      {status === "copied" ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
      )}
      <span className="whitespace-nowrap">
        {status === "copied"
          ? copiedLabel
          : status === "error"
            ? "Copy failed"
            : label}
      </span>
    </button>
  );
}
