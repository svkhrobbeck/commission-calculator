import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultRow } from "@/components/result-row";
import {
  type CurrencyCode,
  formatIntegerInput,
  formatNumberInput,
  formatRate,
  formatSum,
  parseInputNumber,
} from "@/lib/format";

type InstallmentMode = "simple" | "annuity";

const PRESET_MONTHS = [3, 6, 12, 24] as const;

type SimpleResult = {
  monthly: number;
  total: number;
  months: number;
};

type AnnuityResult = {
  monthly: number;
  total: number;
  overpayment: number;
  principal: number;
  rate: number;
  months: number;
};

function calcSimple(amount: number, months: number): SimpleResult | null {
  if (!Number.isFinite(amount) || !Number.isFinite(months)) return null;
  if (amount <= 0 || months <= 0) return null;
  return {
    monthly: amount / months,
    total: amount,
    months,
  };
}

function calcAnnuity(
  principal: number,
  annualRate: number,
  months: number,
): AnnuityResult | null {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(months)
  )
    return null;
  if (principal <= 0 || annualRate < 0 || months <= 0) return null;

  const r = annualRate / 100 / 12;
  let monthly: number;
  if (r === 0) {
    monthly = principal / months;
  } else {
    monthly = (principal * r * Math.pow(1 + r, months)) /
      (Math.pow(1 + r, months) - 1);
  }
  const total = monthly * months;
  const overpayment = total - principal;
  return {
    monthly,
    total,
    overpayment,
    principal,
    rate: annualRate,
    months,
  };
}

function SimpleForm({ currency }: { currency: CurrencyCode }) {
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("3");

  const result = useMemo(
    () => calcSimple(parseInputNumber(amount), parseInputNumber(months)),
    [amount, months],
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="simple-amount">Umumiy summa</Label>
        <Input
          id="simple-amount"
          inputMode="decimal"
          placeholder="masalan, 12 000 000"
          value={amount}
          onChange={(e) => setAmount(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="simple-months">Muddat (oy)</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_MONTHS.map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={months === String(m) ? "default" : "outline"}
              onClick={() => setMonths(String(m))}
            >
              {m} oy
            </Button>
          ))}
        </div>
        <Input
          id="simple-months"
          inputMode="numeric"
          placeholder="yoki kiriting"
          value={months}
          onChange={(e) => setMonths(formatIntegerInput(e.target.value))}
        />
      </div>

      {result ? (
        <div className="grid gap-1 rounded-lg bg-muted/40 p-3 sm:p-4">
          <ResultRow
            label={`Har oy (${result.months} oy)`}
            value={formatSum(result.monthly, currency)}
            emphasis
          />
          <ResultRow
            label="Umumiy to'lov"
            value={formatSum(result.total, currency)}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
          Summa va muddatni kiriting.
        </p>
      )}
    </div>
  );
}

function AnnuityForm({ currency }: { currency: CurrencyCode }) {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("12");

  const result = useMemo(
    () =>
      calcAnnuity(
        parseInputNumber(principal),
        parseInputNumber(rate),
        parseInputNumber(months),
      ),
    [principal, rate, months],
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="ann-principal">Kredit summasi</Label>
        <Input
          id="ann-principal"
          inputMode="decimal"
          placeholder="masalan, 50 000 000"
          value={principal}
          onChange={(e) => setPrincipal(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ann-rate">Yillik foiz stavkasi (%)</Label>
        <Input
          id="ann-rate"
          inputMode="decimal"
          placeholder="masalan, 24"
          value={rate}
          onChange={(e) => setRate(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ann-months">Muddat (oy)</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_MONTHS.map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={months === String(m) ? "default" : "outline"}
              onClick={() => setMonths(String(m))}
            >
              {m} oy
            </Button>
          ))}
        </div>
        <Input
          id="ann-months"
          inputMode="numeric"
          placeholder="yoki kiriting"
          value={months}
          onChange={(e) => setMonths(formatIntegerInput(e.target.value))}
        />
      </div>

      {result ? (
        <div className="grid gap-1 rounded-lg bg-muted/40 p-3 sm:p-4">
          <ResultRow
            label={`Har oy (${result.months} oy)`}
            value={formatSum(result.monthly, currency)}
            emphasis
          />
          <ResultRow
            label="Umumiy to'lov"
            value={formatSum(result.total, currency)}
          />
          <ResultRow
            label="Ortiqcha (foizlar)"
            value={formatSum(result.overpayment, currency)}
            tone="negative"
          />
          <ResultRow
            label="Yillik stavka"
            value={`${formatRate(result.rate)} %`}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
          Summa, foiz va muddatni kiriting.
        </p>
      )}
    </div>
  );
}

export function InstallmentCalculator({
  currency,
}: {
  currency: CurrencyCode;
}) {
  const [mode, setMode] = useState<InstallmentMode>("simple");

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as InstallmentMode)}>
      <TabsList className="h-auto! grid w-full grid-cols-2 gap-1 p-1 sm:h-9!">
        <TabsTrigger
          value="simple"
          className="h-auto! px-2 py-1.5 text-xs whitespace-normal sm:h-[calc(100%-1px)]! sm:py-0.5 sm:text-sm"
        >
          Oddiy bo'lish
        </TabsTrigger>
        <TabsTrigger
          value="annuity"
          className="h-auto! px-2 py-1.5 text-xs whitespace-normal sm:h-[calc(100%-1px)]! sm:py-0.5 sm:text-sm"
        >
          Foizli (annuitet)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="simple" className="mt-4">
        <SimpleForm currency={currency} />
      </TabsContent>
      <TabsContent value="annuity" className="mt-4">
        <AnnuityForm currency={currency} />
      </TabsContent>
    </Tabs>
  );
}
