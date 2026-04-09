"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface MonthNavProps {
  year: number;
  month: number;
}

export function MonthNav({ year, month }: MonthNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(newYear: number, newMonth: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(newYear));
    params.set("month", String(newMonth));
    router.push(`?${params.toString()}`);
  }

  function goPrev() {
    if (month === 1) navigate(year - 1, 12);
    else navigate(year, month - 1);
  }

  function goNext() {
    if (month === 12) navigate(year + 1, 1);
    else navigate(year, month + 1);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={goPrev}
        className="rounded-lg px-3 py-2 border-glow text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="이전 달"
      >
        ←
      </button>
      <h2 className="text-lg font-bold tabular-nums">
        {year}년 {month}월
      </h2>
      <button
        onClick={goNext}
        className="rounded-lg px-3 py-2 border-glow text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="다음 달"
      >
        →
      </button>
    </div>
  );
}
