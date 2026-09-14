import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { LruCacheVisualizer } from "@/components/cache/LruCacheVisualizer"
import { Layers, Cpu, Zap, Activity } from "lucide-react"

export const metadata: Metadata = {
  title: "O(1) LRU Cache Visualizer | Dhananjay Singh",
  description:
    "Interactive Least Recently Used (LRU) cache memory simulator featuring Doubly Linked List node traversal, Hash Map lookups, dynamic promotions, and tail eviction mechanics.",
}

export default function CachePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Memory Subsystem
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          O(1) LRU Cache Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Interactive visualization of in-memory key-value eviction policies combining O(1) hash table lookups with doubly-linked list MRU-to-LRU promotion pointers.
        </p>
      </ScrollReveal>

      {/* Visualizer Component */}
      <ScrollReveal delay={0.05}>
        <LruCacheVisualizer />
      </ScrollReveal>

      {/* Deep-dive architectural breakdown */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>Hash Map (O(1) Access)</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            The hash map stores key pointers directly referencing doubly-linked list nodes. This enables true O(1) time complexity for both key retrieval and membership existence checks without array scans.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>Doubly Linked List</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Maintains strict chronological access recency. Splicing a node and repointing `prev` and `next` pointers to the Head (MRU) executes in constant time O(1) without requiring memory shifting.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <Activity className="h-4 w-4" />
            <span>Eviction Strategy</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            When cache capacity limit is breached, the Tail node (Least Recently Used) is evicted in O(1) time. Both the list node and corresponding hash map entry are purged simultaneously.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
