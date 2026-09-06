import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { UsesGrid } from "@/components/uses/UsesGrid"
import { Laptop, Terminal, Wrench } from "lucide-react"

export const metadata: Metadata = {
  title: "Developer Setup & Uses (/uses) | Dhananjay Singh",
  description: "A detailed breakdown of hardware workstation gear, Neovim configs, Linux development environments, and low-level systems profiling tools used daily by Dhananjay Singh.",
}

export default function UsesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Laptop className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Developer Setup
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          What I Use Daily (/uses)
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          A living inventory of my hardware workstation, Neovim and Tmux configuration, systems profiling utilities, and productivity software stack.
        </p>
      </ScrollReveal>

      {/* Main Grid */}
      <ScrollReveal delay={0.05}>
        <UsesGrid />
      </ScrollReveal>

    </div>
  )
}
