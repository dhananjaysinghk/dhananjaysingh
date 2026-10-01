import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { BloomFilterVisualizer } from "@/components/bloom/BloomFilterVisualizer"
import { Binary, Database, Shield, Zap, Layers, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Probabilistic Data Structures: Bloom Filter & Counting Filter | Dhananjay Singh",
  description:
    "Interactive probabilistic data structures simulator exploring Bloom Filters, Counting Bloom Filters, multi-hash bit arrays, false positive rate formulas, and SSTable disk I/O avoidance in Cassandra and RocksDB.",
}

export default function BloomPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Binary className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Probabilistic Data Structures
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Bloom Filter & Counting Filter Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate ultra-compact probabilistic set membership testing used in Cassandra SSTables, RocksDB LSM-Trees, and web proxies. Explore multiple hash functions, mathematical false positive rates, and Counting Bloom Filter element deletions.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <BloomFilterVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-pink-400 font-bold font-heading text-sm">
            <Shield className="h-4 w-4" />
            <span>Zero False Negatives Guarantee</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            If a query returns 0 for any of the $k$ hashed bits, the element is definitively NOT in the set. Storage engines bypass expensive disk seeks with 100% certainty.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Binary className="h-4 w-4" />
            <span>Tunable False Positive Rate</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            The mathematical false positive probability P ≈ (1 - e^(-kn/m))^k depends strictly on bit array size m, element count n, and hash count k = (m/n) ln 2.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>Counting Filter Deletion</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Standard Bloom filters cannot delete elements without resetting the entire array. Counting Bloom filters use 4-bit integer counters per bucket to allow safe dynamic deletions.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
