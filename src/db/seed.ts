import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { members } from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const crewMembers = [
    { name: "김태성", emoji: "🔥" },
    { name: "박영빈", emoji: "⚡" },
    { name: "지우석", emoji: "🌟" },
    { name: "이강수", emoji: "🚀" },
    { name: "정임두", emoji: "💪" },
  ];

  console.log("Clearing old members...");
  await db.delete(members);
  console.log("Seeding members...");
  await db.insert(members).values(crewMembers);
  console.log("Done! Seeded", crewMembers.length, "members.");
}

seed().catch(console.error);
