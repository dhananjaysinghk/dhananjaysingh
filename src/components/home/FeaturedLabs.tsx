"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  RotateCcw,
  Layers,
  Cpu,
  Share2,
  Binary,
  ArrowRight,
  Zap,
  Terminal,
  Activity,
  FolderTree,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { soundFx } from "@/lib/sound"

const FEATURED_LABS = [
  {
    title: "LMAX Disruptor & Lock-Free Ring Buffer",
    slug: "/disruptor",
    category: "Concurrency",
    description: "Ultra-low latency inter-thread ring buffer with atomic CAS sequence barriers, bitmask modulo indexing, and 64-byte cache line padding.",
    metric: "12M+ ops/sec",
    icon: RotateCcw,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Kafka Event Log & Partition Rebalance",
    slug: "/kafka",
    category: "Distributed",
    description: "Append-only commit logs, MurmurHash2 partition hashing, consumer lag detection, and Incremental Cooperative Rebalancing.",
    metric: "Zero-Downtime Rebalance",
    icon: Layers,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
  {
    title: "Virtual Memory MMU & 4-Level Page Table",
    slug: "/mmu",
    category: "Kernel & OS",
    description: "48-bit canonical virtual address translation through PML4, PDPT, PD, and PT tables with TLB hit/miss caches and page fault traps.",
    metric: "x86-64 Architecture",
    icon: Cpu,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "SWIM Gossip Cluster & Failure Detector",
    slug: "/gossip",
    category: "Distributed",
    description: "Decentralized infection-style gossip protocol with indirect ping probes, suspicion timers, and O(log N) cluster convergence.",
    metric: "O(log N) Gossip",
    icon: Share2,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Merkle Tree & Cryptographic Inclusion Proof",
    slug: "/merkle",
    category: "Cryptography",
    description: "Tamper-evident binary hash trees generating compact logarithmic cryptographic proofs for verifiable state validation.",
    metric: "O(log N) Proof",
    icon: Binary,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10 border-pink-500/20",
  },
  {
    title: "eBPF Kernel Packet Filter Sandbox",
    slug: "/ebpf",
    category: "Kernel & OS",
    description: "Programmable XDP packet filtering at the network driver layer with in-kernel verifier safety checks and ring buffer telemetry.",
    metric: "Wire-Speed 10Gbps",
    icon: Activity,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 border-teal-500/20",
  },
]

export function FeaturedLabs() {
  return (
    <section className="py-20 border-b border-border/40 bg-card/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col gap-12">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-3.5 py-1 backdrop-blur-sm">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
                    Interactive Systems Laboratory
                  </span>
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                  Simulators & Deep Systems Visualizers
                </h2>
                <p className="text-muted-foreground font-sans max-w-2xl text-sm leading-relaxed">
                  Interactive real-time simulators modeling hardware mechanics, memory allocation, consensus protocols, and low-latency concurrency.
                </p>
              </div>

              <Link
                href="/labs"
                onClick={() => soundFx.playClick()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline group shrink-0"
              >
                Explore All 16 Simulators
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Grid of 6 Featured Simulators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_LABS.map((lab) => {
                const Icon = lab.icon
                return (
                  <Card
                    key={lab.slug}
                    className="flex flex-col h-full bg-card/30 backdrop-blur-sm border-border/40 hover:border-primary/50 transition-all hover:bg-card/50 group overflow-hidden"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono tracking-tight text-muted-foreground uppercase">
                          {lab.category}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-border/40 bg-muted/40 text-foreground/80 flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5 text-amber-400" />
                          {lab.metric}
                        </span>
                      </div>

                      <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2.5 group-hover:text-primary transition-colors">
                        <div className={`p-2 rounded-lg border ${lab.bgColor} ${lab.color} shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Link href={lab.slug} className="truncate">
                          {lab.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="grow">
                      <CardDescription className="text-xs font-sans text-muted-foreground leading-relaxed">
                        {lab.description}
                      </CardDescription>
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-border/20 flex items-center justify-between text-xs font-medium">
                      <Link
                        href={lab.slug}
                        onClick={() => soundFx.playClick()}
                        className="inline-flex items-center gap-1 text-primary hover:underline transition-all"
                      >
                        Launch Interactive Lab
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Live Demo
                      </span>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
