import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResultRow } from "@/components/result-row";
import {
  type CurrencyCode,
  formatNumberInput,
  formatSum,
  parseInputNumber,
} from "@/lib/format";

type LayerType = "deduct" | "add";
type ValueKind = "percent" | "amount";

type Layer = {
  id: string;
  label: string;
  type: LayerType;
  kind: ValueKind;
  value: string;
};

type LayerStep = {
  layer: Layer;
  delta: number;
  amountAfter: number;
};

const PRESETS: Omit<Layer, "id" | "value">[] = [
  { label: "Bank komissiyasi", type: "deduct", kind: "percent" },
  { label: "Platforma fee", type: "deduct", kind: "percent" },
  { label: "Soliq", type: "deduct", kind: "percent" },
  { label: "Yetkazib berish", type: "deduct", kind: "amount" },
];

let nextId = 0;
const newId = () => `layer-${++nextId}`;

function newLayer(preset?: Omit<Layer, "id" | "value">): Layer {
  return {
    id: newId(),
    label: preset?.label ?? "Komissiya",
    type: preset?.type ?? "deduct",
    kind: preset?.kind ?? "percent",
    value: "",
  };
}

function computeSteps(base: number, layers: Layer[]): LayerStep[] {
  let current = base;
  return layers.map((layer) => {
    const v = parseInputNumber(layer.value);
    let delta = 0;
    if (Number.isFinite(v) && v > 0) {
      const magnitude =
        layer.kind === "percent" ? (current * v) / 100 : v;
      delta = layer.type === "deduct" ? -magnitude : magnitude;
    }
    current = current + delta;
    return { layer, delta, amountAfter: current };
  });
}

export function MultiLayerCalculator({
  currency,
}: {
  currency: CurrencyCode;
}) {
  const [base, setBase] = useState("");
  const [layers, setLayers] = useState<Layer[]>(() => [
    newLayer(PRESETS[0]),
    newLayer(PRESETS[1]),
  ]);

  const baseNum = parseInputNumber(base);

  const steps = useMemo(
    () => (Number.isFinite(baseNum) && baseNum > 0 ? computeSteps(baseNum, layers) : null),
    [baseNum, layers],
  );

  const finalAmount = steps && steps.length ? steps[steps.length - 1].amountAfter : baseNum;
  const totalDelta = Number.isFinite(finalAmount) ? finalAmount - baseNum : 0;

  const updateLayer = (id: string, patch: Partial<Layer>) => {
    setLayers((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLayer = (id: string) => {
    setLayers((cur) => cur.filter((l) => l.id !== id));
  };

  const addLayer = (preset?: Omit<Layer, "id" | "value">) => {
    setLayers((cur) => [...cur, newLayer(preset)]);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="ml-base">Boshlang'ich summa</Label>
        <Input
          id="ml-base"
          inputMode="decimal"
          placeholder="masalan, 1 000 000"
          value={base}
          onChange={(e) => setBase(formatNumberInput(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label>Qatlamlar (ketma-ket qo'llaniladi)</Label>
        <div className="grid gap-2">
          {layers.map((layer, idx) => (
            <div
              key={layer.id}
              className="grid gap-2 rounded-lg border border-border/60 p-2"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground">
                  #{idx + 1}
                </span>
                <Input
                  className="h-7 text-xs"
                  placeholder="Nomi (masalan, Bank fee)"
                  value={layer.label}
                  onChange={(e) =>
                    updateLayer(layer.id, { label: e.target.value })
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeLayer(layer.id)}
                  aria-label="O'chirish"
                  className="size-7"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-1.5">
                <Select
                  value={layer.type}
                  onValueChange={(v) =>
                    updateLayer(layer.id, { type: v as LayerType })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deduct">− Ushlash</SelectItem>
                    <SelectItem value="add">+ Qo'shish</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={layer.kind}
                  onValueChange={(v) =>
                    updateLayer(layer.id, { kind: v as ValueKind })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">% Foiz</SelectItem>
                    <SelectItem value="amount">Summa</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  className="h-8 text-xs"
                  inputMode="decimal"
                  placeholder={layer.kind === "percent" ? "3.2" : "10 000"}
                  value={layer.value}
                  onChange={(e) =>
                    updateLayer(layer.id, {
                      value: formatNumberInput(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addLayer()}
          >
            <Plus className="size-3.5" />
            Yangi qatlam
          </Button>
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => addLayer(p)}
            >
              + {p.label}
            </Button>
          ))}
        </div>
      </div>

      {steps && steps.length > 0 ? (
        <div className="grid gap-3 rounded-lg bg-muted/40 p-3 sm:p-4">
          <div className="grid gap-1">
            <ResultRow
              label="Yakuniy summa"
              value={formatSum(finalAmount, currency)}
              emphasis
              tone={totalDelta >= 0 ? "positive" : "negative"}
            />
            <ResultRow
              label="Boshlang'ich summa"
              value={formatSum(baseNum, currency)}
            />
            <ResultRow
              label="Umumiy o'zgarish"
              value={`${totalDelta >= 0 ? "+" : ""}${formatSum(totalDelta, currency)}`}
              tone={totalDelta >= 0 ? "positive" : "negative"}
            />
          </div>

          <div className="grid gap-0.5">
            <div className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Bosqichma-bosqich
            </div>
            {steps.map((s, i) => (
              <div
                key={s.layer.id}
                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 border-b border-border/40 py-1 last:border-b-0 text-xs"
              >
                <span className="text-muted-foreground">
                  {i + 1}. {s.layer.label || "(nomsiz)"}
                  {s.layer.kind === "percent" && s.layer.value && (
                    <span className="ml-1 font-mono text-[10px]">
                      {s.layer.type === "deduct" ? "−" : "+"}
                      {s.layer.value}%
                    </span>
                  )}
                </span>
                <span className="tabular-nums">
                  <span
                    className={
                      s.delta < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : s.delta > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                    }
                  >
                    {s.delta >= 0 ? "+" : ""}
                    {formatSum(s.delta, currency)}
                  </span>
                  <span className="ml-2 font-medium">
                    = {formatSum(s.amountAfter, currency)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
          Boshlang'ich summa va kamida bitta qatlamni kiriting.
        </p>
      )}
    </div>
  );
}
