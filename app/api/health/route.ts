import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    return NextResponse.json({
      status: "Server is running",
      database: supabaseUrl && supabaseKey ? "configured" : "missing_env_vars",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "Error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
