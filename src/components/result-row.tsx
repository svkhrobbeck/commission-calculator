export function ResultRow({
  label,
  value,
  emphasis = false,
  tone = "default",
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
        ? "text-rose-600 dark:text-rose-400"
        : "text-foreground";
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-border/60 py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
      <span
        className={
          emphasis
            ? `font-heading text-base font-semibold tabular-nums sm:text-lg ${toneClass}`
            : `text-sm tabular-nums sm:text-base ${toneClass}`
        }
      >
        {value}
      </span>
    </div>
  );
}
