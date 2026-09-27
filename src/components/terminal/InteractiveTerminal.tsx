"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Terminal, Maximize2, Minimize2, Trash2, HelpCircle, Sparkles, CornerDownLeft, Volume2, VolumeX } from "lucide-react"
import { soundFx } from "@/lib/sound"

interface TerminalHistoryItem {
  id: string
  command?: string
  output: React.ReactNode
  isError?: boolean
  timestamp: string
}

export function InteractiveTerminal() {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [inputVal, setInputVal] = useState("")
  const [history, setHistory] = useState<TerminalHistoryItem[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Welcome message
  useEffect(() => {
    const welcomeId = Math.random().toString(36).substring(7)
    setHistory([
      {
        id: welcomeId,
        timestamp: new Date().toLocaleTimeString(),
        output: (
          <div className="space-y-2 text-zinc-300 font-mono text-xs leading-relaxed">
            <div className="text-emerald-400 font-bold">
              {`
   ____  __                         _               _____ _             __  
  / __ \\/ /_  ____ _____  ____ _   (_)___ ___  __  / ___/(_)___  ____ _/ /_ 
 / / / / __ \\/ __ \`/ __ \\/ __ \`/  / / __ \`/ / / /  \\__ \\/ / __ \\/ __ \`/ __ \\
/ /_/ / / / / /_/ / / / / /_/ /  / / /_/ / /_/ /  ___/ / / / / / /_/ / / / /
/_____/_/ /_/\\__,_/_/ /_/\\__,_/  / /\\__,_/\\__, /  /____/_/_/ /_/\\__, /_/ /_/ 
                              /___/      /____/                /____/        
              `}
            </div>
            <p className="text-zinc-400">
              Welcome to <span className="text-foreground font-bold">Dhananjay Singh&apos;s Interactive Systems Shell</span> (v2.4.0).
            </p>
            <p className="text-zinc-500">
              Type <span className="text-emerald-400 font-semibold">&apos;help&apos;</span> or <span className="text-emerald-400 font-semibold">&apos;neofetch&apos;</span> to explore commands, system architecture, projects, and live simulators.
            </p>
          </div>
        ),
      },
    ])
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  // Focus input on click
  const focusInput = () => {
    inputRef.current?.focus()
  }

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim()
    if (!trimmed) return

    soundFx.playClick()
    setCommandHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)

    const parts = trimmed.split(" ")
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)
    const timestamp = new Date().toLocaleTimeString()
    const itemId = Math.random().toString(36).substring(7)

    let output: React.ReactNode = null
    let isError = false

    switch (cmd) {
      case "help":
      case "commands":
        output = (
          <div className="space-y-2 font-mono text-xs">
            <div className="text-primary font-bold">Available System Commands:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-zinc-300">
              <div><span className="text-emerald-400 font-bold">neofetch</span> - Display system architecture & spec card</div>
              <div><span className="text-emerald-400 font-bold">whoami</span> - Display engineer profile and background</div>
              <div><span className="text-emerald-400 font-bold">skills</span> - Breakdown of systems, backend & low-level proficiencies</div>
              <div><span className="text-emerald-400 font-bold">projects</span> - List flagship distributed & cloud systems</div>
              <div><span className="text-emerald-400 font-bold">labs</span> - List 16 interactive low-level simulators</div>
              <div><span className="text-emerald-400 font-bold">benchmark</span> - Run in-browser microsecond CPU benchmark</div>
              <div><span className="text-emerald-400 font-bold">cat &lt;file&gt;</span> - Read files (e.g. `cat bio`, `cat contact`)</div>
              <div><span className="text-emerald-400 font-bold">theme &lt;mode&gt;</span> - Set theme (`theme dark` / `theme light`)</div>
              <div><span className="text-emerald-400 font-bold">curl health</span> - Inspect live `/api/health` JSON payload</div>
              <div><span className="text-emerald-400 font-bold">ping &lt;host&gt;</span> - Simulate edge Anycast latency ping</div>
              <div><span className="text-emerald-400 font-bold">matrix</span> - Digital rain console pulse</div>
              <div><span className="text-emerald-400 font-bold">goto &lt;path&gt;</span> - Navigate to route (`goto /disruptor`, `goto /kafka`)</div>
              <div><span className="text-emerald-400 font-bold">clear</span> - Flush terminal buffer</div>
            </div>
          </div>
        )
        break

      case "neofetch":
        output = (
          <div className="flex flex-col sm:flex-row gap-6 font-mono text-xs py-2 text-zinc-300">
            <div className="text-primary font-bold select-none text-[10px] leading-tight">
              {`
   ██████╗ ███████╗
   ██╔══██╗██╔════╝
   ██║  ██║███████╗
   ██║  ██║╚════██║
   ██████╔╝███████║
   ╚═════╝ ╚══════╝
   DS.DEV v2.4.0
              `}
            </div>
            <div className="space-y-1">
              <div><span className="text-primary font-bold">dhananjay</span>@<span className="text-emerald-400 font-bold">engine.prod</span></div>
              <div className="text-zinc-600">--------------------------</div>
              <div><span className="text-emerald-400">OS:</span> High-Throughput Distributed Runtime (Next.js 16 + Rust Wasm)</div>
              <div><span className="text-emerald-400">Host:</span> Dhananjay Singh Portfolio Platform</div>
              <div><span className="text-emerald-400">Kernel:</span> x86-64 Emulation / V8 JIT / Web Audio API</div>
              <div><span className="text-emerald-400">Uptime:</span> 99.99% Multi-Region CDN</div>
              <div><span className="text-emerald-400">Shell:</span> agy-sh 2.4-interactive</div>
              <div><span className="text-emerald-400">Simulators:</span> 16 Interactive High-Performance Systems Labs</div>
              <div><span className="text-emerald-400">Memory:</span> 0-Allocation Pre-Allocated Ring Buffers</div>
              <div className="flex gap-1.5 pt-2">
                <span className="h-3 w-4 bg-red-500 rounded-xs" />
                <span className="h-3 w-4 bg-orange-500 rounded-xs" />
                <span className="h-3 w-4 bg-yellow-500 rounded-xs" />
                <span className="h-3 w-4 bg-green-500 rounded-xs" />
                <span className="h-3 w-4 bg-cyan-500 rounded-xs" />
                <span className="h-3 w-4 bg-blue-500 rounded-xs" />
                <span className="h-3 w-4 bg-purple-500 rounded-xs" />
              </div>
            </div>
          </div>
        )
        break

      case "whoami":
        output = (
          <div className="space-y-1.5 font-mono text-xs text-zinc-300">
            <div className="text-emerald-400 font-bold">Dhananjay Singh — Software Engineer & Systems Researcher</div>
            <p className="text-zinc-400 leading-relaxed">
              Specialized in distributed consensus protocols, low-level concurrency (lock-free structures, mechanical sympathy), high-throughput data pipelines, and interactive systems visualization.
            </p>
            <div className="pt-1 text-zinc-500">
              Location: India | Available for full-time & high-impact contracts | Contact: dhananjay6903@gmail.com
            </div>
          </div>
        )
        break

      case "skills":
        output = (
          <div className="space-y-2 font-mono text-xs text-zinc-300">
            <div className="text-primary font-bold">Core Competencies:</div>
            <div className="space-y-1.5">
              <div>
                <span className="text-emerald-400 font-semibold">Systems & Languages:</span> Rust, Go, TypeScript, C, SQL, WebAssembly, Python
              </div>
              <div>
                <span className="text-cyan-400 font-semibold">Distributed & Storage:</span> Raft Consensus, Kafka, RocksDB/LSM, CRDTs, Vector Clocks, Redis, PostgreSQL
              </div>
              <div>
                <span className="text-indigo-400 font-semibold">Performance & Kernel:</span> Lock-Free Concurrency (LMAX Disruptor), eBPF, MMU Virtual Memory, Cache-Line Optimization
              </div>
              <div>
                <span className="text-purple-400 font-semibold">Cloud & Observability:</span> Docker, Kubernetes, OpenTelemetry Tracing, Prometheus, BGP Anycast CDN
              </div>
            </div>
          </div>
        )
        break

      case "projects":
        output = (
          <div className="space-y-2 font-mono text-xs text-zinc-300">
            <div className="text-primary font-bold">Flagship Projects:</div>
            <div className="space-y-2">
              <div className="border-l-2 border-emerald-500 pl-3">
                <div className="font-bold text-foreground">1. Nova Orchestrator (Go / gRPC / Raft)</div>
                <div className="text-zinc-400">High-performance cloud container scheduler and mesh orchestrator with sub-10ms latency.</div>
              </div>
              <div className="border-l-2 border-cyan-500 pl-3">
                <div className="font-bold text-foreground">2. Aura Ledger (Rust / Tokio / PostgreSQL)</div>
                <div className="text-zinc-400">Distributed transactional clearance engine with microsecond settlement and cryptographic logs.</div>
              </div>
              <div className="border-l-2 border-indigo-500 pl-3">
                <div className="font-bold text-foreground">3. Vortex CDN (Rust / Wasm / Edge)</div>
                <div className="text-zinc-400">Edge server caching platform built on WebAssembly reducing worker cold-starts by 70%.</div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 pt-1">
              Type `goto /projects` to view full architecture case studies.
            </div>
          </div>
        )
        break

      case "labs":
        output = (
          <div className="space-y-2 font-mono text-xs text-zinc-300">
            <div className="text-primary font-bold">Interactive Systems Simulators (16 Labs):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-zinc-400">
              <div>• <span className="text-emerald-300 font-bold">/disruptor</span> - LMAX Lock-Free Ring Buffer</div>
              <div>• <span className="text-orange-300 font-bold">/kafka</span> - Distributed Event Log & Rebalance</div>
              <div>• <span className="text-cyan-300 font-bold">/mmu</span> - Virtual Memory 4-Level Page Tables</div>
              <div>• <span className="text-purple-300 font-bold">/gossip</span> - SWIM Gossip Mesh & Failure Detector</div>
              <div>• <span className="text-pink-300 font-bold">/merkle</span> - Merkle Tree Inclusion Proofs</div>
              <div>• <span className="text-blue-300 font-bold">/tracing</span> - OpenTelemetry Distributed Tracing</div>
              <div>• <span className="text-amber-300 font-bold">/btree</span> - Database B+ Tree Leaf Index</div>
              <div>• <span className="text-indigo-300 font-bold">/crdt</span> - CRDT & Vector Clock Sync Mesh</div>
              <div>• <span className="text-teal-300 font-bold">/ebpf</span> - eBPF Kernel Packet Sandbox</div>
              <div>• <span className="text-sky-300 font-bold">/storage</span> - LSM-Tree Storage Engine</div>
              <div>• <span className="text-emerald-300 font-bold">/cache</span> - O(1) LRU Cache Visualizer</div>
              <div>• <span className="text-blue-300 font-bold">/ratelimit</span> - Token Bucket Rate Limiter</div>
            </div>
            <div className="text-[11px] text-zinc-500 pt-1">
              Type `goto /labs` or `goto &lt;slug&gt;` to run in browser.
            </div>
          </div>
        )
        break

      case "benchmark":
        const start = performance.now()
        let count = 0
        for (let i = 0; i < 100000; i++) {
          count += (i * 31) ^ (i >> 3)
        }
        const duration = performance.now() - start
        const ops = ((100000 / duration) * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })
        output = (
          <div className="space-y-1 font-mono text-xs text-emerald-300">
            <div className="font-bold">⚡ CPU Microbenchmark Complete:</div>
            <div>• Iterations: 100,000 arithmetic bitwise operations</div>
            <div>• Elapsed Time: {duration.toFixed(3)} ms</div>
            <div>• Throughput: {ops} ops/second</div>
            <div className="text-zinc-500 text-[11px]">Navigate to `/benchmark` for full multi-algorithm memory profiler.</div>
          </div>
        )
        break

      case "curl":
        if (args[0] === "health" || args[0] === "/api/health") {
          output = (
            <div className="bg-zinc-950 p-3 rounded border border-border/40 font-mono text-xs text-emerald-400">
              <pre>{JSON.stringify({
                status: "operational",
                timestamp: new Date().toISOString(),
                environment: "production",
                version: "2.4.0",
                subsystems: {
                  database: "active",
                  cdn_edge: "active",
                  consensus_engine: "active"
                }
              }, null, 2)}</pre>
            </div>
          )
        } else {
          output = <div className="text-amber-400 font-mono text-xs">Usage: `curl health` or `curl /api/health`</div>
        }
        break

      case "ping":
        const target = args[0] || "edge.dhananjay.dev"
        const latency = (Math.random() * 8 + 3).toFixed(1)
        output = (
          <div className="space-y-1 font-mono text-xs text-cyan-300">
            <div>PING {target} (104.21.48.1): 56 data bytes</div>
            <div>64 bytes from {target}: icmp_seq=1 ttl=58 time={latency} ms</div>
            <div>64 bytes from {target}: icmp_seq=2 ttl=58 time={(parseFloat(latency) + 0.3).toFixed(1)} ms</div>
            <div className="text-zinc-500">--- {target} ping statistics: 0% packet loss ---</div>
          </div>
        )
        break

      case "cat":
        const file = args[0]?.toLowerCase()
        if (file === "bio" || file === "bio.txt") {
          output = (
            <div className="text-zinc-300 font-mono text-xs leading-relaxed">
              Dhananjay Singh is a systems-focused software engineer with a deep passion for writing clean, high-performance, and verifiable code. He explores everything from low-level Linux kernel concepts and lock-free ring buffers to distributed consensus and high-throughput transactional ledgers.
            </div>
          )
        } else if (file === "contact" || file === "contact.txt") {
          output = (
            <div className="text-zinc-300 font-mono text-xs space-y-1">
              <div>Email: dhananjay6903@gmail.com</div>
              <div>GitHub: https://github.com/dhananjaysinghk</div>
              <div>LinkedIn: https://linkedin.com/in/dhananjaysinghk</div>
              <div>Twitter/X: @dhananjay_real</div>
            </div>
          )
        } else {
          output = <div className="text-amber-400 font-mono text-xs">File not found. Try: `cat bio` or `cat contact`</div>
        }
        break

      case "goto":
      case "cd":
        const dest = args[0]
        if (dest) {
          const route = dest.startsWith("/") ? dest : `/${dest}`
          output = <div className="text-emerald-400 font-mono text-xs">Redirecting to {route}...</div>
          setTimeout(() => router.push(route), 400)
        } else {
          output = <div className="text-amber-400 font-mono text-xs">Usage: `goto &lt;path&gt;` (e.g. `goto /labs`, `goto /projects`)</div>
        }
        break

      case "theme":
        const targetTheme = args[0]?.toLowerCase()
        if (targetTheme === "dark" || targetTheme === "light") {
          setTheme(targetTheme)
          output = <div className="text-emerald-400 font-mono text-xs">Theme switched to {targetTheme} mode.</div>
        } else {
          output = <div className="text-amber-400 font-mono text-xs">Usage: `theme dark` or `theme light`</div>
        }
        break

      case "matrix":
        output = (
          <div className="font-mono text-xs text-emerald-500 animate-pulse py-2">
            <div>01000100 01001000 01000001 01001110 01000001 01001110 01001010 01000001 01011001</div>
            <div>WAKE UP, NEO... THE MATRIX HAS YOU. FOLLOW THE WHITE RABBIT.</div>
            <div>01010011 01011001 01010011 01010100 01000101 01001101 01010011 00100001</div>
          </div>
        )
        break

      case "clear":
      case "cls":
        setHistory([])
        setInputVal("")
        return

      default:
        isError = true
        output = (
          <div className="text-rose-400 font-mono text-xs">
            command not found: <span className="font-bold">{cmd}</span>. Type <span className="text-emerald-400 font-semibold">&apos;help&apos;</span> for a list of commands.
          </div>
        )
    }

    setHistory((prev) => [
      ...prev,
      {
        id: itemId,
        command: trimmed,
        output,
        isError,
        timestamp,
      },
    ])
    setInputVal("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCommand(inputVal)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(nextIdx)
        setInputVal(commandHistory[nextIdx])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1
        if (nextIdx < commandHistory.length) {
          setHistoryIndex(nextIdx)
          setInputVal(commandHistory[nextIdx])
        } else {
          setHistoryIndex(-1)
          setInputVal("")
        }
      }
    }
  }

  return (
    <div
      onClick={focusInput}
      className={`rounded-2xl border border-border/50 bg-zinc-950 shadow-2xl backdrop-blur-md flex flex-col font-mono text-xs overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 h-[calc(100vh-2rem)]" : "w-full min-h-[520px] max-h-[640px]"
      }`}
    >
      {/* Top Terminal Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-zinc-900/90 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 border border-rose-600 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 border border-amber-600 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 border border-emerald-600 inline-block" />
          </div>
          <span className="text-zinc-400 font-bold ml-2 text-[11px] flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            dhananjay@systems-node:~ (zsh)
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setHistory([])
            }}
            className="p-1 hover:text-zinc-200 transition-colors"
            title="Clear output"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsFullscreen(!isFullscreen)
            }}
            className="p-1 hover:text-zinc-200 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Output Stream History */}
      <div
        ref={scrollRef}
        className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <span className="text-emerald-400 font-bold">➜</span>
                <span className="text-cyan-400 font-semibold">~</span>
                <span className="text-foreground font-mono">{item.command}</span>
                <span className="text-[10px] text-zinc-600 ml-auto">{item.timestamp}</span>
              </div>
            )}
            <div className="pl-4">{item.output}</div>
          </div>
        ))}
      </div>

      {/* Interactive Input Prompt Line */}
      <div className="p-3 border-t border-border/30 bg-zinc-900/60 flex items-center gap-2">
        <span className="text-emerald-400 font-bold text-sm">➜</span>
        <span className="text-cyan-400 font-semibold text-xs">~</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command (e.g. 'help', 'neofetch', 'labs', 'projects')..."
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-zinc-600 focus:outline-none font-mono"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={() => handleCommand(inputVal)}
          className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white text-[10px] flex items-center gap-1 border border-border/40 font-mono"
        >
          <CornerDownLeft className="h-3 w-3" />
          Run
        </button>
      </div>
    </div>
  )
}
