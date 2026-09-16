import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { EbpfSandbox } from "@/components/ebpf/EbpfSandbox"
import { Cpu, Shield, Zap, Radio, Activity } from "lucide-react"

export const metadata: Metadata = {
  title: "eBPF Kernel & Packet Inspection Sandbox | Dhananjay Singh",
  description:
    "Interactive Extended Berkeley Packet Filter (eBPF) sandbox simulating Linux kernel bytecode execution, XDP driver-level packet filtering, kprobe syscall auditing, and zero-copy BPF ring buffers.",
}

export default function EbpfPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Kernel Subsystem
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          eBPF Kernel & Packet Sandbox
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate safely executing sandboxed bytecode inside the Linux kernel at bare-metal speeds. Inspect XDP network driver hooks, syscall tracing, and zero-copy kernel ring buffers.
        </p>
      </ScrollReveal>

      {/* Main Sandbox */}
      <ScrollReveal delay={0.05}>
        <EbpfSandbox />
      </ScrollReveal>

      {/* Architectural Breakdown */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>XDP (eXpress Data Path)</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Runs directly at the lowest level of the network stack inside the NIC driver before the kernel allocates an `sk_buff`. Drops DDoS bursts in under 15 nanoseconds without consuming CPU sockets.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <Shield className="h-4 w-4" />
            <span>In-Kernel Verifier Proof</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Prior to loading, the kernel static verifier validates that the bytecode is completely safe: it proves termination (bounded loops), prevents out-of-bounds memory access, and enforces register boundaries.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Activity className="h-4 w-4" />
            <span>BPF Ring Buffers</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Provides a multi-producer, single-consumer lockless circular memory buffer shared between kernel space and user space daemons, achieving millions of events/sec with zero context switches.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
