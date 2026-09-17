import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { CrdtVisualizer } from "@/components/crdt/CrdtVisualizer"
import { Network, Share2, Layers, Cpu, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "CRDT & Vector Clock Distributed Sync Mesh | Dhananjay Singh",
  description:
    "Interactive Conflict-Free Replicated Data Types (CRDT) simulator exploring state-based PN-Counters, LWW-Registers, causal Vector Clocks, and offline-first peer-to-peer gossip reconciliation.",
}

export default function CrdtPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Network className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Distributed Systems
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          CRDT & Vector Clock Sync Mesh
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate offline-first distributed data synchronization powering collaborative applications like Figma, Apple Notes, and edge databases. Explore state-based PN-Counters, LWW-Registers, and partition recovery without locks.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <CrdtVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-pink-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>State-Based CRDTs</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            State-based CRDTs form a bounded semi-lattice where pairwise join operations ($\sqcup$) are commutative, associative, and idempotent ($x \sqcup x = x$), guaranteeing deterministic convergence across replicas.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>Causal Vector Clocks</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Vector clocks $[v_A, v_B, v_C]$ track causal histories across distributed nodes. Comparing vectors determines whether state transitions happened-before ($\to$) or occurred concurrently in parallel.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Globe className="h-4 w-4" />
            <span>Strong Eventual Consistency</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Unlike standard eventual consistency requiring asynchronous master reconcilers, Strong Eventual Consistency (SEC) ensures replicas that have observed the same set of updates are always in identical states.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
