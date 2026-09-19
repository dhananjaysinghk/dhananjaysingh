import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { DistributedTraceViewer } from "@/components/tracing/DistributedTraceViewer"
import { Activity, Layers, Server, Shield, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Distributed Tracing & OpenTelemetry Waterfall | Dhananjay Singh",
  description:
    "Interactive distributed tracing and OpenTelemetry waterfall profiler simulating microservice request propagation, span contexts, latency bottleneck isolation, and circuit breaker trips.",
}

export default function TracingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Observability & Telemetry
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Distributed Tracing & Waterfall Profiler
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Observe end-to-end distributed transaction lifecycles across microservices, databases, and message brokers. Profile span hierarchies, identify critical path latency bottlenecks, and diagnose circuit breaker triggers.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <DistributedTraceViewer />
      </ScrollReveal>

      {/* Observability Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>W3C TraceContext & Spans</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Propagates unique 128-bit `traceparent` headers across HTTP and gRPC boundaries, linking disparate asynchronous operations into a unified causal directed acyclic graph (DAG).
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <Server className="h-4 w-4" />
            <span>Critical Path Bottleneck Analysis</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Calculates the longest path of dependent child spans contributing directly to total request latency, distinguishing true downstream blocking operations from non-blocking parallel tasks.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-pink-400 font-bold font-heading text-sm">
            <Shield className="h-4 w-4" />
            <span>Circuit Breakers & Fault Isolation</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Tracks error rates and latency degradation in downstream third-party dependencies, automating fail-fast short-circuits (CLOSED $\to$ OPEN) to protect upstream clusters from cascading failures.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
