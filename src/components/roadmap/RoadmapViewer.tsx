"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Compass, CheckCircle2, Clock, Sparkles, Target, ArrowRight, BookOpen, Layers } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface Milestone {
  id: string
  title: string
  quarter: string
  status: "Completed" | "In Progress" | "Planned"
  category: "Distributed Systems" | "Storage & DB" | "Kernel & Networking" | "Cloud & DevOps"
  description: string
  deliverables: string[]
  technologies: string[]
}

const milestones: Milestone[] = [
  {
    id: "m-1",
    title: "High-Throughput Distributed Task Scheduling (Nova Orchestrator)",
    quarter: "Q1-Q2 2026",
    status: "Completed",
    category: "Distributed Systems",
    description:
      "Engineered an actor-model distributed task scheduler in Go handling 50,000+ concurrent worker heartbeats with sub-millisecond dispatching.",
    deliverables: [
      "gRPC bi-directional streaming telemetry pipeline",
      "Heartbeat failure detectors with exponential backoff",
      "Dynamic worker pool auto-rebalancing",
    ],
    technologies: ["Go", "gRPC", "Protobuf", "Docker"],
  },
  {
    id: "m-2",
    title: "Microsecond Financial Ledger & SPSC Ring Buffers (Aura Ledger)",
    quarter: "Q2 2026",
    status: "Completed",
    category: "Distributed Systems",
    description:
      "Implemented a lock-free double-entry financial ledger in Rust with 64-byte cache line alignment and atomic acquire/release memory barriers.",
    deliverables: [
      "Lock-free SPSC queue ring buffers",
      "Zero-allocation transaction log serialization",
      "Sub-5μs p99.9 order matching execution",
    ],
    technologies: ["Rust", "Atomics", "Linux", "SIMD"],
  },
  {
    id: "m-3",
    title: "LSM-Tree Embedded Storage Engine with Write-Ahead Logging (WAL)",
    quarter: "Q3-Q4 2026",
    status: "In Progress",
    category: "Storage & DB",
    description:
      "Developing an in-memory MemTable backed by SkipLists, append-only WAL crash recovery, and tiered SSTable background compaction in Rust.",
    deliverables: [
      "SkipList Concurrent MemTable with zero-lock reads",
      "CRC32-checksummed Write-Ahead Log replay",
      "Bloom filter sparse index blocks for O(1) negative lookups",
    ],
    technologies: ["Rust", "LSM-Trees", "SkipLists", "I/O Multiplexing"],
  },
  {
    id: "m-4",
    title: "eBPF Kernel Packet Inspector & XDP Fast Path Load Balancer",
    quarter: "Q4 2026 - Q1 2027",
    status: "In Progress",
    category: "Kernel & Networking",
    description:
      "Writing eBPF programs hooked into Linux XDP driver layer to inspect raw L4 UDP/TCP network packets with zero kernel context switches.",
    deliverables: [
      "XDP_DROP and XDP_TX direct driver routing",
      "eBPF BPF_MAP_TYPE_HASH flow table state tracking",
      "Sub-microsecond SYN flood defense filter",
    ],
    technologies: ["C", "eBPF", "XDP", "Linux Kernel", "BCC"],
  },
  {
    id: "m-5",
    title: "Kubernetes Custom Resource Definition (CRD) Operator in Go",
    quarter: "2027",
    status: "Planned",
    category: "Cloud & DevOps",
    description:
      "Building a custom Kubernetes controller reconciling distributed database replica sets with automated failover and backup snapshots.",
    deliverables: [
      "Custom controller reconciliation loop with controller-runtime",
      "Automated leader lease election and health checks",
      "Zero-downtime rolling state upgrades",
    ],
    technologies: ["Go", "Kubernetes", "CRDs", "controller-runtime"],
  },
]

export function RoadmapViewer() {
  const [filterCategory, setFilterCategory] = useState<string>("All")

  const categories = ["All", "Distributed Systems", "Storage & DB", "Kernel & Networking", "Cloud & DevOps"]

  const filtered =
    filterCategory === "All"
      ? milestones
      : milestones.filter((m) => m.category === filterCategory)

  return (
    <div className="flex flex-col gap-8">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 border-b border-border/30 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundFx.playClick()
              setFilterCategory(cat)
            }}
            className={`rounded-full px-3 py-1 text-xs font-mono border transition-all ${
              filterCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/30 bg-card/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Milestones Timeline List */}
      <div className="relative flex flex-col gap-8 pl-6 sm:pl-8 border-l-2 border-border/40 ml-3 sm:ml-4">
        {filtered.map((item, idx) => {
          const isCompleted = item.status === "Completed"
          const isInProgress = item.status === "In Progress"

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex flex-col gap-3"
            >
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-7.75 sm:-left-9.75 top-1.5 h-4 w-4 rounded-full border-2 bg-background flex items-center justify-center ${
                  isCompleted
                    ? "border-emerald-500 text-emerald-400"
                    : isInProgress
                    ? "border-primary text-primary animate-pulse"
                    : "border-border text-muted-foreground"
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    isCompleted
                      ? "bg-emerald-500"
                      : isInProgress
                      ? "bg-primary"
                      : "bg-muted-foreground"
                  }`}
                />
              </div>

              {/* Card */}
              <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-xs hover:border-border/70 transition-all">
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary font-bold">
                        {item.quarter}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-base sm:text-lg font-bold text-foreground">
                      {item.title}
                    </CardTitle>
                  </div>

                  <Badge
                    className={`text-[10px] font-mono self-start sm:self-auto ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : isInProgress
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "bg-muted text-muted-foreground border-border/30"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-4 flex flex-col gap-4 text-xs font-sans">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* Deliverables */}
                  <div className="flex flex-col gap-1.5 bg-card/20 p-3 rounded-lg border border-border/20">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                      Key Technical Deliverables:
                    </span>
                    <ul className="space-y-1 font-mono text-[11px] text-zinc-300">
                      {item.deliverables.map((d, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.technologies.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px] font-mono border-border/30 text-muted-foreground">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
