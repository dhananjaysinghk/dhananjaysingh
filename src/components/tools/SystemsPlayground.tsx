"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Cpu, Network, Binary, ShieldCheck, Zap, RefreshCw, Layers, Sliders, Box, Trash2, Plus, Terminal, FileCode, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

type ToolTab = "cacheline" | "hashring" | "bitmask" | "arena" | "hexdump"

interface AllocationBlock {
  id: string
  name: string
  size: number
  offset: number
  color: string
}

const HEX_PRESETS = [
  {
    name: "gRPC Framed Stream Header",
    hex: "00 00 00 00 0a 08 01 12 04 6e 6f 76 61",
    desc: "Uncompressed 5-byte gRPC prefix (flags + length) + Protobuf tag/field data",
  },
  {
    name: "HTTP/1.1 Request Header",
    hex: "47 45 54 20 2f 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 64 68 61 6e 61 6e 6a 61 79 2e 64 65 76 0d 0a 0d 0a",
    desc: "Standard raw ASCII wire representation of GET / HTTP/1.1 CRLF Host: dhananjay.dev",
  },
  {
    name: "DNS Wire Query Packet",
    hex: "aa bb 01 00 00 01 00 00 00 00 00 00 09 64 68 61 6e 61 6e 6a 61 79 03 64 65 76 00 00 01 00 01",
    desc: "Standard RFC 1035 UDP query for A record of dhananjay.dev",
  },
]

export function SystemsPlayground() {
  const [activeTab, setActiveTab] = useState<ToolTab>("cacheline")

  // Cache Line State
  const [isPadded, setIsPadded] = useState(false)
  const [core1Writes, setCore1Writes] = useState(0)
  const [core2Writes, setCore2Writes] = useState(0)

  // Hash Ring State
  const [nodes, setNodes] = useState<string[]>(["Node Alpha (0°)", "Node Beta (120°)", "Node Gamma (240°)"])
  const [testKey, setTestKey] = useState("user_session_9921")

  // Bitmask State
  const [flags, setFlags] = useState({
    READ: true,
    WRITE: true,
    EXEC: false,
    ADMIN: false,
  })

  // Arena Allocator State (512 Bytes Total Buffer)
  const TOTAL_ARENA_CAPACITY = 512
  const [allocations, setAllocations] = useState<AllocationBlock[]>([
    { id: "b-1", name: "TxHeader (64B)", size: 64, offset: 0, color: "bg-indigo-500" },
    { id: "b-2", name: "PayloadBuf (128B)", size: 128, offset: 64, color: "bg-purple-500" },
  ])

  // Hex Dump State
  const [rawHexInput, setRawHexInput] = useState(HEX_PRESETS[0].hex)

  // 1. Cache line increment
  const handleCoreWrite = (core: 1 | 2) => {
    soundFx.playClick()
    if (core === 1) setCore1Writes((p) => p + 1)
    else setCore2Writes((p) => p + 1)
  }

  // 2. Hash Ring Node toggle
  const toggleNode = () => {
    soundFx.playToggle()
    if (nodes.length === 3) {
      setNodes([...nodes, "Node Delta (300°)"])
    } else {
      setNodes(nodes.slice(0, 3))
    }
  }

  // 3. Bitmask flag toggle
  const toggleFlag = (flag: keyof typeof flags) => {
    soundFx.playClick()
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))
  }

  // 4. Arena Allocator Actions
  const currentArenaOffset = allocations.reduce((acc, curr) => acc + curr.size, 0)

  const handleAllocate = (name: string, size: number, color: string) => {
    if (currentArenaOffset + size > TOTAL_ARENA_CAPACITY) {
      soundFx.playToggle()
      return
    }
    soundFx.playClick()
    const newBlock: AllocationBlock = {
      id: `alloc-${Date.now()}`,
      name: `${name} (${size}B)`,
      size,
      offset: currentArenaOffset,
      color,
    }
    setAllocations((prev) => [...prev, newBlock])
  }

  const handleResetArena = () => {
    soundFx.playChime()
    setAllocations([])
  }

  // Parse Hex Bytes into 16-byte lines
  const parsedBytes = React.useMemo(() => {
    const cleaned = rawHexInput.replace(/[^0-9a-fA-F]/g, "")
    const bytes: number[] = []
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(parseInt(cleaned.substr(i, 2), 16) || 0)
    }
    return bytes
  }, [rawHexInput])

  // Format Hex Dump Rows (16 bytes each)
  const hexDumpRows = React.useMemo(() => {
    const rows: { offset: string; hex: string; ascii: string }[] = []
    for (let i = 0; i < parsedBytes.length; i += 16) {
      const chunk = parsedBytes.slice(i, i + 16)
      const offset = i.toString(16).padStart(8, "0")
      const hexPart = chunk
        .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
        .join(" ")
        .padEnd(48, " ")
      const asciiPart = chunk
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
        .join("")

      rows.push({ offset, hex: hexPart, ascii: asciiPart })
    }
    return rows
  }, [parsedBytes])

  // Calculate bitmask integer
  const bitmaskValue =
    (flags.READ ? 1 : 0) |
    (flags.WRITE ? 2 : 0) |
    (flags.EXEC ? 4 : 0) |
    (flags.ADMIN ? 8 : 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-border/30 pb-4">
        {[
          { id: "cacheline", label: "CPU Cache & False Sharing", icon: Cpu },
          { id: "hashring", label: "Consistent Hash Ring", icon: Network },
          { id: "bitmask", label: "Bitwise Flags & Bitmasks", icon: Binary },
          { id: "arena", label: "Arena & Bump Memory Allocator", icon: Box },
          { id: "hexdump", label: "Binary Hex Dump & Packet Decoder", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => {
                soundFx.playToggle()
                setActiveTab(tab.id as ToolTab)
              }}
              className={`text-xs font-mono gap-2 ${
                !isActive ? "border-border/40 text-muted-foreground" : ""
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Tab 1: CPU Cache Line & False Sharing Simulator */}
      {activeTab === "cacheline" && (
        <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-base font-bold text-foreground">
                  64-Byte L1 CPU Cache Line Coherency
                </CardTitle>
                <span className="text-xs text-muted-foreground font-sans">
                  Demonstrates false sharing cache line invalidations across concurrent threads.
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant={isPadded ? "default" : "outline"}
              onClick={() => {
                soundFx.playChime()
                setIsPadded(!isPadded)
              }}
              className="text-xs font-mono gap-2 self-start sm:self-auto"
            >
              <Layers className="h-3.5 w-3.5" />
              {isPadded ? "Padding Active (align(64))" : "Unpadded (False Sharing Risk)"}
            </Button>
          </CardHeader>

          <CardContent className="pt-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border/30 bg-card/20 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-indigo-400 font-bold">
                    CPU Core #0 (Thread A)
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Writes: {core1Writes}
                  </Badge>
                </div>
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-4 font-mono text-xs flex flex-col gap-1">
                  <span className="text-muted-foreground">Cache Line Address: 0x7FFF00</span>
                  <span className="text-foreground font-semibold">Atomic Counter A: {core1Writes}</span>
                </div>
                <Button size="sm" onClick={() => handleCoreWrite(1)} className="text-xs font-mono">
                  Mutate Counter A
                </Button>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/20 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-purple-400 font-bold">
                    CPU Core #1 (Thread B)
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Writes: {core2Writes}
                  </Badge>
                </div>
                <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4 font-mono text-xs flex flex-col gap-1">
                  <span className="text-muted-foreground">
                    Cache Line Address: {isPadded ? "0x7FFF40 (Distinct Line)" : "0x7FFF08 (Same Line!)"}
                  </span>
                  <span className="text-foreground font-semibold">Atomic Counter B: {core2Writes}</span>
                </div>
                <Button size="sm" onClick={() => handleCoreWrite(2)} className="text-xs font-mono">
                  Mutate Counter B
                </Button>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border text-xs font-mono leading-relaxed ${
                isPadded
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              {isPadded ? (
                <>
                  <span className="font-bold">✅ Zero False Sharing:</span> Variables are padded to separate 64-byte cache lines. L1 caches update concurrently with zero MESI invalidation bus snooping.
                </>
              ) : (
                <>
                  <span className="font-bold">⚠️ False Sharing Hazard:</span> Both variables share the same 64-byte line (0x7FFF00). Every write by Core 0 forces the CPU MESI protocol to invalidate Core 1&apos;s L1 cache line!
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Consistent Hash Ring */}
      {activeTab === "hashring" && (
        <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <Network className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-base font-bold text-foreground">
                  Consistent Hash Ring Sharding
                </CardTitle>
                <span className="text-xs text-muted-foreground font-sans">
                  Distributes keys uniformly across virtual server nodes with minimal remapping.
                </span>
              </div>
            </div>

            <Button size="sm" onClick={toggleNode} className="text-xs font-mono gap-2 self-start sm:self-auto">
              <RefreshCw className="h-3.5 w-3.5" />
              {nodes.length === 3 ? "Add Node Delta (+1)" : "Remove Node Delta (-1)"}
            </Button>
          </CardHeader>

          <CardContent className="pt-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nodes.map((node, i) => (
                <div key={i} className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Cluster Node</span>
                  <span className="font-mono text-sm font-bold text-foreground">{node}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Capacity: ~{(100 / nodes.length).toFixed(1)}%</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/30 bg-zinc-950 p-4 font-mono text-xs flex flex-col gap-2">
              <span className="text-zinc-400 text-[10px] uppercase">Lookup Simulation:</span>
              <p className="text-zinc-200">
                Key <span className="text-emerald-400">&quot;{testKey}&quot;</span> (Hash: 0x8A4F) routes clockwise to:{" "}
                <span className="font-bold text-primary">{nodes[0]}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Bitwise Mask Engine */}
      {activeTab === "bitmask" && (
        <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
          <CardHeader className="flex items-center gap-2.5 border-b border-border/20 pb-4">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
              <Binary className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Bitwise Flag & Permission Mask Engine
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Interactive compact integer bitmask operations (Unix chmod / capabilities).
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6 flex flex-col gap-6 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: "READ", label: "READ (0b0001 = 1)", desc: "Read access" },
                { key: "WRITE", label: "WRITE (0b0010 = 2)", desc: "Write access" },
                { key: "EXEC", label: "EXEC (0b0100 = 4)", desc: "Execute access" },
                { key: "ADMIN", label: "ADMIN (0b1000 = 8)", desc: "Superuser root" },
              ].map((item) => {
                const k = item.key as keyof typeof flags
                const enabled = flags[k]
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleFlag(k)}
                    className={`rounded-xl border p-4 text-left flex flex-col gap-1 transition-all ${
                      enabled
                        ? "border-primary/60 bg-primary/10 shadow-sm"
                        : "border-border/30 bg-card/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span className="font-bold text-foreground">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    <span className={`text-[10px] font-bold mt-1 ${enabled ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {enabled ? "[ACTIVE 1]" : "[INACTIVE 0]"}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="rounded-xl border border-border/40 bg-zinc-950 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-zinc-500">Binary Mask</span>
                <span className="text-lg font-bold text-purple-400">0b{bitmaskValue.toString(2).padStart(4, "0")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-zinc-500">Decimal (Int)</span>
                <span className="text-lg font-bold text-emerald-400">{bitmaskValue}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-zinc-500">Hexadecimal</span>
                <span className="text-lg font-bold text-indigo-400">0x{bitmaskValue.toString(16).toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-zinc-500">Unix Octal</span>
                <span className="text-lg font-bold text-amber-400">0o{bitmaskValue.toString(8)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Arena & Bump Memory Allocator */}
      {activeTab === "arena" && (
        <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <Box className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-base font-bold text-foreground">
                  Contiguous Arena & Bump Allocator Simulator
                </CardTitle>
                <span className="text-xs text-muted-foreground font-sans">
                  Simulates zero-fragmentation O(1) pointer bump allocation and instant linear buffer resets.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetArena}
                className="text-xs font-mono gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Reset Arena (O(1) Rewind)
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleAllocate("Header", 64, "bg-indigo-500")}
                className="text-xs font-mono gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                + Alloc 64B Struct
              </Button>
              <Button
                size="sm"
                onClick={() => handleAllocate("Packet", 128, "bg-purple-500")}
                className="text-xs font-mono gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                + Alloc 128B Packet
              </Button>
              <Button
                size="sm"
                onClick={() => handleAllocate("LargePayload", 256, "bg-emerald-500")}
                className="text-xs font-mono gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                + Alloc 256B Payload
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>0x000 (Start)</span>
                <span className="text-foreground font-bold">
                  {currentArenaOffset} / {TOTAL_ARENA_CAPACITY} Bytes Used ({((currentArenaOffset / TOTAL_ARENA_CAPACITY) * 100).toFixed(0)}%)
                </span>
                <span>0x200 (512B Cap)</span>
              </div>

              <div className="relative h-12 w-full rounded-xl border border-border/40 bg-zinc-950 p-1 flex overflow-hidden shadow-inner">
                {allocations.map((block) => {
                  const widthPercent = (block.size / TOTAL_ARENA_CAPACITY) * 100
                  return (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      style={{ width: `${widthPercent}%` }}
                      className={`h-full ${block.color} opacity-90 border-r border-black/40 flex items-center justify-center text-[10px] font-mono font-bold text-white px-1 truncate`}
                      title={`${block.name} @ offset +${block.offset}B`}
                    >
                      {block.name}
                    </motion.div>
                  )
                })}
                {currentArenaOffset < TOTAL_ARENA_CAPACITY && (
                  <div
                    style={{ width: `${((TOTAL_ARENA_CAPACITY - currentArenaOffset) / TOTAL_ARENA_CAPACITY) * 100}%` }}
                    className="h-full bg-zinc-900/40 flex items-center justify-center text-[10px] font-mono text-zinc-600 italic"
                  >
                    Unallocated Free Space
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/30 bg-card/20 p-4 font-mono text-xs text-muted-foreground leading-relaxed flex flex-col gap-1">
              <span className="font-bold text-foreground">💡 Why High-Frequency Systems Use Arena Bump Allocation:</span>
              <span>
                Standard <code className="text-primary font-bold">malloc()</code> invokes kernel syscalls and causes heap fragmentation. A Bump Allocator allocates memory in <code className="text-emerald-400 font-bold">O(1)</code> time simply by incrementing an offset pointer by N bytes, and frees all memory instantly by resetting the pointer to zero.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Binary Hex Dump & Protocol Packet Inspector */}
      {activeTab === "hexdump" && (
        <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-base font-bold text-foreground">
                  Binary Hex Dump & Protocol Packet Decoder
                </CardTitle>
                <span className="text-xs text-muted-foreground font-sans">
                  Inspect raw binary byte arrays with 16-byte offset alignment and ASCII translation.
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 flex flex-col gap-6 font-mono text-xs">
            {/* Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase text-muted-foreground font-bold">
                Load Sample Protocol Payload:
              </span>
              <div className="flex flex-wrap gap-2">
                {HEX_PRESETS.map((p) => (
                  <Button
                    key={p.name}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      soundFx.playClick()
                      setRawHexInput(p.hex)
                    }}
                    className="text-xs font-mono border-border/30 text-muted-foreground hover:text-foreground"
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-muted-foreground font-bold">
                Raw Hex Input Bytes (Space or contiguous hex):
              </label>
              <textarea
                rows={2}
                value={rawHexInput}
                onChange={(e) => setRawHexInput(e.target.value)}
                className="w-full rounded-xl border border-border/40 bg-zinc-950 p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Paste hex bytes e.g. 48 65 6c 6c 6f ..."
              />
            </div>

            {/* Hex Dump Output Box */}
            <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] text-zinc-500 uppercase">
                <span>Offset (Hex)</span>
                <span>Hexadecimal Byte Representation (0-15)</span>
                <span>ASCII Translation</span>
              </div>

              <div className="space-y-1 font-mono text-xs overflow-x-auto">
                {hexDumpRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 text-zinc-300">
                    <span className="col-span-2 text-zinc-500 select-none">{row.offset}:</span>
                    <span className="col-span-7 text-indigo-400 font-semibold tracking-wide">{row.hex}</span>
                    <span className="col-span-3 text-emerald-400 font-bold">{row.ascii}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-zinc-300">
              <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase text-zinc-500">Payload Size</span>
                <span className="text-lg font-bold text-foreground">{parsedBytes.length} Bytes</span>
              </div>
              <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase text-zinc-500">Bit Stream</span>
                <span className="text-lg font-bold text-purple-400">{parsedBytes.length * 8} Bits</span>
              </div>
              <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase text-zinc-500">Aligned Memory</span>
                <span className="text-lg font-bold text-emerald-400">
                  {Math.ceil(parsedBytes.length / 16) * 16} Bytes (16B Padded)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
