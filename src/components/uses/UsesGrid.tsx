"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Laptop, Terminal, Wrench, Database, Sparkles, Monitor, Cpu, Keyboard, Headphones, Check } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface GearItem {
  name: string
  category: "Workstation" | "Editor & Terminal" | "Systems & Profiling" | "Backend & DB" | "Productivity"
  description: string
  tags: string[]
  link?: string
}

const gearItems: GearItem[] = [
  // Workstation
  {
    name: "Custom Linux Workstation & Apple Silicon",
    category: "Workstation",
    description: "Multi-threaded AMD Ryzen 9 7950X (16C/32T) with 64GB DDR5 ECC RAM for parallel compilation and Docker container clusters, complemented by an M-series MacBook for mobile work.",
    tags: ["AMD 7950X", "64GB DDR5", "Arch Linux", "macOS"],
  },
  {
    name: "Dual 4K IPS Displays (144Hz)",
    category: "Workstation",
    description: "High refresh-rate color-accurate monitors mounted on gas-spring arms for terminal multitasking, trace logs, and documentation side-by-side.",
    tags: ["4K 144Hz", "USB-C KVM"],
  },
  {
    name: "Keychron Q1 Pro Custom Mechanical Keyboard",
    category: "Workstation",
    description: "Gasket-mounted aluminum chassis with lubed tactile switches, PBT double-shot keycaps, and custom QMK/VIA keymaps for frictionless Vim navigation.",
    tags: ["QMK/VIA", "Tactile Switches", "Alu Case"],
  },

  // Editor & Terminal
  {
    name: "Neovim (Lua-configured)",
    category: "Editor & Terminal",
    description: "Hand-crafted Lua configuration with Lazy.nvim, Treesitter for precision AST syntax highlighting, and native LSP clients for Rust Analyzer, Gopls, and TypeScript.",
    tags: ["Neovim", "Treesitter", "LSP", "Lua"],
  },
  {
    name: "Ghostty & Alacritty Terminal",
    category: "Editor & Terminal",
    description: "GPU-accelerated terminal emulators rendering high-DPI typography at 144fps with custom Tokio/Catppuccin dark color palettes.",
    tags: ["GPU Accelerated", "Ghostty", "Starship Prompt"],
  },
  {
    name: "Tmux (Terminal Multiplexer)",
    category: "Editor & Terminal",
    description: "Session management and split-pane orchestration with custom keybindings and automatic resurrect hooks.",
    tags: ["Tmux", "Sessionizer", "CLI Workflow"],
  },

  // Systems & Profiling
  {
    name: "eBPF, bpftrace & BCC Tools",
    category: "Systems & Profiling",
    description: "Low-overhead Linux kernel tracing and packet inspection programs for measuring disk I/O latency and network socket queue depth.",
    tags: ["eBPF", "bpftrace", "Linux Tracing"],
  },
  {
    name: "Flamegraph & Perf",
    category: "Systems & Profiling",
    description: "On-CPU and off-CPU sampling profiler tools to detect CPU cache bottlenecks, false sharing, and hot execution paths in Go and Rust services.",
    tags: ["Perf", "Flamegraphs", "Profiling"],
  },
  {
    name: "Wireshark & tcpdump",
    category: "Systems & Profiling",
    description: "Deep packet inspection for analyzing gRPC protobuf payloads, TLS handshakes, and TCP window scaling issues.",
    tags: ["Packet Analysis", "gRPC", "TCP/IP"],
  },

  // Backend & DB
  {
    name: "PostgreSQL & TablePlus",
    category: "Backend & DB",
    description: "Primary relational database engine paired with native GUI client for query profiling, EXPLAIN ANALYZE inspection, and index optimizations.",
    tags: ["PostgreSQL", "TablePlus", "SQL"],
  },
  {
    name: "Docker & Minikube",
    category: "Backend & DB",
    description: "Local containerized orchestration for simulating multi-node Raft consensus clusters and Redis distributed caching rings.",
    tags: ["Docker", "Kubernetes", "Redis"],
  },
  {
    name: "Postman & Evans CLI",
    category: "Backend & DB",
    description: "Universal API client for REST endpoints and interactive gRPC reflection client for testing Protobuf RPC services.",
    tags: ["REST", "gRPC", "Protobuf"],
  },

  // Productivity
  {
    name: "Obsidian & Markdown Zettelkasten",
    category: "Productivity",
    description: "Bi-directional linked markdown note-taking vault containing architecture cheat sheets, distributed systems papers, and DSA notes.",
    tags: ["Obsidian", "PKM", "Markdown"],
  },
  {
    name: "Raycast Launcher",
    category: "Productivity",
    description: "Extensible keyboard-driven application launcher with custom script commands for fast GitHub PR lookups and clipboard history.",
    tags: ["Raycast", "Automation"],
  },
]

export function UsesGrid() {
  const [filterCategory, setFilterCategory] = useState<string>("All")

  const categories = [
    "All",
    "Workstation",
    "Editor & Terminal",
    "Systems & Profiling",
    "Backend & DB",
    "Productivity",
  ]

  const filtered =
    filterCategory === "All"
      ? gearItems
      : gearItems.filter((g) => g.category === filterCategory)

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

      {/* Grid of gear */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item, idx) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card className="h-full bg-card/25 border-border/40 backdrop-blur-sm hover:border-border/70 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono border-border/40 text-muted-foreground">
                    {item.category}
                  </Badge>
                </div>
                <CardTitle className="font-heading text-base font-bold text-foreground mt-1">
                  {item.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0 flex flex-col gap-4 text-xs font-sans">
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/15">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-card/30 border border-border/25 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
