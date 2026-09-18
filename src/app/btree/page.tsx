import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { BTreeVisualizer } from "@/components/btree/BTreeVisualizer"
import { FolderTree, Database, ArrowLeftRight, Layers, Cpu } from "lucide-react"

export const metadata: Metadata = {
  title: "Database B+ Tree Index & Leaf Scan Simulator | Dhananjay Singh",
  description:
    "Interactive relational database B+ Tree index simulator exploring page allocation, median promotion splits, binary search branches, and O(log N + K) horizontal leaf range scans.",
}

export default function BTreePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <FolderTree className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Index Internals
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          B+ Tree Index & Page Split Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Understand how database engines like PostgreSQL, SQLite, and MySQL InnoDB organize on-disk pages. Simulate key insertions, overflow splits, and horizontal doubly-linked leaf range traversals.
        </p>
      </ScrollReveal>

      {/* Main Simulator */}
      <ScrollReveal delay={0.05}>
        <BTreeVisualizer />
      </ScrollReveal>

      {/* Deep-dive pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>High Fanout & Low Depth</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            By matching the node size to disk block sizes (e.g. 8KB or 16KB), a B+ Tree achieves fanout of hundreds of pointers per page, indexing billions of rows in just 3 to 4 disk seeks ($O(\log_B N)$).
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>Median Page Splits</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            When an insertion causes a page to exceed order $M$ capacity, the page is split into two halves and the median key is promoted to the parent routing node, preserving tree balance automatically.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Leaf Linked List Range Scans</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            All data records reside exclusively in leaf pages, linked sequentially by pointer chains. Range queries (`BETWEEN a AND b`) scan contiguous leaf blocks without expensive tree backtracking.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
