import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { RoadmapViewer } from "@/components/roadmap/RoadmapViewer"
import { Compass, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Engineering Roadmap & Research Milestones | Dhananjay Singh",
  description: "Technical milestones, ongoing distributed systems research, LSM-tree storage engines, and future backend engineering roadmap.",
}

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Research & Direction
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Engineering Roadmap
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          An ongoing breakdown of technical milestones, low-level systems research in Go, Rust, and Linux kernel programming, and upcoming open-source projects.
        </p>
      </ScrollReveal>

      {/* Main Interactive Roadmap */}
      <ScrollReveal delay={0.05}>
        <RoadmapViewer />
      </ScrollReveal>

    </div>
  )
}
