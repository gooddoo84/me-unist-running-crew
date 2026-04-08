"use client";

import { useActionState } from "react";

interface Member {
  id: string;
  name: string;
  emoji: string;
}

export function LogForm({
  members,
  action,
}: {
  members: Member[];
  action: (formData: FormData) => Promise<void>;
}) {
  const today = new Date().toISOString().split("T")[0];

  async function handleAction(_prev: string | null, formData: FormData) {
    try {
      await action(formData);
      return null;
    } catch {
      return "입력값을 확인해주세요.";
    }
  }

  const [error, formAction, isPending] = useActionState(handleAction, null);

  return (
    <form action={formAction} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Member Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="memberId">
          멤버 선택
        </label>
        <select
          id="memberId"
          name="memberId"
          required
          className="w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors appearance-none"
        >
          <option value="">멤버를 선택하세요</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji} {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Distance */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="distance">
          달린 거리 (km)
        </label>
        <input
          id="distance"
          name="distance"
          type="number"
          step="0.01"
          min="0.01"
          max="100"
          required
          placeholder="5.00"
          className="w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="runDate">
          날짜
        </label>
        <input
          id="runDate"
          name="runDate"
          type="date"
          required
          defaultValue={today}
          className="w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent py-3.5 font-bold text-accent-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
            기록 중...
          </span>
        ) : (
          "기록 저장 🏃‍♂️"
        )}
      </button>
    </form>
  );
}
