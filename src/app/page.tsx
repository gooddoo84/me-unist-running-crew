import { Suspense } from "react";
import { getMonthlyRanking, getCrewStats } from "@/actions";
import { MonthNav } from "@/components/month-nav";
import { ProgressRing } from "@/components/progress-ring";
import Link from "next/link";

function getRankStyle(rank: number) {
  if (rank === 1) return { badge: "🥇", color: "text-gold" };
  if (rank === 2) return { badge: "🥈", color: "text-silver" };
  if (rank === 3) return { badge: "🥉", color: "text-bronze" };
  return { badge: `${rank}`, color: "text-muted-foreground" };
}

async function Dashboard({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const [ranking, stats] = await Promise.all([
    getMonthlyRanking(year, month),
    getCrewStats(year, month),
  ]);

  return (
    <>
      {/* Crew Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-accent tabular-nums">
            {stats.totalDistance.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">총 거리(km)</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold tabular-nums">
            {stats.activeMembers}
            <span className="text-sm text-muted-foreground font-normal">
              /{stats.memberCount}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">활동 멤버</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-accent tabular-nums">
            {stats.goalAchievers}
          </p>
          <p className="text-xs text-muted-foreground mt-1">목표 달성</p>
        </div>
      </div>

      {/* Ranking Board */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          랭킹 보드
        </h3>
        {ranking.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            아직 멤버가 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {ranking.map((member, index) => {
              const rank = index + 1;
              const { badge, color } = getRankStyle(rank);
              const percentage = member.goalDistance
                ? (member.totalDistance / member.goalDistance) * 100
                : 0;

              return (
                <Link
                  key={member.memberId}
                  href={`/members/${member.memberId}`}
                  className="flex items-center gap-3 rounded-xl bg-card border border-border p-4 hover:border-accent/50 transition-all group"
                >
                  {/* Rank */}
                  <div className={`text-xl font-bold w-8 text-center ${color}`}>
                    {rank <= 3 ? badge : badge}
                  </div>

                  {/* Profile */}
                  <div className="text-2xl">{member.emoji}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate group-hover:text-accent transition-colors">
                      {member.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold tabular-nums text-accent">
                        {member.totalDistance.toFixed(1)} km
                      </span>
                      {member.goalDistance && (
                        <span className="text-xs text-muted-foreground">
                          / {member.goalDistance} km
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    {member.goalDistance && (
                      <div className="mt-2 h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-700"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Achievement */}
                  {member.goalDistance ? (
                    <div className="text-right shrink-0">
                      <ProgressRing percentage={percentage} size={48} strokeWidth={4} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground shrink-0">
                      목표 미설정
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default async function HomePage(props: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const searchParams = await props.searchParams;
  const now = new Date();
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth() + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-accent">ME UNIST</span> Running Crew
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          함께 달리고, 함께 성장하자! 🏃‍♂️
        </p>
      </div>

      {/* Month Nav */}
      <MonthNav year={year} month={month} />

      {/* Dashboard */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        }
      >
        <Dashboard year={year} month={month} />
      </Suspense>
    </div>
  );
}
