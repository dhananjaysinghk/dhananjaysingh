"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, Zap, RefreshCw, Send, CheckCircle2, XCircle, Droplets, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

export function RateLimiterSimulator() {
  const BUCKET_CAPACITY = 10
  const REFILL_RATE = 2 // tokens per second

  const [tokens, setTokens] = useState<number>(BUCKET_CAPACITY)
  const [acceptedCount, setAcceptedCount] = useState<number>(0)
  const [droppedCount, setDroppedCount] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([
    "Token Bucket Initialized (Capacity: 10, Refill: 2 tokens/sec)",
    "Ready for inbound API traffic.",
  ])

  // Continuous Token Refill (Every 500ms add 1 token)
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) => Math.min(BUCKET_CAPACITY, prev + 1))
    }, 1000 / REFILL_RATE)

    return () => clearInterval(interval)
  }, [])

  const handleSendRequests = (count: number) => {
    soundFx.playClick()
    let accepted = 0
    let dropped = 0

    setTokens((prevTokens) => {
      if (prevTokens >= count) {
        accepted = count
        return prevTokens - count
      } else {
        accepted = prevTokens
        dropped = count - prevTokens
        return 0
      }
    })

    setAcceptedCount((p) => p + accepted)
    setDroppedCount((p) => p + dropped)

    if (dropped > 0) {
      soundFx.playToggle()
      setLogs((prev) => [
        `🚨 HTTP 429: ${dropped} request(s) rate-limited (insufficient tokens). Accepted: ${accepted}`,
        ...prev.slice(0, 4),
      ])
    } else {
      setLogs((prev) => [
        `✅ HTTP 200: ${accepted} request(s) processed. Tokens remaining: ${Math.max(0, tokens - count)}`,
        ...prev.slice(0, 4),
      ])
    }
  }

  const handleReset = () => {
    soundFx.playChime()
    setTokens(BUCKET_CAPACITY)
    setAcceptedCount(0)
    setDroppedCount(0)
    setLogs(["Rate limiter metrics reset to defaults."])
  }

  const fillPercentage = (tokens / BUCKET_CAPACITY) * 100

  return (
    <div className="flex flex-col gap-8">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Distributed Token Bucket Rate Limiter
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates burst traffic regulation, token replenishment, and HTTP 429 backpressure handling.
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="text-xs font-mono gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset State
          </Button>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-6 font-mono text-xs">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={() => handleSendRequests(1)}
              className="text-xs font-mono gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Send 1 Req
            </Button>
            <Button
              size="sm"
              onClick={() => handleSendRequests(5)}
              className="text-xs font-mono gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              Burst (5 Reqs)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSendRequests(12)}
              className="text-xs font-mono gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Flood (12 Reqs)
            </Button>
          </div>

          {/* Bucket Visualizer Bar */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Token Capacity: {BUCKET_CAPACITY} Tokens</span>
              <span className="text-foreground font-bold">{tokens} Available Tokens</span>
              <span>Refill: +{REFILL_RATE} Tokens/sec</span>
            </div>

            {/* Fill meter */}
            <div className="relative h-6 w-full rounded-lg bg-zinc-900 overflow-hidden border border-zinc-800">
              <motion.div
                initial={false}
                animate={{ width: `${fillPercentage}%` }}
                transition={{ duration: 0.2 }}
                className={`h-full ${
                  tokens > 4 ? "bg-indigo-500" : tokens > 1 ? "bg-amber-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Available Tokens</span>
              <span className="text-xl font-bold text-foreground">{tokens}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">HTTP 200 OK</span>
              <span className="text-xl font-bold text-emerald-400">{acceptedCount}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">HTTP 429 Throttled</span>
              <span className="text-xl font-bold text-red-400">{droppedCount}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Drop Rate</span>
              <span className="text-xl font-bold text-purple-400">
                {acceptedCount + droppedCount > 0
                  ? `${((droppedCount / (acceptedCount + droppedCount)) * 100).toFixed(0)}%`
                  : "0%"}
              </span>
            </div>
          </div>

          {/* Live Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] text-zinc-500 uppercase">
              <span>Traffic Gate Real-Time Event Log</span>
              <span>Sliding Window</span>
            </div>
            <div className="space-y-1">
              {logs.map((log, idx) => (
                <p key={idx} className={idx === 0 ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                  {`> ${log}`}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
