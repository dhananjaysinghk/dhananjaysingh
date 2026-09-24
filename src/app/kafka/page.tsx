import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { KafkaPartitionVisualizer } from "@/components/kafka/KafkaPartitionVisualizer"
import { Layers, Server, Users, Zap, Radio } from "lucide-react"

export const metadata: Metadata = {
  title: "Distributed Event Log & Kafka Partition Rebalance Simulator | Dhananjay Singh",
  description:
    "Interactive Apache Kafka distributed event log simulator exploring append-only commit logs, MurmurHash2 partition routing, high watermarks, consumer lag, and incremental cooperative rebalancing.",
}

export default function KafkaPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Event Streaming Architecture
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Kafka Event Log & Partition Rebalance Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate high-throughput distributed commit logs powering Apache Kafka, Redpanda, and Apache Pulsar. Produce key-hashed events, poll message batches, monitor consumer lag, and trigger failover rebalances.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <KafkaPartitionVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-orange-400 font-bold font-heading text-sm">
            <Server className="h-4 w-4" />
            <span>Append-Only Commit Logs</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Partitions are strictly ordered, immutable sequence logs. Writing sequentially to disk leverages OS PageCache and DMA zero-copy transfers, achieving millions of events per second per broker.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Users className="h-4 w-4" />
            <span>Consumer Groups & Lag</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Consumer groups parallelize processing across partitions where each partition is consumed by exactly one active worker. Lag measures unread offsets (LogEndOffset - CommittedOffset), indicating backpressure.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>Incremental Cooperative Rebalance</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Unlike legacy Eager protocols that revoke all partitions and halt consumption, Incremental Cooperative rebalancing migrates only affected partitions progressively, avoiding stop-the-world pauses.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
