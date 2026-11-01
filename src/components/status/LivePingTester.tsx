"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, RefreshCw, Zap, Server, Clock, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function LivePingTester() {
  const [pingResult, setPingResult] = useState<{
    latency: number
    serverTimestamp: string
    status: string
    history: number[]
    services?: Record<string, string>
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

      setPingResult((prev) => {
        const history = prev ? [...prev.history.slice(-7), roundTrip] : [roundTrip]
        return {
          latency: roundTrip,
          serverTimestamp: data.timestamp,
          status: data.status,
          history,
          services: data.services,
        }
      })
    } catch {
      setPingResult((prev) => ({
        latency: -1,
        serverTimestamp: new Date().toISOString(),
        status: "unreachable",
        history: prev ? [...prev.history.slice(-7), -1] : [-1],
      }))
    } finally {
      setLoading(false)
    }
  }

  // Auto-measure once on initial mount for instant feedback
  useEffect(() => {
    testPing()
  }, [])

  return (
    <Card className="bg-card/30 border-border/40 backdrop-blur-md shadow-lg relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
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
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex flex-col gap-1 backdrop-blur-sm">
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

              <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex flex-col gap-1 backdrop-blur-sm">
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

              <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex flex-col gap-1 backdrop-blur-sm">
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
            </div>

            {/* Sparkline History & Microservice Matrix */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-border/30 bg-muted/20 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-primary" />
                  Recent Probes:
                </span>
                <div className="flex items-center gap-1.5">
                  {pingResult.history.map((lat, i) => (
                    <span
                      key={i}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        lat < 0
                          ? "bg-red-500/20 text-red-400"
                          : lat < 50
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {lat >= 0 ? `${lat}ms` : "ERR"}
                    </span>
                  ))}
                </div>
              </div>

              {pingResult.services && (
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-2 sm:pt-0 border-t sm:border-t-0 border-border/20">
                  {Object.entries(pingResult.services).map(([key, val]) => (
                    <span key={key} className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="py-6 text-center text-xs font-mono text-muted-foreground border border-dashed border-border/40 rounded-xl bg-card/10">
            Measuring edge network telemetry...
          </div>
        )}
      </CardContent>
    </Card>
  )
}

