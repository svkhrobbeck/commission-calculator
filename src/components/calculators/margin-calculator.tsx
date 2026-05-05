import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultRow } from "@/components/result-row";
import {
  type CurrencyCode,
  formatNumberInput,
  formatRate,
  formatSum,
  parseInputNumber,
} from "@/lib/format";

type CommissionType = "percent" | "amount";

type MarginResult = {
  cost: number;
  selling: number;
  commission: number;
  profit: number;
  marginPct: number;
  markupPct: number;
};

function calculate(
  cost: number,
  selling: number,
  commissionInput: number,
  commissionType: CommissionType,
): MarginResult | null {
  if (
    !Number.isFinite(cost) ||
    !Number.isFinite(selling) ||
    !Number.isFinite(commissionInput)
  )
    return null;
  if (cost < 0 || selling <= 0 || commissionInput < 0) return null;

  const commission =
    commissionType === "percent"
      ? (selling * commissionInput) / 100
      : commissionInput;

  const profit = selling - cost - commission;
  const marginPct = (profit / selling) * 100;
  const markupPct = cost > 0 ? (profit / cost) * 100 : 0;

  return {
    cost,
    selling,
    commission,
    profit,
    marginPct,
    markupPct,
  };
}

export function MarginCalculator({ currency }: { currency: CurrencyCode }) {
  const [commissionType, setCommissionType] = useState<CommissionType>(
    "percent",
  );
  const [cost, setCost] = useState("");
  const [selling, setSelling] = useState("");
  const [commission, setCommission] = useState("");

  const result = useMemo(
    () =>
      calculate(
        parseInputNumber(cost),
        parseInputNumber(selling),
        parseInputNumber(commission),
        commissionType,
      ),
    [cost, selling, commission, commissionType],
  );

  const reset = () => {
    setCost("");
    setSelling("");
    setCommission("");
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="margin-cost">Tannarx (cost price)</Label>
        <Input
          id="margin-cost"
          inputMode="decimal"
          placeholder="masalan, 80 000"
          value={cost}
          onChange={(e) => setCost(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="margin-selling">Sotuv narxi (selling price)</Label>
        <Input
          id="margin-selling"
          inputMode="decimal"
          placeholder="masalan, 120 000"
          value={selling}
          onChange={(e) => setSelling(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-end justify-between gap-2">
          <Label htmlFor="margin-commission">Komissiya</Label>
          <Tabs
            value={commissionType}
            onValueChange={(v) => setCommissionType(v as CommissionType)}
          >
            <TabsList className="h-7! p-0.5">
              <TabsTrigger
                value="percent"
                className="h-[calc(100%-2px)]! px-2 text-xs"
              >
                Foiz
              </TabsTrigger>
              <TabsTrigger
                value="amount"
                className="h-[calc(100%-2px)]! px-2 text-xs"
              >
                Summa
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Input
          id="margin-commission"
          inputMode="decimal"
          placeholder={
            commissionType === "percent" ? "masalan, 5" : "masalan, 6 000"
          }
          value={commission}
          onChange={(e) => setCommission(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={!cost && !selling && !commission}
        >
          Tozalash
        </Button>
      </div>

      {result ? (
        <div className="grid gap-1 rounded-lg bg-muted/40 p-3 sm:p-4">
          <ResultRow
            label="Sof foyda (profit)"
            value={formatSum(result.profit, currency)}
            emphasis
            tone={result.profit >= 0 ? "positive" : "negative"}
          />
          <ResultRow
            label="Margin (% sotuvdan)"
            value={`${formatRate(result.marginPct)} %`}
            tone={result.marginPct >= 0 ? "positive" : "negative"}
          />
          <ResultRow
            label="Markup (% tannarxdan)"
            value={`${formatRate(result.markupPct)} %`}
          />
          <ResultRow
            label="Komissiya"
            value={formatSum(result.commission, currency)}
          />
          <ResultRow
            label="Tannarx"
            value={formatSum(result.cost, currency)}
          />
          <ResultRow
            label="Sotuv narxi"
            value={formatSum(result.selling, currency)}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
          <TrendingUp className="mr-2 inline size-4" />
          Tannarx, sotuv narxi va komissiyani kiriting.
        </p>
      )}
    </div>
  );
}
