import React from "react"
import Link from "next/link"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand & Status Column */}
          <div className="flex flex-col space-y-4 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold tracking-tight text-foreground">
                DS<span className="text-muted-foreground">.dev</span>
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                v2.0
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Software Engineer & Systems researcher focused on distributed architectures, low-level tooling, and high-performance interactive simulators.
            </p>

            {/* Status Pill Badge */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-medium">Available for contract & remote roles</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/in/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/dhananjay_real"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="Twitter/X Profile"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="mailto:dhananjay6903@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="Send Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column: Interactive Labs */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Simulators & Labs
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/disruptor" className="transition-colors hover:text-foreground">
                  LMAX Disruptor
                </Link>
              </li>
              <li>
                <Link href="/kafka" className="transition-colors hover:text-foreground">
                  Kafka Event Log
                </Link>
              </li>
              <li>
                <Link href="/mmu" className="transition-colors hover:text-foreground">
                  Virtual Memory MMU
                </Link>
              </li>
              <li>
                <Link href="/gossip" className="transition-colors hover:text-foreground">
                  SWIM Gossip Mesh
                </Link>
              </li>
              <li>
                <Link href="/merkle" className="transition-colors hover:text-foreground">
                  Merkle Tree
                </Link>
              </li>
              <li>
                <Link href="/tracing" className="transition-colors hover:text-foreground">
                  Distributed Tracing
                </Link>
              </li>
              <li>
                <Link href="/btree" className="transition-colors hover:text-foreground">
                  B+ Tree Indexer
                </Link>
              </li>
              <li>
                <Link href="/crdt" className="transition-colors hover:text-foreground">
                  CRDT Realtime Sync
                </Link>
              </li>
              <li>
                <Link href="/ebpf" className="transition-colors hover:text-foreground">
                  eBPF Kernel Sandbox
                </Link>
              </li>
              <li>
                <Link href="/storage" className="transition-colors hover:text-foreground">
                  LSM Storage Engine
                </Link>
              </li>
              <li>
                <Link href="/cache" className="transition-colors hover:text-foreground">
                  LRU Cache Visualizer
                </Link>
              </li>
              <li>
                <Link href="/ratelimit" className="transition-colors hover:text-foreground">
                  Token Bucket Limiter
                </Link>
              </li>
              <li>
                <Link href="/sql" className="transition-colors hover:text-foreground">
                  SQL Query Profiler
                </Link>
              </li>
              <li>
                <Link href="/network" className="transition-colors hover:text-foreground">
                  CDN Edge Routing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Engineering & Resources */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Architecture
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tools" className="transition-colors hover:text-foreground">
                  Systems Lab Suite
                </Link>
              </li>
              <li>
                <Link href="/adr" className="transition-colors hover:text-foreground">
                  Architecture ADRs
                </Link>
              </li>
              <li>
                <Link href="/benchmark" className="transition-colors hover:text-foreground">
                  Benchmark Engine
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="transition-colors hover:text-foreground">
                  Public Roadmap
                </Link>
              </li>
              <li>
                <Link href="/uses" className="transition-colors hover:text-foreground">
                  Hardware & Setup
                </Link>
              </li>
              <li>
                <Link href="/status" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Navigation & Legal */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  About & Background
                </Link>
              </li>
              <li>
                <Link href="/projects" className="transition-colors hover:text-foreground">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-foreground">
                  Technical Articles
                </Link>
              </li>
              <li>
                <Link href="/notes" className="transition-colors hover:text-foreground">
                  Research Notes
                </Link>
              </li>
              <li>
                <Link href="/resume" className="transition-colors hover:text-foreground">
                  Resume & Experience
                </Link>
              </li>
              <li>
                <Link href="/guestbook" className="transition-colors hover:text-foreground">
                  Interactive Guestbook
                </Link>
              </li>
              <li className="pt-2 border-t border-border/40">
                <Link href="/privacy" className="text-xs transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Symmetrical Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground text-center sm:text-left">
            © {currentYear} Dhananjay Singh. All rights reserved.
          </p>

          <p className="font-mono text-xs text-muted-foreground text-center sm:text-right">
            Designed & engineered with precision
          </p>
        </div>
      </div>
    </footer>
  )
}
