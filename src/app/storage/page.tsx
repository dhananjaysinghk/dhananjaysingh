import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { LsmTreeVisualizer } from "@/components/storage/LsmTreeVisualizer"
import { Database, Cpu, HardDrive, Filter, Flame } from "lucide-react"

export const metadata: Metadata = {
  title: "LSM-Tree Storage Engine & Compaction Simulator | Dhananjay Singh",
  description:
    "Interactive Log-Structured Merge-tree (LSM-Tree) storage engine simulating Write-Ahead Logging (WAL), in-memory MemTable SkipLists, multi-level SSTables, Bloom filter checks, and Leveled Compaction.",
}

export default function StoragePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Database Internals
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          LSM-Tree Storage Engine Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Explore the write-optimized storage engine architecture powering RocksDB, Apache Cassandra, and CockroachDB. Simulate memory flushes, multi-tier SSTables, Bloom filters, and background compaction.
        </p>
      </ScrollReveal>

      {/* Main Simulator */}
      <ScrollReveal delay={0.05}>
        <LsmTreeVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>MemTable & WAL</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Writes are appended sequentially to a Write-Ahead Log (WAL) for durability and inserted into a concurrent in-memory MemTable (SkipList/Red-Black tree) delivering ultra-low write latency.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Filter className="h-4 w-4" />
            <span>SSTables & Bloom Filters</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            When the MemTable reaches capacity, it flushes to immutable on-disk SSTables. Probabilistic Bloom filters prevent expensive disk seeks when queried keys are not present.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <Flame className="h-4 w-4" />
            <span>Leveled Compaction</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Background compaction merges overlapping Level 0 SSTables into sorted, partitioned Level 1 runs. It resolves conflicts by keeping the latest timestamp and garbage collects tombstones.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
