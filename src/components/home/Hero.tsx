"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowRight, Github, Linkedin, Twitter, Mail, Check, Copy, Terminal, Activity, Zap, Cpu } from "lucide-react"
import { SlideUp } from "@/components/animation/motion-wrapper"
import { soundFx } from "@/lib/sound"

export function Hero() {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    soundFx.playClick()
    navigator.clipboard.writeText("dhananjay6903@gmail.com")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-lg h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Introduction & Primary CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Status / Availability Pill */}
            <SlideUp delay={0.05}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs backdrop-blur-md self-start shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Available for Software Engineering Roles
                </span>
              </div>
            </SlideUp>

            {/* Main Headline */}
            <SlideUp delay={0.15}>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Architecting systems for{" "}
                <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  maximum scale
                </span>{" "}
                & resilience.
              </h1>
            </SlideUp>

            {/* Intro Narrative */}
            <SlideUp delay={0.25}>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl">
                I am <span className="text-foreground font-semibold">Dhananjay Singh</span>, a Software Engineer & CS Student at GLA University. I specialize in building distributed consensus engines, low-latency microservices, and robust backend pipelines with Go, Rust, and TypeScript.
              </p>
            </SlideUp>

            {/* Micro Skill Badges */}
            <SlideUp delay={0.3}>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card/40">
                  <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                  Go & Rust Backends
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card/40">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Distributed Systems
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card/40">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  Low-Latency Pipelines
                </span>
              </div>
            </SlideUp>

            {/* Action Buttons & Copy Email */}
            <SlideUp delay={0.35} className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/projects"
                onClick={() => soundFx.playClick()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all cursor-pointer"
              >
                View Systems Work
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <Link
                href="/resume"
                onClick={() => soundFx.playClick()}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card/40 px-5 py-3 text-sm font-semibold hover:bg-muted transition-all cursor-pointer"
              >
                Inspect Resume
              </Link>

              <button
                onClick={copyEmail}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/30 px-3.5 py-3 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>dhananjay6903@gmail.com</span>
                  </>
                )}
              </button>
            </SlideUp>

            {/* Social Icons Strip */}
            <SlideUp delay={0.4} className="flex items-center gap-4 pt-2 text-muted-foreground">
              <span className="text-xs font-mono text-muted-foreground/70 uppercase">Connect:</span>
              <a
                href="https://github.com/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="GitHub Profile"
              >
                <Github className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://linkedin.com/in/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://x.com/dhananjay_real"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="Twitter Profile"
              >
                <Twitter className="h-4.5 w-4.5" />
              </a>
              <a
                href="mailto:dhananjay6903@gmail.com"
                className="hover:text-foreground transition-colors p-1"
                aria-label="Email Me"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
            </SlideUp>

          </div>

          {/* Right Column: Interactive Systems Terminal Snapshot */}
          <div className="lg:col-span-5">
            <SlideUp delay={0.25}>
              <div className="relative rounded-2xl border border-border/60 bg-zinc-950/90 shadow-2xl backdrop-blur-xl overflow-hidden font-mono text-xs">
                
                {/* Terminal Window Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-zinc-900/60 select-none">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                    <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                    <span>nova-orchestrator.go</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Go 1.23</span>
                </div>

                {/* Code Window Body */}
                <div className="p-4 sm:p-5 space-y-1.5 leading-relaxed text-zinc-300 overflow-x-auto">
                  <div className="text-zinc-500">// Distributed Consensus State Engine</div>
                  <div>
                    <span className="text-purple-400">type</span>{" "}
                    <span className="text-indigo-300 font-bold">RaftLeader</span>{" "}
                    <span className="text-purple-400">struct</span> &#123;
                  </div>
                  <div className="pl-4">
                    <span className="text-zinc-200">clusterID</span>{" "}
                    <span className="text-amber-300">string</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-zinc-200">term</span>{" "}
                    <span className="text-amber-300">atomic.Uint64</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-zinc-200">walRing</span>{" "}
                    <span className="text-cyan-300">*ringbuffer.SPSC</span>
                  </div>
                  <div>&#125;</div>
                  <div className="pt-2 text-zinc-500">// Dispatches heartbeat quorum RPCs</div>
                  <div>
                    <span className="text-purple-400">func</span> (r *
                    <span className="text-indigo-300">RaftLeader</span>){" "}
                    <span className="text-emerald-400">BroadcastHeartbeat</span>(ctx context.Context) &#123;
                  </div>
                  <div className="pl-4 text-zinc-400">
                    <span className="text-purple-400">for</span> _, peer := <span className="text-purple-400">range</span> r.Peers &#123;
                  </div>
                  <div className="pl-8 text-zinc-300">
                    <span className="text-purple-400">go</span> peer.SendAppendEntries(r.term.Load())
                  </div>
                  <div className="pl-4">&#125;</div>
                  <div>&#125;</div>
                </div>

                {/* Live Telemetry Status Bar */}
                <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-border/30 bg-zinc-900/80 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Quorum: 3/3</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-cyan-400">P99:</span>
                    <span className="font-bold text-zinc-200">1.2ms</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 truncate">
                    <span className="text-indigo-400">Status:</span>
                    <span className="text-emerald-400 font-bold">Stable</span>
                  </div>
                </div>

              </div>
            </SlideUp>
          </div>

        </div>
      </div>
    </section>
  )
}
