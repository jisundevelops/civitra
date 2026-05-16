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

    // Try to query users with citizenId to check if column exists
    let schemaStatus = "unknown";
    let columnError = null;

    try {
      // Test if citizenId column exists
      const testUser = await db.user.findFirst({
        select: { id: true, email: true, citizenId: true, role: true },
      });
      schemaStatus = testUser ? "ok" : "empty";
    } catch (err) {
      columnError = err instanceof Error ? err.message : String(err);
      schemaStatus = "missing_column";
    }

    // Try to test login query specifically
    let loginQueryStatus = "unknown";
    let loginQueryError = null;
    try {
      const user = await db.user.findUnique({
        where: { email: "admin@civitra.com" },
      });
      loginQueryStatus = user ? "ok" : "no_user";
    } catch (err) {
      loginQueryError = err instanceof Error ? err.message : String(err);
      loginQueryStatus = "error";
    }

    // Get table info
    let tableInfo = null;
    try {
      const columns = await db.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'User'
        ORDER BY ordinal_position
      `;
      tableInfo = columns;
    } catch {
      // Try SQLite-style query
      try {
        const columns = await db.$queryRaw`PRAGMA table_info(User)`;
        tableInfo = columns;
      } catch {
        tableInfo = "Could not retrieve table info";
      }
    }

    return NextResponse.json({
      schemaStatus,
      columnError,
      loginQueryStatus,
      loginQueryError,
      tableInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DB sync error:", error);
    return NextResponse.json(
      {
        error: "Database diagnostic failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
