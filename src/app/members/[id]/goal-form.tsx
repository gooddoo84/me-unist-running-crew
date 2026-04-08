"use client";

import { useActionState } from "react";

export function GoalForm({
  memberId,
  year,
  month,
  currentGoal,
  action,
}: {
  memberId: string;
  year: number;
  month: number;
  currentGoal: number | null;
  action: (formData: FormData) => Promise<void>;
}) {
  async function handleAction(_prev: string | null, formData: FormData) {
    try {
      await action(formData);
      return "saved";
    } catch {
      return "error";
    }
  }

  const [state, formAction, isPending] = useActionState(handleAction, null);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="month" value={month} />
      <div className="flex-1">
        <input
          name="goalDistance"
          type="number"
          step="0.1"
          min="1"
          max="500"
          required
          defaultValue={currentGoal ?? ""}
          placeholder="목표 거리 (km)"
          className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {isPending ? "..." : state === "saved" ? "✓ 저장됨" : "설정"}
      </button>
    </form>
  );
}
