import { currencyFormatLocale } from "@/lib/locale-shared";

const fmt = new Intl.NumberFormat(currencyFormatLocale, {
  style: "currency",
  currency: "CHF",
});

const sizeClass = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
  xl: "text-xl font-semibold",
} as const;

export function CHFAmount({
  amount,
  size = "md",
  className = "",
}: {
  amount: number | string;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  const safe = Number.isFinite(n) ? n : 0;
  return (
    <span className={`tabular-nums ${sizeClass[size]} ${className}`.trim()}>
      {fmt.format(safe)}
    </span>
  );
}
