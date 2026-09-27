import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { InteractiveTerminal } from "@/components/terminal/InteractiveTerminal"
import { Terminal, Shield, Cpu, Zap, CornerDownLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Interactive Systems Terminal & UNIX Shell | Dhananjay Singh",
  description:
    "Interactive UNIX developer shell supporting commands, neofetch system specs, in-memory CPU benchmarks, live API health inspection, and direct simulator launches.",
}

export default function TerminalPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-10 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm shadow-xs">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Developer Console & CLI
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Interactive Systems Terminal
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          An interactive UNIX-style shell environment built directly in the browser. Query system architecture, execute microsecond benchmarks, inspect live telemetry, or trigger matrix animations.
        </p>
      </ScrollReveal>

      {/* Main Terminal Shell */}
      <ScrollReveal delay={0.05}>
        <InteractiveTerminal />
      </ScrollReveal>

      {/* Quick Cheat Sheet */}
      <ScrollReveal delay={0.1} className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm space-y-1">
          <span className="text-emerald-400 font-bold block">neofetch</span>
          <p className="text-[11px] text-muted-foreground font-sans">System architecture & tech spec summary.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm space-y-1">
          <span className="text-cyan-400 font-bold block">benchmark</span>
          <p className="text-[11px] text-muted-foreground font-sans">Execute 100k arithmetic CAS operations.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm space-y-1">
          <span className="text-indigo-400 font-bold block">labs / goto</span>
          <p className="text-[11px] text-muted-foreground font-sans">List and launch all 16 interactive simulators.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm space-y-1">
          <span className="text-amber-400 font-bold block">curl health</span>
          <p className="text-[11px] text-muted-foreground font-sans">Fetch real-time cluster health payload.</p>
        </div>
      </ScrollReveal>
    </div>
  )
}
