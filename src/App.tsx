import { useState } from "react";
import {
  CalendarClock,
  Calculator,
  Layers,
  Percent,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommissionCalculator } from "@/components/calculators/commission-calculator";
import { MarginCalculator } from "@/components/calculators/margin-calculator";
import { InstallmentCalculator } from "@/components/calculators/installment-calculator";
import { MultiLayerCalculator } from "@/components/calculators/multi-layer-calculator";
import { CURRENCIES, type CurrencyCode } from "@/lib/format";

type CalculatorKind = "commission" | "margin" | "installment" | "multi";

const CALCULATORS: Record<
  CalculatorKind,
  { name: string; description: string; icon: LucideIcon }
> = {
  commission: {
    name: "Komissiya",
    description: "Komissiya foizi yoki summasini hisoblash.",
    icon: Percent,
  },
  margin: {
    name: "Margin",
    description: "Tannarx, sotuv narxi va komissiyadan foydani topish.",
    icon: TrendingUp,
  },
  installment: {
    name: "Bo'lib to'lash",
    description: "Oddiy yoki annuitet bo'yicha oylik to'lov.",
    icon: CalendarClock,
  },
  multi: {
    name: "Ko'p qatlamli",
    description: "Bir nechta komissiya, soliq va xizmat haqlarini ketma-ket.",
    icon: Layers,
  },
};

function App() {
  const [kind, setKind] = useState<CalculatorKind>("commission");
  const [currency, setCurrency] = useState<CurrencyCode>("UZS");

  const active = CALCULATORS[kind];
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-svh bg-background px-3 py-6 text-foreground sm:px-4 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:gap-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calculator className="size-4 shrink-0" />
            <span className="text-xs sm:text-sm">Moliyaviy kalkulyator</span>
          </div>
          <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-3xl">
            Hisoblashni soddalashtirning
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Komissiya, margin, bo'lib to'lash va ko'p qatlamli to'lovlar uchun
            kalkulyatorlar.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActiveIcon className="size-4 shrink-0" />
              {active.name}
            </CardTitle>
            <CardDescription>{active.description}</CardDescription>
            <CardAction>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as CurrencyCode)}
              >
                <SelectTrigger className="w-20" aria-label="Valyuta">
                  <SelectValue>
                    <span className="font-mono text-xs">{currency}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                    <SelectItem key={code} value={code}>
                      <span className="font-mono text-xs text-muted-foreground">
                        {code}
                      </span>
                      <span>{CURRENCIES[code].name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Kalkulyator turi
              </span>
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as CalculatorKind)}
              >
                <SelectTrigger className="w-full" aria-label="Kalkulyator turi">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CALCULATORS) as CalculatorKind[]).map((k) => {
                    const Icon = CALCULATORS[k].icon;
                    return (
                      <SelectItem key={k} value={k}>
                        <Icon className="size-3.5" />
                        <span>{CALCULATORS[k].name}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {kind === "commission" && (
              <CommissionCalculator currency={currency} />
            )}
            {kind === "margin" && <MarginCalculator currency={currency} />}
            {kind === "installment" && (
              <InstallmentCalculator currency={currency} />
            )}
            {kind === "multi" && <MultiLayerCalculator currency={currency} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
