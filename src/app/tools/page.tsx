import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { SystemsPlayground } from "@/components/tools/SystemsPlayground"
import { Terminal, Wrench } from "lucide-react"

export const metadata: Metadata = {
  title: "Interactive Systems Sandbox & Engineering Tools | Dhananjay Singh",
  description: "Interactive CPU L1 cache line false sharing simulator, consistent hash ring distributor, and bitwise binary permission mask calculator.",
}

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Wrench className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Interactive Engineering Lab
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Systems Engineering Sandbox
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Hands-on interactive demonstrations exploring low-level CPU cache architecture, distributed hash ring routing, and bitwise memory masks.
        </p>
      </ScrollReveal>

      {/* Main Interactive Playground */}
      <ScrollReveal delay={0.05}>
        <SystemsPlayground />
      </ScrollReveal>

    </div>
  )
}
