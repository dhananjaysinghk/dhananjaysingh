import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { TcpFlowVisualizer } from "@/components/tcp/TcpFlowVisualizer"
import { Wifi, Radio, Zap, Shield, Layers, Cpu } from "lucide-react"

export const metadata: Metadata = {
  title: "TCP/IP Sliding Window & Congestion Control Simulator | Dhananjay Singh",
  description:
    "Interactive transport-layer networking simulator modeling the TCP 3-way handshake, sliding window flow control, Slow Start, AIMD congestion avoidance, Fast Retransmit, and BBR.",
}

export default function TcpPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Wifi className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Transport Layer Protocols
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          TCP Sliding Window & Congestion Control
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate transport layer networking mechanics. Explore sliding window flow control, advertised receive buffers (`rwnd`), dynamic congestion windows (`cwnd`), exponential Slow Start, and AIMD packet loss recovery.
        </p>
      </ScrollReveal>

      {/* Main Visualizer */}
      <ScrollReveal delay={0.05}>
        <TcpFlowVisualizer />
      </ScrollReveal>

      {/* Architectural Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>Sliding Window Flow Control</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Prevents sender from overwhelming receiver buffers. Transmission volume is bounded by `min(cwnd, rwnd)`, dynamically throttling throughput according to real-time socket buffer availability.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <Zap className="h-4 w-4" />
            <span>AIMD & Fast Recovery</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Additive Increase Multiplicative Decrease. Gently increases congestion window by 1 MSS per RTT during Congestion Avoidance, and cuts `ssthresh` in half upon detecting 3 duplicate ACKs.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Radio className="h-4 w-4" />
            <span>BBR vs Cubic</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Modern TCP Cubic models growth as a cubic polynomial for high-BDP pipes, while Google BBR continuously probes bottleneck bandwidth and minimum RTT to prevent queue bufferbloat.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
