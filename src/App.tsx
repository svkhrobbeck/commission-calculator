import { useMemo, useState } from "react";
import { Calculator, ArrowDownToLine, ArrowUpFromLine, Percent } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "inside" | "ontop" | "rate";

type Result = {
  total: number;
  commission: number;
  net: number;
  rate: number;
  formula: string;
};

const SUM_FORMATTER = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 2,
});

const RATE_FORMATTER = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 4,
});

function formatSum(value: number) {
  if (!Number.isFinite(value)) return "—";
  return SUM_FORMATTER.format(Math.round(value * 100) / 100);
}

function formatRate(value: number) {
  if (!Number.isFinite(value)) return "—";
  return RATE_FORMATTER.format(Math.round(value * 10000) / 10000);
}

function formatNumberInput(raw: string): string {
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

function parseInputNumber(value: string): number {
  return parseFloat(value.replace(/\s/g, ""));
}

function calculate(mode: Mode, a: number, b: number): Result | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  if (mode === "inside") {
    if (a <= 0 || b < 0) return null;
    const net = a / (1 + b / 100);
    const commission = a - net;
    return {
      total: a,
      commission,
      net,
      rate: b,
      formula: `Sof = ${formatSum(a)} / (1 + ${b} / 100);  Komissiya = ${formatSum(a)} − sof`,
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
      formula: `Umumiy summa = ${formatSum(a)} + (${formatSum(a)} × ${b} / 100)`,
    };
  }

  // rate: a = to'lanayotgan summa (jami), b = komissiya summasi
  // sof = a − b, foiz = komissiya / sof × 100
  if (a <= 0 || b < 0 || b >= a) return null;
  const net = a - b;
  const rate = (b / a) * 100;
  return {
    total: a,
    commission: b,
    net,
    rate,
    formula: `Sof = ${formatSum(a)} − ${formatSum(b)};  Foiz = (${formatSum(b)} / ${formatSum(a)}) × 100`,
  };
}

function ResultRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-border/60 py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
      <span
        className={
          emphasis
            ? "font-heading text-base font-semibold text-foreground tabular-nums sm:text-lg"
            : "text-sm text-foreground tabular-nums sm:text-base"
        }
      >
        {value}
      </span>
    </div>
  );
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

function CalculatorForm({ mode }: { mode: Mode }) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  const firstNum = parseInputNumber(first);
  const secondNum = parseInputNumber(second);

  const result = useMemo(() => calculate(mode, firstNum, secondNum), [mode, firstNum, secondNum]);

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
          onChange={e => setFirst(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${mode}-second`}>{labels.second}</Label>
        <Input
          id={`${mode}-second`}
          inputMode="decimal"
          placeholder={labels.secondHint}
          value={second}
          onChange={e => setSecond(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={reset} disabled={!first && !second}>
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
                value={formatSum(result.total)}
                emphasis
              />
              <ResultRow label="Komissiya summasi" value={formatSum(result.commission)} />
              <ResultRow label="Yakuniy tushadigan summa" value={formatSum(result.net)} />
            </div>
          )}

          {mode === "ontop" && (
            <div>
              <ResultRow label="Asosiy summa" value={formatSum(result.net)} />
              <ResultRow label="Komissiya summasi" value={formatSum(result.commission)} />
              <ResultRow
                label="Umumiy to'lanadigan summa"
                value={formatSum(result.total)}
                emphasis
              />
            </div>
          )}

          {mode === "rate" && (
            <div>
              <ResultRow label="Komissiya foizi" value={`${formatRate(result.rate)} %`} emphasis />
              <ResultRow label="To'lanayotgan summa" value={formatSum(result.total)} />
              <ResultRow label="Komissiya summasi" value={formatSum(result.commission)} />
              <ResultRow label="Sof tushadigan summa" value={formatSum(result.net)} />
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

function App() {
  return (
    <div className="min-h-svh bg-background px-3 py-6 text-foreground sm:px-4 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:gap-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calculator className="size-4 shrink-0" />
            <span className="text-xs sm:text-sm">Komissiya kalkulyatori</span>
          </div>
          <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-3xl">
            Komissiyani aniq hisoblang
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Pul o'tkazma va to'lovlar uchun komissiyani uch xil usulda hisoblang: komissiya summa
            ichida, ustidan qo'shilganda yoki komissiya foizini topish.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Hisoblash</CardTitle>
            <CardDescription>Hisoblash turini tanlang va ma'lumotlarni kiriting.</CardDescription>
          </CardHeader>
          <CardContent>
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
                <CalculatorForm mode="inside" />
              </TabsContent>
              <TabsContent value="ontop" className="mt-4">
                <CalculatorForm mode="ontop" />
              </TabsContent>
              <TabsContent value="rate" className="mt-4">
                <CalculatorForm mode="rate" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
