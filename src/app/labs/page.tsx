import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { LabsDirectory } from "@/components/labs/LabsDirectory"
import { Layers, Sparkles, Terminal, Activity, Cpu } from "lucide-react"

export const metadata: Metadata = {
  title: "Interactive Systems Engineering Labs & Simulators | Dhananjay Singh",
  description:
    "A catalog of interactive low-level, concurrency, and distributed systems simulators exploring Kafka, LMAX Disruptor, Virtual Memory MMU, SWIM Gossip, Merkle Trees, B+ Trees, eBPF, CRDTs, LSM-Trees, and Raft consensus.",
}

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Interactive Systems Directory
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Systems Engineering Labs & Simulators
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          An open interactive laboratory dissecting the internal mechanics of operating systems, lock-free concurrency, distributed consensus, query planners, and cryptographic storage engines.
        </p>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
            <span className="text-[10px] text-muted-foreground block uppercase">Total Labs</span>
            <span className="text-lg font-bold text-foreground">16 Simulators</span>
          </div>
          <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
            <span className="text-[10px] text-muted-foreground block uppercase">Domains Covered</span>
            <span className="text-lg font-bold text-emerald-400">5 Architecture Areas</span>
          </div>
          <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
            <span className="text-[10px] text-muted-foreground block uppercase">Execution Model</span>
            <span className="text-lg font-bold text-cyan-400">Client-Side WASM / Web Audio</span>
          </div>
          <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
            <span className="text-[10px] text-muted-foreground block uppercase">Latency Profiling</span>
            <span className="text-lg font-bold text-indigo-400">Sub-Microsecond Timer</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Interactive Labs Explorer */}
      <ScrollReveal delay={0.05}>
        <LabsDirectory />
      </ScrollReveal>
    </div>
  )
}
