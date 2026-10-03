import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { RaftConsensusVisualizer } from "@/components/raft/RaftConsensusVisualizer"
import { Shield, Layers, Database, Activity, Cpu, Share2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Distributed Raft Consensus & Log Replication Engine | Dhananjay Singh",
  description:
    "Interactive distributed consensus simulator exploring Raft leader election timers, quorum state machines, log replication (AppendEntries), network partitions, and snapshot compaction.",
}

export default function RaftPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Distributed Systems & Consensus
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Raft Consensus & Log Replication Engine
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate a 5-node distributed cluster running the Raft consensus algorithm. Explore randomized election timers, leader heartbeats, majority quorum calculations ($Q = \lfloor N/2 \rfloor + 1$), network partition split-brain resilience, and log snapshot compaction.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <RaftConsensusVisualizer />
      </ScrollReveal>

      {/* Architectural Deep-Dives */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-heading text-sm">
            <Shield className="h-4 w-4" />
            <span>Randomized Election Timers</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Nodes set randomized election timeouts (e.g. 150ms-300ms) to prevent split votes. When a timer elapses without a leader heartbeat, the node becomes a Candidate and requests votes across the cluster.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>AppendEntries Replication</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            The Leader accepts client proposals, appends them locally, and broadcasts <code>AppendEntries</code> RPCs. Once an entry is confirmed on a majority of nodes, it is marked committed and applied to the state machine.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold font-heading text-sm">
            <Database className="h-4 w-4" />
            <span>Snapshot Compaction</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            To prevent unbounded write-ahead log growth, state machines persist snapshots up to index $K$ and truncate earlier log entries. Lagging followers receive an <code>InstallSnapshot</code> RPC to fast-forward state.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
