"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileCode, CheckCircle2, ChevronRight, Tag, Filter, Layers, Zap, Scale } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface ADR {
  id: string
  number: string
  title: string
  status: "Accepted" | "Proposed" | "Active"
  date: string
  category: "Distributed Systems" | "Performance" | "Database" | "Frontend"
  context: string
  decision: string
  consequences: {
    positive: string[]
    negative: string[]
  }
}

const adrList: ADR[] = [
  {
    id: "adr-001",
    number: "ADR-001",
    title: "Adopting Raft Consensus Over Multi-Paxos for Cluster State Replication",
    status: "Accepted",
    date: "July 2026",
    category: "Distributed Systems",
    context:
      "Our distributed cluster coordinator needed a consensus algorithm to manage state transitions across worker nodes with strict linearizability guarantees during split-brain network partitions.",
    decision:
      "Implement the Raft consensus protocol in Go. Raft decomposes consensus into explicit leader election, log replication, and safety constraints, significantly reducing implementation complexity compared to Multi-Paxos.",
    consequences: {
      positive: [
        "Simpler state machine replication mental model and formal TLA+ verification friendliness",
        "Deterministic leader leases and predictable 50ms heartbeat interval timeouts",
        "Straightforward log compaction via snapshotting",
      ],
      negative: [
        "All client writes must funnel through the elected leader, causing bottleneck under single-node write spikes",
        "Leader failover requires 150-300ms election timeout window",
      ],
    },
  },
  {
    id: "adr-002",
    number: "ADR-002",
    title: "64-Byte Cache Line Padding and Lock-Free Ring Buffers for Order Matching",
    status: "Accepted",
    date: "June 2026",
    category: "Performance",
    context:
      "Aura Ledger experienced high p99.9 latency spikes (>45μs) due to false sharing cache invalidations when worker thread cores mutated adjacent memory addresses in the sequencing queue.",
    decision:
      "Adopt explicit `#[repr(align(64))]` memory struct alignment in Rust alongside lock-free bounded SPSC (Single Producer Single Consumer) ring buffers using atomic acquire/release memory orderings.",
    consequences: {
      positive: [
        "Eliminated L1/L2 cache coherency MESI bus invalidation storms",
        "Reduced p99.9 order matching execution latency from 48μs down to 3.2μs",
        "Zero mutex contention on the critical execution hot path",
      ],
      negative: [
        "Increased struct memory footprint due to unused 64-byte padding overhead",
        "Requires strict unsafe audit boundaries around ring buffer pointer indexing",
      ],
    },
  },
  {
    id: "adr-003",
    number: "ADR-003",
    title: "Hybrid PostgreSQL Driver Adapters with Connection Pooling over Stateless Serverless",
    status: "Accepted",
    date: "May 2026",
    category: "Database",
    context:
      "Evaluating database connectivity architectures between serverless edge HTTP connections vs persistent TCP connection pools using Prisma v7.",
    decision:
      "Utilize Prisma v7 `@prisma/adapter-pg` with a pooled TCP `pg.Pool` instance for backend actions, complemented by in-memory LRU caching for static project and article read endpoints.",
    consequences: {
      positive: [
        "Sub-millisecond query execution on warmed PostgreSQL connections",
        "Support for complex relational ACID transactions and recursive CTE queries",
        "Type-safe generated Prisma Client output directory targeting `@/generated/prisma`",
      ],
      negative: [
        "Requires connection pool size management to prevent PostgreSQL backend exhaustion",
      ],
    },
  },
  {
    id: "adr-004",
    number: "ADR-004",
    title: "Client-Side In-Memory AST Markdown Tokenizer for Technical Case Studies",
    status: "Accepted",
    date: "April 2026",
    category: "Frontend",
    context:
      "Rendering complex technical blog articles with custom callout blocks (:::note, :::success, :::warning), syntax highlighted code blocks, and dynamic table of contents without heavyweight server runtime dependencies.",
    decision:
      "Build a custom client-side tokenizing renderer with regex AST parsing, dynamic heading URL hash injection, and clipboard integration.",
    consequences: {
      positive: [
        "Instant page transitions with zero cold-start rendering penalty",
        "Interactive syntax code copy buttons with zero external bundle weight",
        "Seamless integration with table of contents and reading progress bars",
      ],
      negative: [
        "Requires manual maintenance of custom markdown syntax extension rules",
      ],
    },
  },
  {
    id: "adr-005",
    number: "ADR-005",
    title: "eBPF XDP In-Kernel Packet Filtering over Userspace Reverse Proxies for DDoS Mitigation",
    status: "Accepted",
    date: "August 2026",
    category: "Performance",
    context:
      "High-throughput edge routers suffered from CPU interrupt saturation and context-switch latency under SYN-flood and UDP packet amplification attacks.",
    decision:
      "Implement XDP (eXpress Data Path) eBPF bytecode hooks in the Linux network driver layer, dropping or routing malicious packets before kernel `sk_buff` allocation.",
    consequences: {
      positive: [
        "Achieved wire-speed 10Gbps+ packet filtering with zero userspace context switching",
        "Linux kernel verifier ensures memory safety and non-crashing execution",
        "Real-time packet count telemetry streamed through BPF ring buffers",
      ],
      negative: [
        "Requires modern Linux kernel (5.8+) with NIC driver XDP support",
        "Limited helper function availability inside XDP hook constraints",
      ],
    },
  },
  {
    id: "adr-006",
    number: "ADR-006",
    title: "Incremental Cooperative Rebalancing over Eager Rebalancing in Kafka Consumer Groups",
    status: "Accepted",
    date: "August 2026",
    category: "Distributed Systems",
    context:
      "Consumer node scaling events caused catastrophic 'Stop-The-World' pauses across all consumer partitions under legacy Eager rebalance protocols.",
    decision:
      "Mandate the Incremental Cooperative Rebalancing protocol across all consumer group topologies, allowing unassigned partitions to continue processing without downtime.",
    consequences: {
      positive: [
        "Eliminated cluster-wide consumer pauses during horizontal pod autoscaling",
        "Reduced consumer lag spikes during partition reassignment by over 90%",
        "Progressive partition handoffs without revoking unimpacted workers",
      ],
      negative: [
        "Requires multiple rebalance rounds for complex partition migrations",
      ],
    },
  },
  {
    id: "adr-007",
    number: "ADR-007",
    title: "Leveled Compaction Strategy (LCS) over Size-Tiered (STCS) in LSM-Tree Storage",
    status: "Accepted",
    date: "September 2026",
    category: "Database",
    context:
      "Size-Tiered Compaction caused excessive 50%+ disk space amplification and unpredictable write stall spikes during large SSTable merges.",
    decision:
      "Adopt RocksDB-style Leveled Compaction Strategy (LCS) with non-overlapping keys in Level 1+ and fractional bloom filters for SSTable lookups.",
    consequences: {
      positive: [
        "Maintained bounded disk space amplification under 10-15%",
        "Predictable point-lookup latency by strictly limiting SSTable overlap per level",
        "Smoother background I/O merge profiles without sudden disk saturation",
      ],
      negative: [
        "Higher overall write amplification factor compared to Size-Tiered compaction",
      ],
    },
  },
  {
    id: "adr-008",
    number: "ADR-008",
    title: "48-Bit Virtual Memory Canonical Paging Scheme for x86-64 Emulation Sandbox",
    status: "Accepted",
    date: "September 2026",
    category: "Performance",
    context:
      "Designing a deterministic WebAssembly/TypeScript hardware MMU simulator to demonstrate TLB hits, page table walking (PML4 -> PDPT -> PD -> PT), and page fault traps.",
    decision:
      "Implement a 48-bit 4-level canonical paging hierarchy with a 16-entry 2-way set associative TLB and simulated kernel frame allocator.",
    consequences: {
      positive: [
        "Accurately reflects real-world Linux and hardware x86-64 page translation pipelines",
        "Enables interactive visual tracing of multi-level memory dereferencing",
        "Zero external dependencies with sub-millisecond translation timers",
      ],
      negative: [
        "Requires handling 4-level nested pointer maps in memory state",
      ],
    },
  },
]

export function AdrViewer() {
  const [selectedAdr, setSelectedAdr] = useState<ADR>(adrList[0])
  const [filterCategory, setFilterCategory] = useState<string>("All")

  const categories = ["All", "Distributed Systems", "Performance", "Database", "Frontend"]

  const filteredAdrs =
    filterCategory === "All"
      ? adrList
      : adrList.filter((a) => a.category === filterCategory)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Sidebar: List & Filter */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5 pb-2">
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

        {/* ADR List */}
        <div className="flex flex-col gap-3">
          {filteredAdrs.map((adr) => {
            const isSelected = selectedAdr.id === adr.id
            return (
              <motion.div
                key={adr.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  soundFx.playClick()
                  setSelectedAdr(adr)
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col gap-2 ${
                  isSelected
                    ? "border-primary/60 bg-primary/10 shadow-md ring-1 ring-primary/30"
                    : "border-border/30 bg-card/20 hover:border-border/70 hover:bg-card/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {adr.number}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-border/40">
                      {adr.category}
                    </Badge>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                    {adr.status}
                  </Badge>
                </div>

                <h3 className="font-heading text-sm font-bold text-foreground leading-snug">
                  {adr.title}
                </h3>

                <span className="text-[11px] font-mono text-muted-foreground">
                  Logged: {adr.date}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Right Main Detail View */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAdr.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md">
              <CardHeader className="border-b border-border/20 pb-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-primary font-bold">
                    {selectedAdr.number} • Architecture Decision Record
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                    {selectedAdr.status}
                  </Badge>
                </div>
                <CardTitle className="font-heading text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
                  {selectedAdr.title}
                </CardTitle>
                <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span>Category: {selectedAdr.category}</span>
                  <span>•</span>
                  <span>Date: {selectedAdr.date}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6 flex flex-col gap-6 text-xs sm:text-sm font-sans leading-relaxed">
                {/* 1. Context */}
                <div className="flex flex-col gap-2">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    Context & Problem Statement
                  </h4>
                  <p className="text-muted-foreground bg-card/20 p-4 rounded-xl border border-border/20">
                    {selectedAdr.context}
                  </p>
                </div>

                {/* 2. Decision Outcome */}
                <div className="flex flex-col gap-2">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    Decision Outcome
                  </h4>
                  <p className="text-foreground font-medium bg-primary/5 p-4 rounded-xl border border-primary/20">
                    {selectedAdr.decision}
                  </p>
                </div>

                {/* 3. Consequences Matrix */}
                <div className="flex flex-col gap-2">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-emerald-400" />
                    Trade-offs & Consequences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Positive */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col gap-2">
                      <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase">
                        Positive (Benefits)
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                        {selectedAdr.consequences.positive.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Negative */}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-400 uppercase">
                        Negative (Costs)
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                        {selectedAdr.consequences.negative.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
