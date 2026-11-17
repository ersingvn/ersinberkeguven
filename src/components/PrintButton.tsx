"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print cursor-pointer rounded border border-line px-3 py-1.5 text-sm text-muted hover:border-fg hover:text-fg"
    >
      {label}
    </button>
  );
}
