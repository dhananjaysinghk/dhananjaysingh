import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { SqlExplainVisualizer } from "@/components/sql/SqlExplainVisualizer"
import { Database, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "PostgreSQL Query Profiler & EXPLAIN Visualizer | Dhananjay Singh",
  description: "Interactive PostgreSQL query plan inspector comparing sequential scans against B-Tree index scans and covering index-only scans.",
}

export default function SqlPage() {
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
          PostgreSQL Query Profiler & Index Visualizer
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Inspect cost-based optimizer tree nodes, buffer cache hits, and performance trade-offs between unindexed sequential scans and covering B-Tree index scans.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <SqlExplainVisualizer />
      </ScrollReveal>

    </div>
  )
}
