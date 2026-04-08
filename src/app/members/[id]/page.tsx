import { Suspense } from "react";
import { getMemberDetail, setMonthlyGoal, deleteRunningLog } from "@/actions";
import { notFound } from "next/navigation";
import { ProgressRing } from "@/components/progress-ring";
import { MonthNav } from "@/components/month-nav";
import { GoalForm } from "./goal-form";
import { LogList } from "./log-list";
import Link from "next/link";

async function MemberContent({
  memberId,
  year,
  month,
}: {
  memberId: string;
  year: number;
  month: number;
}) {
  const detail = await getMemberDetail(memberId, year, month);
  if (!detail) notFound();

  const { member, logs, totalDistance, goalDistance } = detail;
  const percentage = goalDistance ? (totalDistance / goalDistance) * 100 : 0;

  async function handleSetGoal(formData: FormData) {
    "use server";
    await setMonthlyGoal(formData);
  }

  async function handleDeleteLog(formData: FormData) {
    "use server";
    const logId = formData.get("logId") as string;
    await deleteRunningLog(logId, memberId);
  }

  return (
    <>
      {/* Profile Card */}
      <div className="rounded-2xl bg-card border border-border p-6 text-center">
        <div className="text-5xl mb-3">{member.emoji}</div>
        <h2 className="text-xl font-bold">{member.name}</h2>

        {/* Progress */}
        <div className="mt-6">
          <ProgressRing percentage={percentage} size={120} strokeWidth={8} />
          <div className="mt-3 space-y-1">
            <p className="text-2xl font-bold tabular-nums text-accent">
              {totalDistance.toFixed(1)} km
            </p>
            {goalDistance ? (
              <p className="text-sm text-muted-foreground">
                목표 {goalDistance} km 중 {Math.round(percentage)}% 달성
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                아래에서 이번 달 목표를 설정하세요
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Goal Setting */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          🎯 월별 목표 설정
        </h3>
        <GoalForm
          memberId={memberId}
          year={year}
          month={month}
          currentGoal={goalDistance}
          action={handleSetGoal}
        />
      </div>

      {/* Running History */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          📋 이번 달 러닝 기록 ({logs.length}건)
        </h3>
        <LogList logs={logs} deleteAction={handleDeleteLog} />
      </div>
    </>
  );
}

export default async function MemberPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const now = new Date();
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth() + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="rounded-lg px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          ← 뒤로
        </Link>
      </div>

      <MonthNav year={year} month={month} />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        }
      >
        <MemberContent memberId={params.id} year={year} month={month} />
      </Suspense>
    </div>
  );
}
