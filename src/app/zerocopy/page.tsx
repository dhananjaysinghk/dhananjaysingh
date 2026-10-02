import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { ZeroCopyVisualizer } from "@/components/zerocopy/ZeroCopyVisualizer"
import { Zap, Cpu, HardDrive, Network, Layers, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Linux Zero-Copy DMA & Kernel PageCache I/O Pipeline | Dhananjay Singh",
  description:
    "Interactive low-level Linux kernel I/O simulator exploring traditional read()/write() syscall overhead, sendfile() gather DMA bypass, PageCache architectures, and io_uring ring buffers.",
}

export default function ZeroCopyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Operating Systems & Kernel I/O
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Linux Zero-Copy DMA & Kernel PageCache
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate high-throughput Linux kernel I/O pipelines powering Apache Kafka, Nginx, Netty, and Envoy. Compare traditional 4-step CPU buffer copies against <code>sendfile()</code> gather DMA and <code>io_uring</code> kernel bypass.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <ZeroCopyVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>sendfile() & Gather DMA</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Eliminates all CPU memory copies between kernel PageCache and userspace memory buffers. The NIC hardware DMA engine reads payload pages directly using memory descriptor pointers.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-heading text-sm">
            <Cpu className="h-4 w-4" />
            <span>Context Switch Reduction</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Traditional <code>read()</code> and <code>write()</code> require 4 user/kernel space context switches per packet batch. Zero-Copy halves this to 2, drastically reducing CPU pipeline stalls and cache evictions.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>io_uring Ring Buffers</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Shared memory submission and completion ring queues (SQ/CQ) enable asynchronous batched I/O execution with zero system calls during high-throughput steady state workloads.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
