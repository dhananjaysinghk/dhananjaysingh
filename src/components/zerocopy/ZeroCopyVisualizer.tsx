"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Layers,
  Zap,
  Shield,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Play,
  Flame,
  HardDrive,
  Cpu,
  Radio,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Server,
  Network,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

type IoMode = "TRADITIONAL" | "ZERO_COPY" | "IO_URING"

interface StepNode {
  id: string
  name: string
  layer: "HARDWARE" | "KERNEL" | "USER"
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  dataType: string
}

export function ZeroCopyVisualizer() {
  const [mode, setMode] = useState<IoMode>("ZERO_COPY")
  const [activeStep, setActiveStep] = useState<number>(-1)
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null)
  
  const [eventLogs, setEventLogs] = useState<string[]>([
    "Linux Zero-Copy DMA & Kernel PageCache Subsystem initialized.",
  ])

  const appendLog = (msg: string) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 14)])
  }

  // 1. Step through transfer pipeline
  const handleRunTransfer = async () => {
    soundFx.playClick()
    setActiveStep(0)
    setBenchmarkResult(null)

    if (mode === "TRADITIONAL") {
      appendLog("🚀 TRADITIONAL I/O: Initiating read() / write() data transfer (4 context switches)...")
      
      // Step 1: Disk -> PageCache
      setActiveStep(0)
      appendLog("1️⃣ DMA COPY: Disk controller transfers data to OS Kernel PageCache (DMA #1).")
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      // Step 2: PageCache -> Userspace
      setActiveStep(1)
      appendLog("2️⃣ CPU COPY & CONTEXT SWITCH: read() syscall copies buffer from PageCache to Userspace Application memory (Context Switch #1 -> #2).")
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      // Step 3: Userspace -> Socket Buffer
      setActiveStep(2)
      appendLog("3️⃣ CPU COPY & CONTEXT SWITCH: write() syscall copies buffer from Userspace to Kernel Socket Buffer (Context Switch #3 -> #4).")
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      // Step 4: Socket Buffer -> NIC
      setActiveStep(3)
      appendLog("4️⃣ DMA COPY: NIC Network Interface copies packet from Socket Buffer over PCIe bus (DMA #2).")
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      appendLog("🏁 TRADITIONAL COMPLETE: Transfer finished. Overhead: 4 Context Switches, 2 CPU Memory Copies.")
    } else if (mode === "ZERO_COPY") {
      appendLog("⚡ ZERO-COPY (sendfile): Initiating gather DMA kernel bypass pipeline (2 context switches, 0 CPU copies)...")

      // Step 1: Disk -> PageCache
      setActiveStep(0)
      appendLog("1️⃣ DMA COPY: Disk controller transfers file blocks to OS Kernel PageCache via DMA.")
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      // Step 2: sendfile() syscall (No userspace copy!)
      setActiveStep(1)
      appendLog("2️⃣ SENDFILE SYSCALL: Kernel passes file/socket descriptors without copying payload to userspace.")
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      // Step 3: Gather DMA -> NIC
      setActiveStep(3)
      appendLog("3️⃣ GATHER DMA: NIC hardware DMA engine reads payload DIRECTLY from OS PageCache via pointer descriptors (0 CPU Copies!).")
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      appendLog("🎉 ZERO-COPY COMPLETE: Zero CPU buffer copies! PageCache DMA straight to NIC hardware ring buffer.")
    } else {
      // io_uring
      appendLog("🚀 IO_URING: Submitting async SQE ring buffer entry (0 syscalls during steady state)...")
      setActiveStep(0)
      await new Promise((r) => setTimeout(r, 400))
      setActiveStep(3)
      soundFx.playChime()
      appendLog("🎉 IO_URING COMPLETE: Completion Queue Entry (CQE) reaped. Zero syscall context-switch overhead.")
    }

    setTimeout(() => setActiveStep(-1), 1000)
  }

  // 2. Microbenchmark
  const handleRunBenchmark = () => {
    soundFx.playChime()
    const iterations = 500000
    const start = performance.now()

    let val = 0
    for (let i = 0; i < iterations; i++) {
      val = (val + i) ^ (val >> 2)
    }

    const duration = performance.now() - start
    const throughput = mode === "ZERO_COPY" ? "4,820 MB/sec" : mode === "IO_URING" ? "5,410 MB/sec" : "1,180 MB/sec"
    const cpuLoad = mode === "ZERO_COPY" ? "4.2% CPU (Bypass)" : mode === "IO_URING" ? "2.8% CPU (Ring)" : "68.4% CPU (Copies)"

    setBenchmarkResult(`Throughput: ${throughput} | CPU Load: ${cpuLoad} (Duration: ${duration.toFixed(2)}ms)`)
    appendLog(`📊 BENCHMARK (${mode}): Achieved ${throughput} with ${cpuLoad}.`)
  }

  // 3. Reset
  const handleReset = () => {
    soundFx.playChime()
    setActiveStep(-1)
    setBenchmarkResult(null)
    setEventLogs(["Zero-Copy DMA Pipeline reset to default state."])
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
                Linux Zero-Copy DMA & Kernel PageCache Pipeline
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulate traditional 4-step read()/write() CPU buffer copies vs Linux sendfile() gather DMA and io_uring kernel bypass.
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
          {/* Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl border border-border/30 bg-card/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">I/O Pipeline Architecture:</span>
              <div className="flex flex-wrap gap-1.5">
                {(["ZERO_COPY", "TRADITIONAL", "IO_URING"] as IoMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      soundFx.playClick()
                      setMode(m)
                      setActiveStep(-1)
                      setBenchmarkResult(null)
                      appendLog(`Switched I/O architecture to ${m}.`)
                    }}
                    className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                      mode === m
                        ? "bg-emerald-500 text-emerald-950 font-bold shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                    }`}
                  >
                    {m === "ZERO_COPY" && "Linux sendfile() / Gather DMA"}
                    {m === "TRADITIONAL" && "Traditional read() / write()"}
                    {m === "IO_URING" && "Linux io_uring (SQ/CQ Ring)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleRunTransfer}
                className="text-xs font-mono gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Play className="h-3.5 w-3.5" />
                Transfer 64MB Payload
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRunBenchmark}
                className="text-xs font-mono gap-1 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/20"
              >
                <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                Benchmark 1GB
              </Button>
            </div>
          </div>

          {benchmarkResult && (
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-300 font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              {benchmarkResult}
            </div>
          )}

          {/* Pipeline Nodes Visualizer */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col gap-6 shadow-inner">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                Memory & Hardware Buffer Pipeline Stages
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Mode: <strong className="text-emerald-300">{mode}</strong>
              </span>
            </div>

            {/* Visual 4-Stage Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Node 1: Disk Storage */}
              <div
                className={`rounded-xl border p-4 space-y-2 transition-all ${
                  activeStep === 0
                    ? "border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/50"
                    : "border-border/40 bg-card/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                    NVMe Disk
                  </span>
                  <Badge variant="outline" className="text-[8px] font-mono">
                    Hardware
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">
                  Raw file payload stored on block storage.
                </p>
                <div className="text-[9px] text-amber-300 font-mono pt-1">
                  DMA Engine Ready
                </div>
              </div>

              {/* Node 2: Kernel PageCache */}
              <div
                className={`rounded-xl border p-4 space-y-2 transition-all ${
                  activeStep === 0 || activeStep === 1
                    ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/50"
                    : "border-border/40 bg-card/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    OS PageCache
                  </span>
                  <Badge variant="outline" className="text-[8px] font-mono">
                    Kernel Space
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">
                  Kernel buffer cache page frames (4KB).
                </p>
                <div className="text-[9px] text-cyan-300 font-mono pt-1">
                  {mode === "ZERO_COPY" ? "Direct NIC DMA Pointer" : "read() Target"}
                </div>
              </div>

              {/* Node 3: Userspace Buffer (Bypassed in Zero-Copy) */}
              <div
                className={`rounded-xl border p-4 space-y-2 transition-all ${
                  mode === "ZERO_COPY" || mode === "IO_URING"
                    ? "border-zinc-800 bg-zinc-900/30 opacity-40"
                    : activeStep === 1 || activeStep === 2
                    ? "border-rose-400 bg-rose-950/40 shadow-lg ring-2 ring-rose-400/50"
                    : "border-border/40 bg-card/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-purple-400" />
                    App Buffer
                  </span>
                  <Badge variant="outline" className="text-[8px] font-mono">
                    User Space
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">
                  {mode === "ZERO_COPY" || mode === "IO_URING"
                    ? "BYPASSED: 0 copies to userspace RAM."
                    : "Application memory buffer (malloc)."}
                </p>
                <div className="text-[9px] text-zinc-500 font-mono pt-1">
                  {mode === "ZERO_COPY" ? "Zero Context Switches" : "2x Context Switch Overhead"}
                </div>
              </div>

              {/* Node 4: NIC Network Hardware */}
              <div
                className={`rounded-xl border p-4 space-y-2 transition-all ${
                  activeStep === 3
                    ? "border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/50"
                    : "border-border/40 bg-card/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Network className="h-3.5 w-3.5 text-emerald-400" />
                    NIC Hardware
                  </span>
                  <Badge variant="outline" className="text-[8px] font-mono">
                    Hardware
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">
                  100GbE Network Interface Card ring buffer.
                </p>
                <div className="text-[9px] text-emerald-300 font-mono pt-1">
                  Pushed to Physical Wire
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Context Switches</span>
              <span className="text-xl font-bold text-emerald-400">
                {mode === "ZERO_COPY" ? "2 (Min)" : mode === "IO_URING" ? "0 (Ring)" : "4 (Expensive)"}
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">CPU Memory Copies</span>
              <span className="text-xl font-bold text-cyan-400">
                {mode === "ZERO_COPY" || mode === "IO_URING" ? "0 Copies (Zero-Copy)" : "2 CPU Copies"}
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">DMA Transfers</span>
              <span className="text-xl font-bold text-amber-400">2 (Disk & NIC)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Kernel Mechanism</span>
              <span className="text-xs font-bold text-indigo-400 pt-1">
                {mode === "ZERO_COPY" ? "sendfile() / Gather DMA" : mode === "IO_URING" ? "io_uring SQ/CQ" : "read() + write()"}
              </span>
            </div>
          </div>

          {/* Kernel Trace Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                Kernel Syscall & DMA Trace Log:
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">ftrace stream</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {eventLogs.map((log, idx) => (
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
