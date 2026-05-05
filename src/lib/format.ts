export type CurrencyCode = "UZS" | "USD" | "RUB" | "EUR";

export const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; name: string }
> = {
  UZS: { symbol: "so'm", name: "So'm" },
  USD: { symbol: "$", name: "Dollar" },
  RUB: { symbol: "₽", name: "Rubl" },
  EUR: { symbol: "€", name: "Yevro" },
};

const SUM_FORMATTER = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 2,
});

const RATE_FORMATTER = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 4,
});

export function formatSum(value: number, currency: CurrencyCode = "UZS") {
  if (!Number.isFinite(value)) return "—";
  const formatted = SUM_FORMATTER.format(Math.round(value * 100) / 100);
  return `${formatted} ${CURRENCIES[currency].symbol}`;
}

export function formatRate(value: number) {
  if (!Number.isFinite(value)) return "—";
  return RATE_FORMATTER.format(Math.round(value * 10000) / 10000);
}

export function formatNumberInput(raw: string): string {
  let v = raw.replace(/,/g, ".");
  v = v.replace(/[^\d.]/g, "");
  const firstDot = v.indexOf(".");
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  }
  const [intPart = "", decPart] = v.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

export function parseInputNumber(value: string): number {
  return parseFloat(value.replace(/\s/g, ""));
}

export function formatIntegerInput(raw: string): string {
  const v = raw.replace(/[^\d]/g, "");
  return v.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
