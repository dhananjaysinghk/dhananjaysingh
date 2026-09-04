import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { AdrViewer } from "@/components/adr/AdrViewer"
import { FileText, Scale } from "lucide-react"

export const metadata: Metadata = {
  title: "Architecture Decision Records (ADRs) | Dhananjay Singh",
  description: "Formal Architectural Decision Records documenting engineering decisions, trade-offs, and design rationale across distributed systems and backend infrastructure.",
}

export default function AdrPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Scale className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Design Rationale
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Architecture Decision Records (ADRs)
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          A transparent log of key architectural choices, trade-offs, and technical evaluations made while designing distributed systems, low-latency queues, and high-throughput backends.
        </p>
      </ScrollReveal>

      {/* Main Interactive ADR Viewer */}
      <ScrollReveal delay={0.05}>
        <AdrViewer />
      </ScrollReveal>

    </div>
  )
}
