import {
  pgTable,
  uuid,
  varchar,
  decimal,
  date,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull().default("🏃"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const runningLogs = pgTable("running_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  distance: decimal("distance", { precision: 5, scale: 2 }).notNull(),
  runDate: date("run_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monthlyGoals = pgTable("monthly_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  goalDistance: decimal("goal_distance", { precision: 5, scale: 2 }).notNull(),
});
