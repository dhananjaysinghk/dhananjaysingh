import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { NetworkInspector } from "@/components/network/NetworkInspector"
import { Globe, Radio } from "lucide-react"

export const metadata: Metadata = {
  title: "Global CDN Edge Network & Latency Inspector | Dhananjay Singh",
  description: "Interactive Anycast CDN edge telemetry, HTTP/3 QUIC connection negotiation, and real-time round-trip latency across global edge PoP points of presence.",
}

export default function NetworkPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Anycast CDN Mesh
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Edge Network & Latency Inspector
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Real-time telemetry from globally distributed Anycast edge PoP nodes, testing zero-RTT TLS 1.3 resumption and HTTP/3 QUIC stream multiplexing.
        </p>
      </ScrollReveal>

      {/* Main Inspector */}
      <ScrollReveal delay={0.05}>
        <NetworkInspector />
      </ScrollReveal>

    </div>
  )
}
