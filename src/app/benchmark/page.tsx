import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { PerformanceBenchmark } from "@/components/benchmark/PerformanceBenchmark"
import { Gauge, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Algorithm Performance & Memory Benchmark | Dhananjay Singh",
  description: "Live interactive in-memory CPU sorting benchmarks testing QuickSort vs LSD Radix sort on typed Int32Array memory buffers.",
}

export default function BenchmarkPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Gauge className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Client CPU Benchmark
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Algorithm Throughput Benchmark
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Evaluate memory allocation throughput, cache locality, and operations-per-second executing in-place QuickSort vs bitwise Radix Sort across up to 1,000,000 integers.
        </p>
      </ScrollReveal>

      {/* Main Benchmark Suite */}
      <ScrollReveal delay={0.05}>
        <PerformanceBenchmark />
      </ScrollReveal>

    </div>
  )
}
