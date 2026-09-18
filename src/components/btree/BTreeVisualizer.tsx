"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderTree,
  Search,
  Plus,
  RefreshCw,
  Zap,
  ArrowRight,
  Database,
  Layers,
  ArrowLeftRight,
  Activity,
  CheckCircle2,
  Sliders,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

interface LeafNode {
  id: string
  keys: number[]
  isLeaf: true
}

interface InternalNode {
  id: string
  keys: number[]
  children: (InternalNode | LeafNode)[]
  isLeaf: false
}

type BTreeNode = InternalNode | LeafNode

export function BTreeVisualizer() {
  // Simple B+ tree demo model state
  // We'll maintain a 2-level or 3-level tree state with root, internal, and linked leaves
  const [rootKeys, setRootKeys] = useState<number[]>([30])
  const [leftLeaf, setLeftLeaf] = useState<number[]>([10, 20])
  const [rightLeaf, setRightLeaf] = useState<number[]>([30, 40, 50])

  const [inputKey, setInputKey] = useState("")
  const [searchTarget, setSearchTarget] = useState("")
  const [rangeMin, setRangeMin] = useState("15")
  const [rangeMax, setRangeMax] = useState("45")

  const [activeSearchPath, setActiveSearchPath] = useState<string[]>([])
  const [scannedKeys, setScannedKeys] = useState<number[]>([])
  const [splitCount, setSplitCount] = useState(2)
  const [logTrace, setLogTrace] = useState<string[]>([
    "B+ Tree Storage Index initialized. Order M=3 (Max 2 keys per page).",
  ])

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 12)])
  }

  // 1. Insert Operation
  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(inputKey, 10)
    if (isNaN(num)) return

    soundFx.playClick()
    const allKeys = Array.from(new Set([...leftLeaf, ...rightLeaf, num])).sort((a, b) => a - b)

    // Check if we need to split or rebalance
    if (allKeys.length <= 4) {
      const mid = Math.floor(allKeys.length / 2)
      setLeftLeaf(allKeys.slice(0, mid))
      setRightLeaf(allKeys.slice(mid))
      setRootKeys([allKeys[mid]])
      appendLog(`📝 INSERT(${num}): Key placed into leaf page without split.`)
    } else {
      soundFx.playChime()
      // Trigger page split
      const mid = Math.floor(allKeys.length / 2)
      const promoted = allKeys[mid]
      setLeftLeaf(allKeys.slice(0, mid))
      setRightLeaf(allKeys.slice(mid))
      setRootKeys([promoted])
      setSplitCount((s) => s + 1)
      appendLog(
        `🚨 PAGE OVERFLOW (M=3): Leaf split triggered! Promoted median key [${promoted}] to Root page.`
      )
    }

    setInputKey("")
  }

  // 2. Point Lookup Search(key)
  const handleSearch = () => {
    const num = parseInt(searchTarget, 10)
    if (isNaN(num)) return

    soundFx.playClick()
    setScannedKeys([])

    // Path resolution
    const rootPivot = rootKeys[0] || 30
    if (num < rootPivot) {
      setActiveSearchPath(["root", "left_leaf"])
      const found = leftLeaf.includes(num)
      if (found) {
        soundFx.playChime()
        appendLog(`🎯 POINT LOOKUP (${num}): Root [${num} < ${rootPivot}] -> Left Leaf -> FOUND! (2 Page Seeks).`)
      } else {
        soundFx.playToggle()
        appendLog(`❌ POINT LOOKUP (${num}): Root -> Left Leaf -> NOT FOUND (Key does not exist).`)
      }
    } else {
      setActiveSearchPath(["root", "right_leaf"])
      const found = rightLeaf.includes(num)
      if (found) {
        soundFx.playChime()
        appendLog(`🎯 POINT LOOKUP (${num}): Root [${num} >= ${rootPivot}] -> Right Leaf -> FOUND! (2 Page Seeks).`)
      } else {
        soundFx.playToggle()
        appendLog(`❌ POINT LOOKUP (${num}): Root -> Right Leaf -> NOT FOUND (Key does not exist).`)
      }
    }
  }

  // 3. Leaf Range Scan [min..max]
  const handleRangeScan = () => {
    const min = parseInt(rangeMin, 10) || 0
    const max = parseInt(rangeMax, 10) || 100

    soundFx.playChime()
    setActiveSearchPath(["left_leaf", "right_leaf"])

    const all = [...leftLeaf, ...rightLeaf].sort((a, b) => a - b)
    const matches = all.filter((k) => k >= min && k <= max)
    setScannedKeys(matches)

    appendLog(
      `⚡ RANGE SCAN [${min}..${max}]: Located first leaf via index probe, then executed horizontal leaf pointer walk. Found ${matches.length} records: [${matches.join(", ")}].`
    )
  }

  // 4. Reset
  const handleReset = () => {
    soundFx.playChime()
    setRootKeys([30])
    setLeftLeaf([10, 20])
    setRightLeaf([30, 40, 50])
    setActiveSearchPath([])
    setScannedKeys([])
    setSplitCount(2)
    setLogTrace(["B+ Tree index reset to initial 2-level balanced state."])
  }

  const allLeafKeys = [...leftLeaf, ...rightLeaf]

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
              <FolderTree className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Database B+ Tree Index & Leaf Scan Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates Postgres & InnoDB B+ Tree page allocation, median promotion splits, and O(log N + K) sequential leaf scans.
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="text-xs font-mono gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset State
          </Button>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-8 font-mono">
          {/* Controls: Insert, Point Search, Range Scan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form: Insert */}
            <div className="lg:col-span-4 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-amber-400" />
                Insert Key (Page Split Trigger)
              </span>

              <form onSubmit={handleInsert} className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Key (e.g. 25)"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="bg-card/40 border-border/40 text-xs font-mono"
                />
                <Button type="submit" size="sm" className="text-xs font-mono gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Insert
                </Button>
              </form>

              <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground pt-1">
                <span>Quick:</span>
                {[5, 15, 25, 35, 45, 60].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setInputKey(k.toString())
                    }}
                    className="px-1.5 py-0.5 rounded bg-card/60 border border-border/40 text-zinc-300 hover:text-foreground font-mono"
                  >
                    +{k}
                  </button>
                ))}
              </div>
            </div>

            {/* Form: Point Search */}
            <div className="lg:col-span-4 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-indigo-400" />
                Point Lookup Probe (O(log_B N))
              </span>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Search key (e.g. 40)"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  className="bg-card/40 border-border/40 text-xs font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
                <Button size="sm" onClick={handleSearch} className="text-xs font-mono gap-1">
                  <Search className="h-3.5 w-3.5" />
                  Find
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground pt-1">
                <span>Try:</span>
                {[10, 30, 50, 99].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSearchTarget(k.toString())
                    }}
                    className="px-1.5 py-0.5 rounded bg-card/60 border border-border/40 text-zinc-300 hover:text-foreground font-mono"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Form: Range Scan */}
            <div className="lg:col-span-4 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-400" />
                Horizontal Leaf Range Scan
              </span>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={rangeMin}
                  onChange={(e) => setRangeMin(e.target.value)}
                  className="bg-card/40 border-border/40 text-xs font-mono"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={rangeMax}
                  onChange={(e) => setRangeMax(e.target.value)}
                  className="bg-card/40 border-border/40 text-xs font-mono"
                />
              </div>

              <Button size="sm" onClick={handleRangeScan} className="w-full text-xs font-mono gap-1.5">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                Scan Range [BETWEEN]
              </Button>
            </div>
          </div>

          {/* ================= B+ TREE VISUAL ARCHITECTURE ================= */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col items-center gap-8 shadow-inner overflow-x-auto">
            {/* LEVEL 0: ROOT NODE */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                Level 0 (Root Page • 8KB Block)
              </span>

              <motion.div
                layout
                className={`rounded-xl border p-4 flex items-center gap-3 transition-colors ${
                  activeSearchPath.includes("root")
                    ? "border-indigo-500/80 bg-indigo-950/40 shadow-md shadow-indigo-500/20"
                    : "border-border/60 bg-card/40"
                }`}
              >
                <Badge variant="outline" className="text-[10px] bg-card/60 text-zinc-400">
                  ptr_left &lt; {rootKeys[0]}
                </Badge>
                {rootKeys.map((k) => (
                  <span key={k} className="text-base font-extrabold text-foreground px-2">
                    {k}
                  </span>
                ))}
                <Badge variant="outline" className="text-[10px] bg-card/60 text-zinc-400">
                  ptr_right &gt;= {rootKeys[0]}
                </Badge>
              </motion.div>
            </div>

            {/* Tree Branch Connectors */}
            <div className="w-full max-w-md flex justify-around text-zinc-600 text-xs select-none">
              <span>↙ [Child 0]</span>
              <span>↘ [Child 1]</span>
            </div>

            {/* LEVEL 1: LEAF NODES (Linked List) */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center justify-between w-full max-w-xl text-[10px] text-zinc-500 uppercase tracking-wider">
                <span>Leaf Page #1</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <ArrowLeftRight className="h-3 w-3" />
                  Bi-Directional Leaf Pointer Chain
                </span>
                <span>Leaf Page #2</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl">
                {/* Left Leaf Page */}
                <motion.div
                  layout
                  className={`grow rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
                    activeSearchPath.includes("left_leaf")
                      ? "border-emerald-500/80 bg-emerald-950/30 shadow-md shadow-emerald-500/20"
                      : "border-border/60 bg-card/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-border/20 pb-1">
                    <span>Keys: {leftLeaf.length}</span>
                    <span className="text-[9px]">PageID: 0x01</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {leftLeaf.map((k) => (
                      <Badge
                        key={k}
                        variant="outline"
                        className={`text-xs px-2 py-0.5 font-bold ${
                          scannedKeys.includes(k)
                            ? "bg-emerald-500/30 text-emerald-300 border-emerald-500"
                            : "bg-card/60 text-foreground"
                        }`}
                      >
                        {k}
                      </Badge>
                    ))}
                  </div>
                </motion.div>

                {/* Horizontal Pointer Arrow */}
                <div className="text-emerald-400 flex items-center gap-1 px-2 font-mono text-sm">
                  <ArrowRight className="h-4 w-4 animate-pulse" />
                </div>

                {/* Right Leaf Page */}
                <motion.div
                  layout
                  className={`grow rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
                    activeSearchPath.includes("right_leaf")
                      ? "border-emerald-500/80 bg-emerald-950/30 shadow-md shadow-emerald-500/20"
                      : "border-border/60 bg-card/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-border/20 pb-1">
                    <span>Keys: {rightLeaf.length}</span>
                    <span className="text-[9px]">PageID: 0x02</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {rightLeaf.map((k) => (
                      <Badge
                        key={k}
                        variant="outline"
                        className={`text-xs px-2 py-0.5 font-bold ${
                          scannedKeys.includes(k)
                            ? "bg-emerald-500/30 text-emerald-300 border-emerald-500"
                            : "bg-card/60 text-foreground"
                        }`}
                      >
                        {k}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Real-time Storage HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Total Index Keys</span>
              <span className="text-xl font-bold text-amber-400">{allLeafKeys.length}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Tree Depth (Height)</span>
              <span className="text-xl font-bold text-indigo-400">2 Levels</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Page Split Events</span>
              <span className="text-xl font-bold text-emerald-400">{splitCount}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Search IO Complexity</span>
              <span className="text-xs font-bold text-cyan-300 pt-1">O(log_B N) ~ 2 Seeks</span>
            </div>
          </div>

          {/* Index Event Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">B+ Tree Storage Engine Trace:</span>
              <span className="text-[9px] text-zinc-600 font-mono">Disk Buffer Pool</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-amber-300 font-bold" : "text-zinc-400 opacity-85"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
