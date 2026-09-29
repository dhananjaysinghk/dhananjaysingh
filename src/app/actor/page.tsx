import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { ActorMeshVisualizer } from "@/components/actor/ActorMeshVisualizer"
import { Users, Shield, Zap, Layers, Cpu, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Distributed Actor Model & Supervision Tree Simulator | Dhananjay Singh",
  description:
    "Interactive distributed concurrency simulator exploring the Actor Model, asynchronous mailboxes, 'Let It Crash' Erlang/OTP supervision hierarchies, OneForOne vs AllForOne recovery, and Dead Letter Queues.",
}

export default function ActorPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Distributed Concurrency Systems
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Actor Model & Supervision Tree Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate fault-tolerant distributed actor architectures powering Erlang/OTP, Akka, Ray, and Elixir. Explore isolated state, non-blocking asynchronous message passing, supervision trees, and automatic fault-recovery strategies.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <ActorMeshVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>Isolated State & Mailboxes</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Actors never share mutable memory. Each actor processes incoming messages sequentially from its private FIFO mailbox, completely eliminating locks, deadlocks, and race conditions.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Shield className="h-4 w-4" />
            <span>&apos;Let It Crash&apos; Philosophy</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Instead of defensive defensive programming, actors crash immediately upon unexpected panics. Dedicated supervisor nodes monitor health and automatically apply structured restart backoff policies.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>Supervision Tree Strategies</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Supervisors encapsulate failure domains using configurable restart strategies like <code>OneForOne</code> (restarts only the failed worker) and <code>AllForOne</code> (restarts all sibling dependents).
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
