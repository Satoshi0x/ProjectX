import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Socket.IO endpoint - use WebSocket connection",
    endpoint: process.env.NODE_ENV === "production" ? "wss://your-deployment-url.vercel.app" : "ws://localhost:3001",
  })
}
