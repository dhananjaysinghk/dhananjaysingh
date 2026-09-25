import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { DisruptorVisualizer } from "@/components/disruptor/DisruptorVisualizer"
import { Cpu, Zap, Shield, RotateCcw, Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "Lock-Free Concurrent Ring Buffer & LMAX Disruptor Simulator | Dhananjay Singh",
  description:
    "Interactive high-performance concurrency simulator exploring the LMAX Disruptor pattern, cache-line padding, lockless atomic CAS sequence barriers, and mechanical sympathy.",
}

export default function DisruptorPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            High-Performance Concurrency
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Lock-Free Ring Buffer & LMAX Disruptor
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate ultra-low-latency inter-thread messaging powering high-frequency financial trading exchanges. Explore mechanical sympathy, pre-allocated zero-GC ring buffers, CPU cache-line false sharing prevention, and atomic CAS sequence barriers.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <DisruptorVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>Mechanical Sympathy</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Hardware-aware software engineering. Pre-allocated continuous array slots eliminate runtime garbage collection pauses, while 64-byte padding stops CPU L1/L2 cache line invalidations across cores.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>Lock-Free Sequence Barriers</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Replaces OS mutex locks with lightweight atomic CAS (Compare-And-Swap) sequence counters and memory barriers, enabling millions of operations per second without thread blocking or context switches.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>Diamond Pipeline Graph</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Consumers process slots independently or orchestrate strict diamond dependency barriers (e.g. WAL Journaler and Replicator run in parallel before triggering the Business Logic Executor).
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
