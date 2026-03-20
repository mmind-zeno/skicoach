import type { ReactNode } from "react";

function MetricValue({ value }: { value: ReactNode }) {
  if (typeof value === "string" || typeof value === "number") {
    return (
      <span className="text-xl font-semibold tabular-nums">{value}</span>
    );
  }
  return value;
}

export function MetricCard({
  label,
  value,
  sub,
  subType = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  subType?: "positive" | "warning" | "neutral";
}) {
  const subColor =
    subType === "positive"
      ? "text-emerald-700"
      : subType === "warning"
        ? "text-amber-800"
        : "text-sk-ink/60";
  return (
    <div className="rounded-[10px] border border-black/[0.08] bg-white p-3 shadow-sm">
      <div className="text-xs text-sk-ink/60">{label}</div>
      <div className="mt-1 text-sk-ink">
        <MetricValue value={value} />
      </div>
      {sub ? <div className={`mt-1 text-xs ${subColor}`}>{sub}</div> : null}
    </div>
  );
}
