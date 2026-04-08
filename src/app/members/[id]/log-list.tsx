"use client";

interface Log {
  id: string;
  distance: number;
  runDate: string;
}

export function LogList({
  logs,
  deleteAction,
}: {
  logs: Log[];
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        이번 달 기록이 없습니다. 달리러 가볼까요? 🏃
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between rounded-lg bg-background/50 border border-border/50 px-3 py-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {new Date(log.runDate + "T00:00:00").toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}
            </span>
            <span className="font-semibold text-sm tabular-nums text-accent">
              {log.distance.toFixed(2)} km
            </span>
          </div>
          <form action={deleteAction}>
            <input type="hidden" name="logId" value={log.id} />
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
              title="삭제"
            >
              ✕
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
