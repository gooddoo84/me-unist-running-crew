import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { members } from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const crewMembers = [
    { name: "정다운", emoji: "🔥" },
    { name: "김민수", emoji: "⚡" },
    { name: "이서연", emoji: "🌟" },
    { name: "박지훈", emoji: "🚀" },
    { name: "최유진", emoji: "💪" },
    { name: "한도윤", emoji: "🏃" },
  ];

  console.log("Seeding members...");
  await db.insert(members).values(crewMembers);
  console.log("Done! Seeded", crewMembers.length, "members.");
}

seed().catch(console.error);
