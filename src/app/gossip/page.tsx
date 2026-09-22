import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { SwimGossipVisualizer } from "@/components/gossip/SwimGossipVisualizer"
import { Share2, Radio, ShieldAlert, Zap, Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "SWIM Gossip Protocol & Cluster Failure Detector | Dhananjay Singh",
  description:
    "Interactive SWIM gossip protocol simulator exploring weakly-consistent infection-style cluster membership, indirect ping-req failovers, suspicion refutations, and O(1) message complexity across distributed nodes.",
}

export default function GossipPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Share2 className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Cluster Membership
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          SWIM Gossip Protocol & Failure Detector
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate the scalable peer-to-peer cluster membership protocol powering HashiCorp Consul, Nomad, and Apache Cassandra. Observe direct pings, indirect ping-req routing, and suspicion timers with zero central coordinator bottlenecks.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <SwimGossipVisualizer />
      </ScrollReveal>

      {/* Architectural Breakdown */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-teal-400 font-bold font-heading text-sm">
            <Radio className="h-4 w-4" />
            <span>O(1) Message Complexity</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Standard heartbeats generate $O(N^2)$ network traffic. In SWIM, each node probes a constant number of peers per period, keeping CPU and network overhead strictly $O(1)$ regardless of cluster size.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>Indirect Ping-Req Failovers</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            When a direct probe drops due to edge network packet loss, the probing node asks $k$-random intermediary peers to ping the target, avoiding false-positive failovers caused by localized route flakiness.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <ShieldAlert className="h-4 w-4" />
            <span>Suspicion & Incarnations</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Unresponsive nodes enter a temporary `SUSPECT` state. If the node is alive but lagged, it refutes the rumor by broadcasting an incremented incarnation number (`inc++`), preempting premature eviction.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
