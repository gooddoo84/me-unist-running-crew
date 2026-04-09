"use server";

import { db } from "@/db";
import { members, runningLogs, monthlyGoals } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMembers() {
  return db.select().from(members).orderBy(members.name);
}

export async function addRunningLog(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const distance = parseFloat(formData.get("distance") as string);
  const runDate = formData.get("runDate") as string;

  if (!memberId || isNaN(distance) || distance <= 0 || distance > 100 || !runDate) {
    throw new Error("Invalid input");
  }

  await db.insert(runningLogs).values({
    memberId,
    distance: distance.toFixed(2),
    runDate,
  });

  revalidatePath("/");
  revalidatePath("/log");
  revalidatePath(`/members/${memberId}`);
}

export async function getMonthlyRanking(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const result = await db
    .select({
      memberId: members.id,
      name: members.name,
      emoji: members.emoji,
      totalDistance: sql<string>`COALESCE(SUM(${runningLogs.distance}), 0)`,
      goalDistance: sql<string>`(
        SELECT ${monthlyGoals.goalDistance}
        FROM ${monthlyGoals}
        WHERE ${monthlyGoals.memberId} = ${members.id}
          AND ${monthlyGoals.year} = ${year}
          AND ${monthlyGoals.month} = ${month}
        LIMIT 1
      )`,
    })
    .from(members)
    .leftJoin(
      runningLogs,
      and(
        eq(runningLogs.memberId, members.id),
        sql`${runningLogs.runDate} >= ${startDate}`,
        sql`${runningLogs.runDate} < ${endDate}`
      )
    )
    .groupBy(members.id, members.name, members.emoji)
    .orderBy(desc(sql`COALESCE(SUM(${runningLogs.distance}), 0)`));

  return result.map((r) => ({
    memberId: r.memberId,
    name: r.name,
    emoji: r.emoji,
    totalDistance: parseFloat(r.totalDistance) || 0,
    goalDistance: r.goalDistance ? parseFloat(r.goalDistance) : null,
  }));
}

export async function getCrewStats(year: number, month: number) {
  const ranking = await getMonthlyRanking(year, month);
  const totalDistance = ranking.reduce((sum, r) => sum + r.totalDistance, 0);
  const activeMembers = ranking.filter((r) => r.totalDistance > 0).length;
  const goalAchievers = ranking.filter(
    (r) => r.goalDistance && r.totalDistance >= r.goalDistance
  ).length;

  return {
    totalDistance,
    memberCount: ranking.length,
    activeMembers,
    goalAchievers,
  };
}

export async function setMonthlyGoal(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const year = parseInt(formData.get("year") as string);
  const month = parseInt(formData.get("month") as string);
  const goalDistance = parseFloat(formData.get("goalDistance") as string);

  if (!memberId || isNaN(goalDistance) || goalDistance <= 0) {
    throw new Error("Invalid input");
  }

  const existing = await db
    .select()
    .from(monthlyGoals)
    .where(
      and(
        eq(monthlyGoals.memberId, memberId),
        eq(monthlyGoals.year, year),
        eq(monthlyGoals.month, month)
      )
    );

  if (existing.length > 0) {
    await db
      .update(monthlyGoals)
      .set({ goalDistance: goalDistance.toFixed(2) })
      .where(eq(monthlyGoals.id, existing[0].id));
  } else {
    await db.insert(monthlyGoals).values({
      memberId,
      year,
      month,
      goalDistance: goalDistance.toFixed(2),
    });
  }

  revalidatePath("/");
  revalidatePath(`/members/${memberId}`);
}

export async function getMemberDetail(memberId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId));

  if (!member) return null;

  const logs = await db
    .select()
    .from(runningLogs)
    .where(
      and(
        eq(runningLogs.memberId, memberId),
        sql`${runningLogs.runDate} >= ${startDate}`,
        sql`${runningLogs.runDate} < ${endDate}`
      )
    )
    .orderBy(desc(runningLogs.runDate));

  const [goal] = await db
    .select()
    .from(monthlyGoals)
    .where(
      and(
        eq(monthlyGoals.memberId, memberId),
        eq(monthlyGoals.year, year),
        eq(monthlyGoals.month, month)
      )
    );

  const totalDistance = logs.reduce(
    (sum, log) => sum + parseFloat(log.distance),
    0
  );

  return {
    member,
    logs: logs.map((l) => ({
      ...l,
      distance: parseFloat(l.distance),
    })),
    totalDistance,
    goalDistance: goal ? parseFloat(goal.goalDistance) : null,
  };
}

export async function getMemberTrend(memberId: string, year: number, month: number) {
  // Daily distances for current month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const dailyRows = await db
    .select({
      runDate: runningLogs.runDate,
      total: sql<string>`SUM(${runningLogs.distance})`,
    })
    .from(runningLogs)
    .where(
      and(
        eq(runningLogs.memberId, memberId),
        sql`${runningLogs.runDate} >= ${startDate}`,
        sql`${runningLogs.runDate} < ${endDate}`
      )
    )
    .groupBy(runningLogs.runDate)
    .orderBy(runningLogs.runDate);

  // Monthly totals for last 6 months
  const months: { year: number; month: number; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;
    while (m <= 0) { m += 12; y--; }
    const mStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const mEnd = m === 12
      ? `${y + 1}-01-01`
      : `${y}-${String(m + 1).padStart(2, "0")}-01`;

    const [row] = await db
      .select({ total: sql<string>`COALESCE(SUM(${runningLogs.distance}), 0)` })
      .from(runningLogs)
      .where(
        and(
          eq(runningLogs.memberId, memberId),
          sql`${runningLogs.runDate} >= ${mStart}`,
          sql`${runningLogs.runDate} < ${mEnd}`
        )
      );
    months.push({ year: y, month: m, total: parseFloat(row.total) || 0 });
  }

  return {
    daily: dailyRows.map((r) => ({
      date: r.runDate,
      distance: parseFloat(r.total) || 0,
    })),
    monthly: months,
  };
}

export async function deleteRunningLog(logId: string, memberId: string) {
  await db.delete(runningLogs).where(eq(runningLogs.id, logId));
  revalidatePath("/");
  revalidatePath(`/members/${memberId}`);
}
