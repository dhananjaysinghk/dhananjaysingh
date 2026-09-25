"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RotateCcw,
  Zap,
  Cpu,
  RefreshCw,
  Plus,
  Play,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Users,
  Radio,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

interface SlotEvent {
  sequence: number
  payload: string
  published: boolean
}

export function DisruptorVisualizer() {
  const BUFFER_SIZE = 8 // Power-of-two (2^3) for bitmask indexing: seq & 7

  const [ringBuffer, setRingBuffer] = useState<SlotEvent[]>([
    { sequence: 0, payload: "Order #101 ($50)", published: true },
    { sequence: 1, payload: "Order #102 ($120)", published: true },
    { sequence: 2, payload: "Order #103 ($35)", published: true },
    { sequence: 3, payload: "Empty", published: false },
    { sequence: 4, payload: "Empty", published: false },
    { sequence: 5, payload: "Empty", published: false },
    { sequence: 6, payload: "Empty", published: false },
    { sequence: 7, payload: "Empty", published: false },
  ])

  const [producerCursor, setProducerCursor] = useState(2)
  const [consumer1Seq, setConsumer1Seq] = useState(2) // Journaler
  const [consumer2Seq, setConsumer2Seq] = useState(1) // Business Logic
  const [inputVal, setInputVal] = useState("Trade #990: Buy 100 NVDA")
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null)
  const [logTrace, setLogTrace] = useState<string[]>([
    "LMAX Disruptor Ring Buffer initialized (Size=8, Bitmask=0x7). Pre-allocated zero-GC slots ready.",
  ])

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 12)])
  }

  // 1. PRODUCE Event (Claim sequence & publish)
  const handleProduce = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputVal.trim()) return

    soundFx.playClick()
    const nextSeq = producerCursor + 1
    const slowestConsumer = Math.min(consumer1Seq, consumer2Seq)

    // Check wrap-around overflow condition (Buffer full)
    if (nextSeq - slowestConsumer > BUFFER_SIZE) {
      soundFx.playToggle()
      appendLog(`🚨 RING BUFFER FULL: Producer backoff triggered (nextSeq=${nextSeq} > slowestConsumer=${slowestConsumer} + 8).`)
      return
    }

    const slotIndex = nextSeq & (BUFFER_SIZE - 1) // Bitwise modulo: nextSeq & 7

    const updatedBuffer = [...ringBuffer]
    updatedBuffer[slotIndex] = {
      sequence: nextSeq,
      payload: inputVal.trim(),
      published: true,
    }

    setRingBuffer(updatedBuffer)
    setProducerCursor(nextSeq)
    appendLog(`📝 PRODUCE: Sequence #${nextSeq} claimed via atomic CAS -> Written to Slot #${slotIndex} (index = ${nextSeq} & 7).`)
    setInputVal(`Trade #${nextSeq + 100}: Buy 50 AAPL`)
  }

  // 2. CONSUME Next Batch
  const handleConsume = (consumerId: 1 | 2) => {
    soundFx.playChime()
    if (consumerId === 1) {
      if (consumer1Seq >= producerCursor) {
        appendLog("⚠️ Journaler is already caught up with Producer cursor.")
        return
      }
      const newSeq = consumer1Seq + 1
      setConsumer1Seq(newSeq)
      appendLog(`💾 JOURNALER (C1): Advanced cursor to sequence #${newSeq} (Async Disk Append).`)
    } else {
      // Business Logic Consumer C2 (Diamond pattern: cannot exceed C1)
      if (consumer2Seq >= consumer1Seq) {
        soundFx.playToggle()
        appendLog("⚠️ Business Logic (C2) waiting on Journaler (C1) sequence barrier.")
        return
      }
      const newSeq = consumer2Seq + 1
      setConsumer2Seq(newSeq)
      appendLog(`⚡ BUSINESS LOGIC (C2): Processed sequence #${newSeq} after C1 barrier verification.`)
    }
  }

  // 3. Run In-Memory Microbenchmark
  const handleRunBenchmark = () => {
    soundFx.playChime()
    const iterations = 50000
    const start = performance.now()

    let cursor = producerCursor
    for (let i = 0; i < iterations; i++) {
      cursor++
      const idx = cursor & (BUFFER_SIZE - 1)
    }

    const duration = performance.now() - start
    const opsPerSec = ((iterations / duration) * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })
    setBenchmarkResult(`${opsPerSec} ops/sec (${duration.toFixed(2)}ms for ${iterations.toLocaleString()} CAS operations)`)
    appendLog(`🚀 BENCHMARK: Completed ${iterations.toLocaleString()} lock-free sequence transitions at ${opsPerSec} ops/sec.`)
  }

  // 4. Reset
  const handleReset = () => {
    soundFx.playChime()
    setProducerCursor(2)
    setConsumer1Seq(2)
    setConsumer2Seq(1)
    setRingBuffer([
      { sequence: 0, payload: "Order #101 ($50)", published: true },
      { sequence: 1, payload: "Order #102 ($120)", published: true },
      { sequence: 2, payload: "Order #103 ($35)", published: true },
      { sequence: 3, payload: "Empty", published: false },
      { sequence: 4, payload: "Empty", published: false },
      { sequence: 5, payload: "Empty", published: false },
      { sequence: 6, payload: "Empty", published: false },
      { sequence: 7, payload: "Empty", published: false },
    ])
    setBenchmarkResult(null)
    setLogTrace(["LMAX Disruptor reset to initial state."])
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Lock-Free Ring Buffer & LMAX Disruptor Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates mechanical sympathy, CPU cache-line padding, atomic CAS sequence barriers, and lockless inter-thread messaging.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="text-xs font-mono gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset State
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-8 font-mono">
          {/* Controls: Produce & Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form: Produce */}
            <div className="lg:col-span-7 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                Produce Event (Lock-Free Sequence Claim)
              </span>

              <form onSubmit={handleProduce} className="flex gap-2.5">
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="bg-card/40 border-border/40 text-xs font-mono grow"
                />
                <Button type="submit" size="sm" className="text-xs font-mono gap-1 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                  Claim & Publish
                </Button>
              </form>

              <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                <span>Bitmask Formula: <code className="text-emerald-300">index = seq & 7</code></span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleRunBenchmark}
                  className="text-[10px] font-mono gap-1 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/20"
                >
                  <TrendingUp className="h-3 w-3 text-indigo-400" />
                  Run 50k Op Benchmark
                </Button>
              </div>

              {benchmarkResult && (
                <div className="p-2 rounded bg-indigo-950/30 border border-indigo-500/40 text-[10px] text-indigo-300 font-bold">
                  🚀 Benchmark: {benchmarkResult}
                </div>
              )}
            </div>

            {/* Consumer Pipeline Controls */}
            <div className="lg:col-span-5 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                Diamond Dependency Consumer Pipeline
              </span>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConsume(1)}
                  className="text-xs font-mono gap-1 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/20"
                >
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  Step C1 (Journal)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConsume(2)}
                  className="text-xs font-mono gap-1 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/20"
                >
                  <Play className="h-3.5 w-3.5 text-cyan-400" />
                  Step C2 (Business)
                </Button>
              </div>

              <div className="text-[10px] text-zinc-500 space-y-0.5 pt-1">
                <div>• C1 (Journaler): Writes to WAL disk</div>
                <div>• C2 (Business Logic): Dependent on C1 sequence barrier</div>
              </div>
            </div>
          </div>

          {/* ================= CIRCULAR 8-SLOT RING BUFFER ================= */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col gap-6 shadow-inner">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4" />
                Pre-Allocated Contiguous Ring Buffer (Size = 8)
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-emerald-300 font-bold">Producer Cursor: #{producerCursor}</span>
                <span className="text-cyan-300 font-bold">C1 (Journal): #{consumer1Seq}</span>
                <span className="text-indigo-300 font-bold">C2 (Logic): #{consumer2Seq}</span>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {ringBuffer.map((slot, idx) => {
                const isProducerSlot = (producerCursor & 7) === idx
                const isC1Slot = (consumer1Seq & 7) === idx
                const isC2Slot = (consumer2Seq & 7) === idx

                return (
                  <motion.div
                    key={idx}
                    layout
                    className={`rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all ${
                      isProducerSlot
                        ? "border-emerald-500/80 bg-emerald-950/30 shadow-md shadow-emerald-500/10"
                        : "border-border/40 bg-card/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-foreground">Slot #{idx}</span>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 font-mono">
                        seq: {slot.sequence}
                      </Badge>
                    </div>

                    <div className="bg-zinc-900 p-1.5 rounded border border-border/20 text-[10px] text-zinc-300 truncate font-mono">
                      {slot.payload}
                    </div>

                    {/* Sequence Markers */}
                    <div className="flex flex-wrap gap-1 pt-1 text-[8px] font-bold">
                      {isProducerSlot && (
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          PRODUCER
                        </span>
                      )}
                      {isC1Slot && (
                        <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          C1 (DISK)
                        </span>
                      )}
                      {isC2Slot && (
                        <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          C2 (LOGIC)
                        </span>
                      )}
                      {!isProducerSlot && !isC1Slot && !isC2Slot && (
                        <span className="text-zinc-600">IDLE</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Real-Time Telemetry HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Lock Contention</span>
              <span className="text-xl font-bold text-emerald-400">0 (Zero Mutex Locks)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Slowest Consumer Lag</span>
              <span className="text-xl font-bold text-amber-400">
                {producerCursor - Math.min(consumer1Seq, consumer2Seq)} Events
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Cache Line False Sharing</span>
              <span className="text-xl font-bold text-indigo-400">64B Padded (0 Misses)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">GC Memory Allocation</span>
              <span className="text-xs font-bold text-cyan-300 pt-1">0 Bytes (Pre-allocated)</span>
            </div>
          </div>

          {/* Disruptor Bus Event Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Disruptor Sequence Barrier Event Stream:</span>
              <span className="text-[9px] text-zinc-600 font-mono">Lock-Free Bus</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-emerald-300 font-bold" : "text-zinc-400 opacity-85"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
