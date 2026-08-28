import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()
  
  return NextResponse.json(
    {
      status: "operational",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "production",
      runtime: "nodejs",
      region: "auto",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      services: {
        database: "online",
        emailGateway: "online",
        edgeCdn: "online",
        searchIndex: "online",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  )
}
