import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { VirtualMemoryVisualizer } from "@/components/mmu/VirtualMemoryVisualizer"
import { Cpu, Layers, Zap, HardDrive, ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: "Virtual Memory MMU & 4-Level Page Table Simulator | Dhananjay Singh",
  description:
    "Interactive x86-64 Memory Management Unit (MMU) simulator exploring 4-level page table walks (PML4, PDPT, PD, PT), L1 TLB hardware caching, and kernel page fault handling.",
}

export default function MmuPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Computer Architecture & Kernel
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Virtual Memory MMU & Page Table Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate how CPU hardware and the Linux kernel translate 64-bit virtual memory addresses into physical RAM frames. Inspect TLB cache hits, 4-level page table traversals, and kernel page fault interrupts.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <VirtualMemoryVisualizer />
      </ScrollReveal>

      {/* Architectural Breakdown */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>TLB (Translation Lookaside Buffer)</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            An ultra-fast associative CPU hardware cache storing recent virtual-to-physical address mappings, resolving memory reads in 1 CPU cycle (~0.5ns) with a ~98% hit rate.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>4-Level Paging (x86-64)</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Decomposes a 48-bit linear address into 4 hierarchical 9-bit indices: `PML4` $\to$ `PDPT` $\to$ `PD` $\to$ `PT`, each indexing 512 entries per 4KB table page to map sparse 256TB address spaces.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <ShieldAlert className="h-4 w-4" />
            <span>Demand Paging & Page Faults</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            When an address accesses unmapped RAM ($P=0$), the MMU raises hardware exception `#PF (Vector 14)`. The OS kernel allocates a physical frame on-demand or swaps it from disk invisibly.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
