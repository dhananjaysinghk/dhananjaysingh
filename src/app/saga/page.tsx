import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { DistributedTransactionVisualizer } from "@/components/saga/DistributedTransactionVisualizer"
import { Database, Shield, Zap, Layers, Undo2, Cpu } from "lucide-react"

export const metadata: Metadata = {
  title: "Distributed Transactions: 2-Phase Commit (2PC) & Saga Coordinator | Dhananjay Singh",
  description:
    "Interactive distributed transaction simulator exploring Two-Phase Commit (2PC) atomicity, Write-Ahead Logging (WAL), and long-running Saga patterns with automatic compensating rollback workflows.",
}

export default function SagaPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Distributed Systems & Consensus
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Distributed Transactions & Saga Coordinator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate multi-database atomicity and microservice transaction orchestration. Compare strict Two-Phase Commit (2PC) blocking consensus against asynchronous Saga patterns with backward compensating transactions.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <DistributedTransactionVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Shield className="h-4 w-4" />
            <span>Two-Phase Commit (2PC)</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Guarantees strict ACID atomicity across homogeneous database shards. Phase 1 (Prepare voting) and Phase 2 (Global Commit/Abort) rely on Write-Ahead Logging to survive crashes.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <Undo2 className="h-4 w-4" />
            <span>Saga Compensating Actions</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Replaces blocking 2PC locks with asynchronous local database transactions. If any step fails down the line, the orchestrator triggers backward compensating transactions to restore semantic balance.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>ACID vs BASE Trade-offs</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            2PC prioritizes Strong Consistency (CP) at the cost of coordinator bottlenecks and lock latency, while Sagas embrace Eventual Consistency (AP) for massive horizontal scaling.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
