import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Calculator,
  Percent,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultRow } from "@/components/result-row";
import {
  type CurrencyCode,
  formatNumberInput,
  formatRate,
  formatSum,
  parseInputNumber,
} from "@/lib/format";

type Mode = "inside" | "ontop" | "rate";

type Result = {
  total: number;
  commission: number;
  net: number;
  rate: number;
  formula: string;
};

function calculate(
  mode: Mode,
  a: number,
  b: number,
  currency: CurrencyCode,
): Result | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const f = (v: number) => formatSum(v, currency);

  if (mode === "inside") {
    if (a <= 0 || b < 0) return null;
    const net = a / (1 + b / 100);
    const commission = a - net;
    return {
      total: a,
      commission,
      net,
      rate: b,
      formula: `Sof = ${f(a)} / (1 + ${b} / 100);  Komissiya = ${f(a)} − sof`,
    };
  }

  if (mode === "ontop") {
    if (a <= 0 || b < 0) return null;
    const commission = (a * b) / 100;
    const total = a + commission;
    return {
      total,
      commission,
      net: a,
      rate: b,
      formula: `Umumiy = ${f(a)} + (${f(a)} × ${b} / 100)`,
    };
  }

  if (a <= 0 || b < 0 || b >= a) return null;
  const net = a - b;
  const rate = (b / a) * 100;
  return {
    total: a,
    commission: b,
    net,
    rate,
    formula: `Foiz = (${f(b)} / ${f(a)}) × 100`,
  };
}

const FIELD_LABELS: Record<
  Mode,
  { first: string; firstHint: string; second: string; secondHint: string }
> = {
  inside: {
    first: "Yuboriladigan umumiy summa",
    firstHint: "masalan, 10 000 000",
    second: "Komissiya foizi (%)",
    secondHint: "masalan, 3.2",
  },
  ontop: {
    first: "Asosiy summa",
    firstHint: "masalan, 10 000 000",
    second: "Komissiya foizi (%)",
    secondHint: "masalan, 3.2",
  },
  rate: {
    first: "To'lanayotgan summa",
    firstHint: "masalan, 10 000 000",
    second: "Komissiya summasi",
    secondHint: "masalan, 320 000",
  },
};

function CommissionForm({
  mode,
  currency,
}: {
  mode: Mode;
  currency: CurrencyCode;
}) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  const firstNum = parseInputNumber(first);
  const secondNum = parseInputNumber(second);

  const result = useMemo(
    () => calculate(mode, firstNum, secondNum, currency),
    [mode, firstNum, secondNum, currency],
  );

  const reset = () => {
    setFirst("");
    setSecond("");
  };

  const labels = FIELD_LABELS[mode];

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-first`}>{labels.first}</Label>
        <Input
          id={`${mode}-first`}
          inputMode="decimal"
          placeholder={labels.firstHint}
          value={first}
          onChange={(e) => setFirst(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${mode}-second`}>{labels.second}</Label>
        <Input
          id={`${mode}-second`}
          inputMode="decimal"
          placeholder={labels.secondHint}
          value={second}
          onChange={(e) => setSecond(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={!first && !second}
        >
          Tozalash
        </Button>
      </div>

      {result ? (
        <div className="grid gap-3 rounded-lg bg-muted/40 p-3 sm:p-4">
          <div className="flex items-start gap-2 text-[10px] text-muted-foreground sm:text-xs">
            <Calculator className="mt-0.5 size-3 shrink-0 sm:size-3.5" />
            <span className="font-mono break-all">{result.formula}</span>
          </div>

          {mode === "inside" && (
            <div>
              <ResultRow
                label="Yuboriladigan umumiy summa"
                value={formatSum(result.total, currency)}
                emphasis
              />
              <ResultRow
                label="Komissiya summasi"
                value={formatSum(result.commission, currency)}
              />
              <ResultRow
                label="Yakuniy tushadigan summa"
                value={formatSum(result.net, currency)}
              />
            </div>
          )}

          {mode === "ontop" && (
            <div>
              <ResultRow
                label="Asosiy summa"
                value={formatSum(result.net, currency)}
              />
              <ResultRow
                label="Komissiya summasi"
                value={formatSum(result.commission, currency)}
              />
              <ResultRow
                label="Umumiy to'lanadigan summa"
                value={formatSum(result.total, currency)}
                emphasis
              />
            </div>
          )}

          {mode === "rate" && (
            <div>
              <ResultRow
                label="Komissiya foizi"
                value={`${formatRate(result.rate)} %`}
                emphasis
              />
              <ResultRow
                label="To'lanayotgan summa"
                value={formatSum(result.total, currency)}
              />
              <ResultRow
                label="Komissiya summasi"
                value={formatSum(result.commission, currency)}
              />
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
          Ma'lumotlarni kiriting — natija avtomatik chiqadi.
        </p>
      )}
    </div>
  );
}

export function CommissionCalculator({ currency }: { currency: CurrencyCode }) {
  return (
    <Tabs defaultValue="inside">
      <TabsList className="h-auto! grid w-full grid-cols-3 gap-1 p-1 sm:h-9!">
        <TabsTrigger
          value="inside"
          className="h-auto! flex-col gap-1 px-1 py-2 text-[11px] leading-tight whitespace-normal sm:h-[calc(100%-1px)]! sm:flex-row sm:gap-1.5 sm:px-1.5 sm:py-0.5 sm:text-sm"
        >
          <ArrowDownToLine className="size-3.5 shrink-0" />
          <span className="text-center">
            <span className="sm:hidden">Ichida</span>
            <span className="hidden sm:inline">Komissiya ichida</span>
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="ontop"
          className="h-auto! flex-col gap-1 px-1 py-2 text-[11px] leading-tight whitespace-normal sm:h-[calc(100%-1px)]! sm:flex-row sm:gap-1.5 sm:px-1.5 sm:py-0.5 sm:text-sm"
        >
          <ArrowUpFromLine className="size-3.5 shrink-0" />
          <span className="text-center">
            <span className="sm:hidden">Ustidan</span>
            <span className="hidden sm:inline">Komissiya ustidan</span>
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="rate"
          className="h-auto! flex-col gap-1 px-1 py-2 text-[11px] leading-tight whitespace-normal sm:h-[calc(100%-1px)]! sm:flex-row sm:gap-1.5 sm:px-1.5 sm:py-0.5 sm:text-sm"
        >
          <Percent className="size-3.5 shrink-0" />
          <span className="text-center">
            <span className="sm:hidden">Foizi</span>
            <span className="hidden sm:inline">Foizni topish</span>
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inside" className="mt-4">
        <CommissionForm mode="inside" currency={currency} />
      </TabsContent>
      <TabsContent value="ontop" className="mt-4">
        <CommissionForm mode="ontop" currency={currency} />
      </TabsContent>
      <TabsContent value="rate" className="mt-4">
        <CommissionForm mode="rate" currency={currency} />
      </TabsContent>
    </Tabs>
  );
}
