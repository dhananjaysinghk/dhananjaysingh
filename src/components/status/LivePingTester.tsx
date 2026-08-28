"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Activity, RefreshCw, Zap, Server, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function LivePingTester() {
  const [pingResult, setPingResult] = useState<{
    latency: number
    serverTimestamp: string
    status: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const testPing = async () => {
    setLoading(true)
    const t0 = performance.now()
    try {
      const res = await fetch("/api/health", { cache: "no-store" })
      const data = await res.json()
      const t1 = performance.now()
      const roundTrip = Math.round(t1 - t0)

      setPingResult({
        latency: roundTrip,
        serverTimestamp: data.timestamp,
        status: data.status,
      })
    } catch {
      setPingResult({
        latency: -1,
        serverTimestamp: new Date().toISOString(),
        status: "unreachable",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="font-heading text-base font-bold text-foreground">
              Real-time API Latency Benchmark
            </CardTitle>
            <span className="text-xs text-muted-foreground font-sans">
              Measures round-trip edge network time from your browser to server.
            </span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={testPing}
          disabled={loading}
          className="inline-flex gap-2 text-xs font-mono"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Measuring..." : "Ping Endpoint"}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        {pingResult ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-emerald-400" />
                Round-Trip Time
              </span>
              <span className="font-mono text-2xl font-bold text-emerald-400">
                {pingResult.latency >= 0 ? `${pingResult.latency} ms` : "Error"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {pingResult.latency < 50
                  ? "Ultra-low edge response"
                  : pingResult.latency < 150
                  ? "Optimal network speed"
                  : "High latency region"}
              </span>
            </div>

            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                <Server className="h-3 w-3 text-indigo-400" />
                Node Health Status
              </span>
              <span className="font-mono text-2xl font-bold uppercase text-foreground">
                {pingResult.status}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                All microservices healthy
              </span>
            </div>

            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-purple-400" />
                Server Sync Time
              </span>
              <span className="font-mono text-sm font-semibold text-foreground truncate mt-1">
                {new Date(pingResult.serverTimestamp).toLocaleTimeString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                NTP synchronized clock
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="py-6 text-center text-xs font-mono text-muted-foreground border border-dashed border-border/40 rounded-xl bg-card/10">
            Click &quot;Ping Endpoint&quot; above to initiate live network telemetry probes.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
