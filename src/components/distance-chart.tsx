"use client";

interface DailyData {
  date: string;
  distance: number;
}

interface MonthlyData {
  year: number;
  month: number;
  total: number;
}

function BarChart({
  items,
  labelFn,
  valueFn,
}: {
  items: { label: string; value: number }[];
  labelFn?: (label: string) => string;
  valueFn?: (value: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value), 0.1);

  return (
    <div className="flex items-end gap-1 h-32">
      {items.map((item, i) => {
        const height = (item.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {item.value > 0 ? (valueFn ? valueFn(item.value) : item.value.toFixed(1)) : ""}
            </span>
            <div className="w-full flex items-end" style={{ height: "80px" }}>
              <div
                className="w-full rounded-t bg-accent/80 transition-all duration-500 min-h-[2px]"
                style={{ height: item.value > 0 ? `${Math.max(height, 5)}%` : "2px" }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">
              {labelFn ? labelFn(item.label) : item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DistanceChart({
  daily,
  monthly,
}: {
  daily: DailyData[];
  monthly: MonthlyData[];
}) {
  const dailyItems = daily.map((d) => ({
    label: d.date,
    value: d.distance,
  }));

  const monthlyItems = monthly.map((m) => ({
    label: `${m.year}-${m.month}`,
    value: m.total,
  }));

  return (
    <div className="space-y-6">
      {/* Daily chart */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          📅 일별 거리 (km)
        </h3>
        {dailyItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            이번 달 기록이 없습니다
          </p>
        ) : (
          <BarChart
            items={dailyItems}
            labelFn={(l) => l.split("-")[2]}
          />
        )}
      </div>

      {/* Monthly chart */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          📊 월별 추이 (km)
        </h3>
        <BarChart
          items={monthlyItems}
          labelFn={(l) => `${l.split("-")[1]}월`}
        />
      </div>
    </div>
  );
}
