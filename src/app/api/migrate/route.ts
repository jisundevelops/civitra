import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Secret key to prevent unauthorized access
const SETUP_SECRET = process.env.JWT_SECRET || "civitra_super_secret_key_2024";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret } = body;

    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results: string[] = [];

    // Add citizenId column to User table if missing
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "citizenId" TEXT;
      `);
      results.push("Added citizenId column to User table");

      // Add unique constraint separately (needs to handle existing NULLs)
      try {
        await db.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "User_citizenId_key" ON "User" ("citizenId") WHERE "citizenId" IS NOT NULL;
        `);
        results.push("Added unique index on User.citizenId");
      } catch {
        results.push("Unique index on User.citizenId already exists or skipped");
      }
    } catch (err) {
      results.push(`citizenId column: ${err instanceof Error ? err.message : "already exists"}`);
    }

    // Add vehicleType column to Vehicle table if missing
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "vehicleType" TEXT;
      `);
      results.push("Added vehicleType column to Vehicle table");
    } catch (err) {
      results.push(`vehicleType column: ${err instanceof Error ? err.message : "already exists"}`);
    }

    // Verify the migration by checking the User table structure
    let userColumns: { column_name: string }[] = [];
    try {
      userColumns = await db.$queryRawUnsafe(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'User' ORDER BY ordinal_position
      `) as { column_name: string }[];
    } catch {
      results.push("Could not verify User table structure");
    }

    // Test login query
    let loginTest = "not_tested";
    try {
      const user = await db.user.findUnique({
        where: { email: "admin@civitra.com" },
      });
      loginTest = user ? "ok" : "no_user_found";
    } catch (err) {
      loginTest = `error: ${err instanceof Error ? err.message : "unknown"}`;
    }

    return NextResponse.json({
      message: "Migration completed",
      results,
      userColumns: userColumns.map((c) => c.column_name),
      loginTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
