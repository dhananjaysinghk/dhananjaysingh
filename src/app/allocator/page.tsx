import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { MemoryAllocatorVisualizer } from "@/components/allocator/MemoryAllocatorVisualizer"
import { Cpu, Layers, Shield, Zap, Sparkles, HardDrive } from "lucide-react"

export const metadata: Metadata = {
  title: "Linux Kernel Memory Allocator: Binary Buddy & Slab Engine | Dhananjay Singh",
  description:
    "Interactive low-level memory allocation simulator exploring the Linux Binary Buddy System, power-of-two page frame splitting/coalescing, and fixed-size Slab object caches (task_struct, inode, dentry).",
}

export default function AllocatorPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Operating Systems & Memory Management
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Kernel Memory Allocator: Buddy & Slab
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate low-level Linux kernel physical memory allocation. Explore how the Binary Buddy System splits and coalesces power-of-two page blocks, and how Slab caches eliminate internal fragmentation for fixed-size kernel structs.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <MemoryAllocatorVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>Binary Buddy Splitting</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Allocations request blocks in orders of $2^k$. If an exact order block is unavailable, the allocator recursively splits larger buddy pairs until the exact target size is satisfied.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>Recursive Coalescing</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            When a block is freed, the allocator checks if its sibling buddy is also free using bitwise XOR address math (<code>Buddy = Address ^ Size</code>), immediately merging them back into larger contiguous blocks.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>Slab Cache Freelist</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Slab/SLUB caches pre-allocate contiguous pages carved into fixed-size kernel objects (like <code>task_struct</code>), delivering zero-fragmentation $O(1)$ allocations directly from a pointer freelist.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
