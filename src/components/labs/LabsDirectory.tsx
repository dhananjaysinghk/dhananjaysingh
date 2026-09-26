"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Layers,
  RotateCcw,
  Cpu,
  Share2,
  Binary,
  Activity,
  FolderTree,
  Database,
  Droplets,
  Globe,
  Gauge,
  Wrench,
  Search,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Zap,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

interface LabItem {
  id: string
  title: string
  slug: string
  category: "Distributed Systems" | "Kernel & Low-Level" | "Storage & Databases" | "Concurrency & Performance" | "Networking & CDN"
  description: string
  techStack: string[]
  metrics: string
  complexity: "Intermediate" | "Advanced" | "Expert"
  icon: React.ComponentType<{ className?: string }>
  badgeColor: string
}

export const LAB_ITEMS: LabItem[] = [
  {
    id: "disruptor",
    title: "LMAX Disruptor & Lock-Free Ring Buffer",
    slug: "/disruptor",
    category: "Concurrency & Performance",
    description: "Ultra-low-latency inter-thread messaging architecture. Explores mechanical sympathy, CPU cache-line 64B false sharing prevention, and atomic CAS sequence barriers.",
    techStack: ["Lock-Free", "Atomic CAS", "Cache Padding", "Ring Buffer"],
    metrics: "12M+ ops/sec | 0 Mutex Locks",
    complexity: "Expert",
    icon: RotateCcw,
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "kafka",
    title: "Kafka Event Log & Partition Rebalance",
    slug: "/kafka",
    category: "Distributed Systems",
    description: "High-throughput distributed commit log simulator exploring MurmurHash2 partition routing, commit offsets, consumer lag, and Incremental Cooperative Rebalancing.",
    techStack: ["Kafka", "Commit Log", "Consumer Groups", "Rebalancing"],
    metrics: "Sub-5ms Lag | Zero-Downtime Rebalance",
    complexity: "Advanced",
    icon: Layers,
    badgeColor: "border-orange-500/30 text-orange-400 bg-orange-500/10",
  },
  {
    id: "mmu",
    title: "Virtual Memory MMU & 4-Level Page Table",
    slug: "/mmu",
    category: "Kernel & Low-Level",
    description: "Hardware-level memory management unit translation. Simulates x86-64 4-level page tables (PML4, PDPT, PD, PT), TLB caching hits/misses, and Page Fault handlers.",
    techStack: ["x86-64 MMU", "TLB Cache", "Page Tables", "Virtual Memory"],
    metrics: "48-bit Virtual Address | 4KB Page Frames",
    complexity: "Expert",
    icon: Cpu,
    badgeColor: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  },
  {
    id: "gossip",
    title: "SWIM Gossip Mesh & Failure Detector",
    slug: "/gossip",
    category: "Distributed Systems",
    description: "Decentralized cluster membership and weakly-consistent infection-style gossip protocol with indirect ping probes and suspicion timers.",
    techStack: ["SWIM Protocol", "Failure Detection", "Gossip Mesh", "Distributed"],
    metrics: "O(log N) Convergence | Probabilistic Guarantee",
    complexity: "Advanced",
    icon: Share2,
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "merkle",
    title: "Merkle Tree & Inclusion Proof Engine",
    slug: "/merkle",
    category: "Distributed Systems",
    description: "Cryptographic hash tree verifying decentralized state integrity. Generates O(log N) sibling hashes for tamper-evident data inclusion proofs.",
    techStack: ["SHA-256", "Merkle Trees", "Inclusion Proofs", "Cryptography"],
    metrics: "O(log N) Proof Size | Zero-Knowledge Ready",
    complexity: "Advanced",
    icon: Binary,
    badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  },
  {
    id: "tracing",
    title: "Distributed Tracing & OpenTelemetry Waterfall",
    slug: "/tracing",
    category: "Distributed Systems",
    description: "End-to-end W3C trace context propagation across microservices with critical path timeline analysis and span bottleneck detection.",
    techStack: ["OpenTelemetry", "W3C Context", "Span Hierarchies", "APM"],
    metrics: "Nanosecond Timing | Critical Path Extraction",
    complexity: "Intermediate",
    icon: Activity,
    badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  },
  {
    id: "btree",
    title: "Database B+ Tree Index & Leaf Scan",
    slug: "/btree",
    category: "Storage & Databases",
    description: "Relational database index engine with balanced multi-way branching, node splitting, and linked leaf nodes for ultra-fast range query scans.",
    techStack: ["B+ Tree", "Database Indexing", "Disk Blocks", "Range Queries"],
    metrics: "O(log_B N) Disk I/O | Sequential Leaf Pointers",
    complexity: "Advanced",
    icon: FolderTree,
    badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  },
  {
    id: "crdt",
    title: "CRDT & Vector Clock Distributed Sync Mesh",
    slug: "/crdt",
    category: "Distributed Systems",
    description: "Conflict-free replicated data types and causal vector clock ordering enabling peer-to-peer real-time state synchronization without central locks.",
    techStack: ["CRDT", "Vector Clocks", "Eventual Consistency", "LWW-Element-Set"],
    metrics: "Deterministic Merge | 0 Merge Conflicts",
    complexity: "Expert",
    icon: Share2,
    badgeColor: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
  },
  {
    id: "ebpf",
    title: "eBPF Kernel Packet Filter & Tracing Sandbox",
    slug: "/ebpf",
    category: "Kernel & Low-Level",
    description: "In-kernel programmable bytecode engine executing safe JIT-compiled C filters at the XDP socket layer without context switching to userspace.",
    techStack: ["eBPF", "XDP Hook", "Linux Kernel", "Kernel Ring Buffer"],
    metrics: "10Gbps Wire-Speed | Safe In-Kernel Verifier",
    complexity: "Expert",
    icon: Activity,
    badgeColor: "border-teal-500/30 text-teal-400 bg-teal-500/10",
  },
  {
    id: "storage",
    title: "LSM-Tree Storage Engine & Compaction",
    slug: "/storage",
    category: "Storage & Databases",
    description: "High-write throughput storage architecture modeled after RocksDB and Cassandra with in-memory MemTables, immutable SSTables, and Leveled Compaction.",
    techStack: ["LSM-Tree", "RocksDB Architecture", "SSTables", "Bloom Filters"],
    metrics: "Sequential Disk Write | Multi-Level Compaction",
    complexity: "Advanced",
    icon: Database,
    badgeColor: "border-sky-500/30 text-sky-400 bg-sky-500/10",
  },
  {
    id: "cache",
    title: "O(1) LRU (Least Recently Used) Cache",
    slug: "/cache",
    category: "Concurrency & Performance",
    description: "High-performance eviction algorithm combining doubly linked list pointers with a fast hash map for true constant-time get and set operations.",
    techStack: ["LRU Eviction", "Hash Map", "Doubly Linked List", "O(1) Memory"],
    metrics: "O(1) Constant Time | Zero-Allocation Pointer Swaps",
    complexity: "Intermediate",
    icon: Cpu,
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "ratelimit",
    title: "Token Bucket & Leaky Bucket Rate Limiter",
    slug: "/ratelimit",
    category: "Networking & CDN",
    description: "Distributed traffic policing algorithm supporting dynamic replenishment, burst capacity handling, and HTTP 429 Retry-After header calculations.",
    techStack: ["Token Bucket", "Traffic Shaping", "Redis Emulation", "Rate Limiting"],
    metrics: "Microsecond Token Refill | Burst Protection",
    complexity: "Intermediate",
    icon: Droplets,
    badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  },
  {
    id: "sql",
    title: "PostgreSQL Query Profiler & EXPLAIN Visualizer",
    slug: "/sql",
    category: "Storage & Databases",
    description: "Relational execution plan optimizer comparing Index Scans, Bitmap Index Scans, Hash Joins, and Sequential Scans with real cost metrics.",
    techStack: ["PostgreSQL", "Query Planner", "EXPLAIN ANALYZE", "Index Optimization"],
    metrics: "Cost Analysis | Execution Plan Optimizer",
    complexity: "Intermediate",
    icon: Database,
    badgeColor: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  },
  {
    id: "network",
    title: "Global Anycast CDN Edge & Latency Routing",
    slug: "/network",
    category: "Networking & CDN",
    description: "Multi-region BGP Anycast routing mesh simulating worldwide PoP edge caching, TCP handshake latency, and TLS 1.3 session resumption.",
    techStack: ["BGP Anycast", "CDN Edge", "DNS Routing", "Worldwide PoPs"],
    metrics: "12 Global PoPs | Sub-20ms Edge Response",
    complexity: "Intermediate",
    icon: Globe,
    badgeColor: "border-violet-500/30 text-violet-400 bg-violet-500/10",
  },
  {
    id: "benchmark",
    title: "CPU Sorting & Memory Hierarchy Benchmark",
    slug: "/benchmark",
    category: "Concurrency & Performance",
    description: "Live in-browser microbenchmark testing QuickSort, MergeSort, RadixSort, and TimSort against varying array entropy and cache profiles.",
    techStack: ["Algorithms", "Memory Latency", "Sorting Benchmarks", "High Precision"],
    metrics: "Microsecond Timers | Real-Time Sorting Profiler",
    complexity: "Advanced",
    icon: Gauge,
    badgeColor: "border-rose-500/30 text-rose-400 bg-rose-500/10",
  },
  {
    id: "tools",
    title: "Systems Engineering Sandbox & Utilities",
    slug: "/tools",
    category: "Kernel & Low-Level",
    description: "Interactive laboratory featuring 64-Byte CPU L1 cache line false sharing, consistent hash ring distributor, bitwise flag calculators, and arena allocators.",
    techStack: ["Cache Lines", "Consistent Hash Ring", "Bitwise Flags", "Arena Allocator"],
    metrics: "Hardware Simulators | Interactive Bitwise Engine",
    complexity: "Advanced",
    icon: Wrench,
    badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  },
]

const CATEGORIES = [
  "All",
  "Distributed Systems",
  "Kernel & Low-Level",
  "Storage & Databases",
  "Concurrency & Performance",
  "Networking & CDN",
] as const

export function LabsDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLabs = LAB_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.techStack.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesCategory && matchesQuery
  })

  return (
    <div className="flex flex-col gap-10">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm shadow-xs">
        <div className="relative grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search simulators, algorithms, protocols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 text-xs font-mono bg-background/50 border-border/50 focus-visible:ring-1"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => {
                  soundFx.playClick()
                  setSelectedCategory(category)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/30"
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid of Simulators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredLabs.map((lab) => {
            const Icon = lab.icon
            return (
              <motion.div
                key={lab.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="flex flex-col h-full bg-card/25 backdrop-blur-sm border-border/40 hover:border-border/80 transition-all hover:bg-card/45 group overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono tracking-tight text-muted-foreground uppercase">
                        {lab.category}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${lab.badgeColor}`}
                      >
                        {lab.complexity}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                      <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Link href={lab.slug} className="truncate">
                        {lab.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grow flex flex-col justify-between gap-4">
                    <CardDescription className="text-xs font-sans text-muted-foreground leading-relaxed">
                      {lab.description}
                    </CardDescription>

                    <div className="space-y-3 pt-2">
                      <div className="p-2 rounded bg-muted/30 border border-border/20 text-[10px] font-mono text-foreground/80 flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                        <span className="truncate">{lab.metrics}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {lab.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="px-1.5 py-0.5 text-[9px] font-mono border-border/30 text-muted-foreground"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-border/20 flex items-center justify-between text-xs font-medium">
                    <Link
                      href={lab.slug}
                      onClick={() => soundFx.playClick()}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline transition-all"
                    >
                      Launch Simulator
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Interactive Live
                    </span>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredLabs.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl p-8 bg-card/10">
          <p className="text-sm font-mono text-muted-foreground">
            No simulators found matching &ldquo;{searchQuery}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
          </p>
        </div>
      )}
    </div>
  )
}
