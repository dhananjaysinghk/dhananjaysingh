"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  HardDrive,
  Cpu,
  Layers,
  ArrowDown,
  RefreshCw,
  Plus,
  Trash2,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  AlertCircle,
  Play,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

interface KeyValueEntry {
  key: string
  value: string
  isTombstone?: boolean
  timestamp: number
}

interface SSTable {
  id: string
  level: number
  keyRange: [string, string]
  entries: KeyValueEntry[]
  bloomFilterKeys: string[]
  createdAt: number
}

const INITIAL_MEMTABLE: KeyValueEntry[] = [
  { key: "user:101", value: "Dhananjay", timestamp: 100 },
  { key: "user:105", value: "Alice", timestamp: 101 },
]

const INITIAL_L0_SSTABLES: SSTable[] = [
  {
    id: "sst_l0_1",
    level: 0,
    keyRange: ["user:100", "user:108"],
    entries: [
      { key: "user:100", value: "Root_Admin", timestamp: 80 },
      { key: "user:104", value: "Bob_V1", timestamp: 85 },
      { key: "user:108", value: "Charlie", timestamp: 90 },
    ],
    bloomFilterKeys: ["user:100", "user:104", "user:108"],
    createdAt: 90,
  },
  {
    id: "sst_l0_2",
    level: 0,
    keyRange: ["user:102", "user:104"],
    entries: [
      { key: "user:102", value: "David", timestamp: 92 },
      { key: "user:104", value: "Bob_V2_Updated", timestamp: 95 },
    ],
    bloomFilterKeys: ["user:102", "user:104"],
    createdAt: 95,
  },
]

const INITIAL_L1_SSTABLES: SSTable[] = [
  {
    id: "sst_l1_1",
    level: 1,
    keyRange: ["user:001", "user:099"],
    entries: [
      { key: "user:010", value: "Legacy_Eve", timestamp: 40 },
      { key: "user:050", value: "Legacy_Frank", timestamp: 50 },
    ],
    bloomFilterKeys: ["user:010", "user:050"],
    createdAt: 50,
  },
]

export function LsmTreeVisualizer() {
  const [memTable, setMemTable] = useState<KeyValueEntry[]>(INITIAL_MEMTABLE)
  const [walLogs, setWalLogs] = useState<string[]>([
    "WAL: [ts=100] PUT user:101 => Dhananjay",
    "WAL: [ts=101] PUT user:105 => Alice",
  ])
  const [l0Tables, setL0Tables] = useState<SSTable[]>(INITIAL_L0_SSTABLES)
  const [l1Tables, setL1Tables] = useState<SSTable[]>(INITIAL_L1_SSTABLES)

  // Input states
  const [inputKey, setInputKey] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [searchKey, setSearchKey] = useState("")

  // Telemetry & Logs
  const [logTrace, setLogTrace] = useState<string[]>([
    "LSM Storage Engine initialized. MemTable (RAM) ready; WAL log synced.",
  ])
  const [stats, setStats] = useState({
    writes: 4,
    flushes: 2,
    compactions: 0,
    tombstonesPurged: 0,
  })

  const MEMTABLE_CAPACITY = 4

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 14)])
  }

  // Helper to sort entries by key alphabetically
  const sortEntries = (entries: KeyValueEntry[]) => {
    return [...entries].sort((a, b) => a.key.localeCompare(b.key))
  }

  // 1. PUT Operation (Insert/Update)
  const handlePut = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputKey.trim()) return

    soundFx.playClick()
    const key = inputKey.trim()
    const value = inputValue.trim() || "{ active: true }"
    const now = Date.now()

    const newEntry: KeyValueEntry = { key, value, timestamp: now }
    const walEntry = `WAL: [ts=${now.toString().slice(-4)}] PUT ${key} => ${value}`

    setWalLogs((prev) => [walEntry, ...prev.slice(0, 7)])

    // Update Memtable (Replace if exists, else append & sort)
    let updatedMem = memTable.filter((e) => e.key !== key)
    updatedMem.push(newEntry)
    updatedMem = sortEntries(updatedMem)

    setStats((prev) => ({ ...prev, writes: prev.writes + 1 }))
    appendLog(`📝 PUT("${key}", "${value}") written to WAL & MemTable (O(log N)).`)

    // Check if auto-flush needed
    if (updatedMem.length >= MEMTABLE_CAPACITY) {
      flushMemTableToL0(updatedMem)
    } else {
      setMemTable(updatedMem)
    }

    setInputKey("")
    setInputValue("")
  }

  // 2. DELETE Operation (Tombstone insertion)
  const handleDelete = () => {
    if (!inputKey.trim()) return
    soundFx.playToggle()
    const key = inputKey.trim()
    const now = Date.now()

    const tombstoneEntry: KeyValueEntry = {
      key,
      value: "TOMBSTONE",
      isTombstone: true,
      timestamp: now,
    }
    const walEntry = `WAL: [ts=${now.toString().slice(-4)}] DELETE (TOMBSTONE) ${key}`

    setWalLogs((prev) => [walEntry, ...prev.slice(0, 7)])

    let updatedMem = memTable.filter((e) => e.key !== key)
    updatedMem.push(tombstoneEntry)
    updatedMem = sortEntries(updatedMem)

    setStats((prev) => ({ ...prev, writes: prev.writes + 1 }))
    appendLog(`☠️ DELETE("${key}") appended tombstone marker to MemTable.`)

    if (updatedMem.length >= MEMTABLE_CAPACITY) {
      flushMemTableToL0(updatedMem)
    } else {
      setMemTable(updatedMem)
    }

    setInputKey("")
    setInputValue("")
  }

  // 3. FLUSH MemTable to L0 SSTable
  const flushMemTableToL0 = (tableToFlush?: KeyValueEntry[]) => {
    const data = tableToFlush || memTable
    if (data.length === 0) return

    soundFx.playChime()
    const sorted = sortEntries(data)
    const minKey = sorted[0].key
    const maxKey = sorted[sorted.length - 1].key

    const newSSTable: SSTable = {
      id: `sst_l0_${Date.now().toString().slice(-4)}`,
      level: 0,
      keyRange: [minKey, maxKey],
      entries: sorted,
      bloomFilterKeys: sorted.map((e) => e.key),
      createdAt: Date.now(),
    }

    setL0Tables((prev) => [newSSTable, ...prev])
    setMemTable([])
    setStats((prev) => ({ ...prev, flushes: prev.flushes + 1 }))
    appendLog(
      `⚡ FLUSH: MemTable frozen into immutable SSTable [${newSSTable.id}] (Keys: ${minKey}..${maxKey}) on Level 0.`
    )
  }

  // 4. POINT LOOKUP GET(key)
  const handleGet = (lookupKeyOverride?: string) => {
    const key = (lookupKeyOverride || searchKey).trim()
    if (!key) return

    soundFx.playClick()
    appendLog(`🔍 GET("${key}") initiating multi-tier storage probe...`)

    // Step A: Check Active MemTable
    const inMem = memTable.find((e) => e.key === key)
    if (inMem) {
      if (inMem.isTombstone) {
        soundFx.playToggle()
        appendLog(`❌ RESULT: Key "${key}" found in MemTable as TOMBSTONE (Deleted).`)
      } else {
        soundFx.playChime()
        appendLog(`🎯 HIT (0.1ms RAM): Found in active MemTable => "${inMem.value}"`)
      }
      return
    }

    // Step B: Check Level 0 SSTables (Newest to Oldest)
    for (const sst of l0Tables) {
      // 1. Bloom Filter Check
      const inBloom = sst.bloomFilterKeys.includes(key)
      if (!inBloom) {
        appendLog(`🛡️ BloomFilter [${sst.id}]: Negative (Skipping disk block scan).`)
        continue
      }

      appendLog(`✨ BloomFilter [${sst.id}]: Positive match. Scanning SSTable block index...`)
      const found = sst.entries.find((e) => e.key === key)
      if (found) {
        if (found.isTombstone) {
          soundFx.playToggle()
          appendLog(`❌ RESULT: Key "${key}" found in L0 [${sst.id}] as TOMBSTONE (Deleted).`)
        } else {
          soundFx.playChime()
          appendLog(`🎯 HIT (1.2ms Disk L0): Found in [${sst.id}] => "${found.value}"`)
        }
        return
      }
    }

    // Step C: Check Level 1 SSTables
    for (const sst of l1Tables) {
      const inRange = key >= sst.keyRange[0] && key <= sst.keyRange[1]
      if (!inRange) continue

      const inBloom = sst.bloomFilterKeys.includes(key)
      if (!inBloom) continue

      const found = sst.entries.find((e) => e.key === key)
      if (found) {
        if (found.isTombstone) {
          soundFx.playToggle()
          appendLog(`❌ RESULT: Key "${key}" found in L1 [${sst.id}] as TOMBSTONE (Deleted).`)
        } else {
          soundFx.playChime()
          appendLog(`🎯 HIT (3.5ms Disk L1): Found in [${sst.id}] => "${found.value}"`)
        }
        return
      }
    }

    soundFx.playToggle()
    appendLog(`❌ 404 NOT FOUND: Key "${key}" does not exist in any storage layer.`)
  }

  // 5. TRIGGER COMPACTION (Merge L0 -> L1)
  const handleCompaction = () => {
    if (l0Tables.length === 0) {
      appendLog("⚠️ No Level 0 SSTables available to compact.")
      return
    }

    soundFx.playChime()

    // Aggregate all entries from L0 and L1
    const allL0Entries = l0Tables.flatMap((t) => t.entries)
    const allL1Entries = l1Tables.flatMap((t) => t.entries)
    const combined = [...allL0Entries, ...allL1Entries]

    // Sort by timestamp descending so newer versions win
    combined.sort((a, b) => b.timestamp - a.timestamp)

    // Deduplicate by key keeping newest timestamp
    const deduplicatedMap = new Map<string, KeyValueEntry>()
    let tombstonesEliminated = 0

    combined.forEach((entry) => {
      if (!deduplicatedMap.has(entry.key)) {
        if (entry.isTombstone) {
          tombstonesEliminated++
        } else {
          deduplicatedMap.set(entry.key, entry)
        }
      }
    })

    const finalEntries = sortEntries(Array.from(deduplicatedMap.values()))

    // Split into partitioned L1 SSTables (e.g. 3 entries per table)
    const newL1Tables: SSTable[] = []
    const chunkSize = 3
    for (let i = 0; i < finalEntries.length; i += chunkSize) {
      const chunk = finalEntries.slice(i, i + chunkSize)
      newL1Tables.push({
        id: `sst_l1_c${i / chunkSize + 1}`,
        level: 1,
        keyRange: [chunk[0].key, chunk[chunk.length - 1].key],
        entries: chunk,
        bloomFilterKeys: chunk.map((e) => e.key),
        createdAt: Date.now(),
      })
    }

    setL0Tables([])
    setL1Tables(newL1Tables)
    setStats((prev) => ({
      ...prev,
      compactions: prev.compactions + 1,
      tombstonesPurged: prev.tombstonesPurged + tombstonesEliminated,
    }))

    appendLog(
      `🧹 COMPACTION COMPLETE: Merged ${l0Tables.length} L0 SSTables into ${newL1Tables.length} non-overlapping L1 SSTables. Purged ${tombstonesEliminated} tombstones & obsolete versions.`
    )
  }

  // 6. RESET
  const handleReset = () => {
    soundFx.playChime()
    setMemTable(INITIAL_MEMTABLE)
    setWalLogs([
      "WAL: [ts=100] PUT user:101 => Dhananjay",
      "WAL: [ts=101] PUT user:105 => Alice",
    ])
    setL0Tables(INITIAL_L0_SSTABLES)
    setL1Tables(INITIAL_L1_SSTABLES)
    setLogTrace(["Storage Engine reset to initial state."])
    setStats({ writes: 4, flushes: 2, compactions: 0, tombstonesPurged: 0 })
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      {/* Main Architecture Container */}
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                LSM-Tree Storage Engine & Compaction Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Interactive write-ahead log (WAL), in-memory MemTable, SSTables, Bloom filters, and Leveled Compaction.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="text-xs font-mono gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset State
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-8">
          {/* Controls: Write Form & Query Search */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form: Write / Delete */}
            <div className="lg:col-span-7 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                  Write Path: PUT / DELETE Operation
                </span>
                <span className="text-[10px] text-zinc-500">
                  MemTable Limit: {memTable.length} / {MEMTABLE_CAPACITY}
                </span>
              </div>

              <form onSubmit={handlePut} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4 space-y-1">
                  <Input
                    placeholder="Key (e.g. user:109)"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="bg-card/40 border-border/40 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <Input
                    placeholder="Value payload"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-card/40 border-border/40 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-3 flex gap-1.5">
                  <Button type="submit" size="sm" className="grow text-xs font-mono gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    PUT
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="text-xs font-mono px-2.5"
                    title="Insert Tombstone (Delete)"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => flushMemTableToL0()}
                  disabled={memTable.length === 0}
                  className="font-mono text-[10px] gap-1"
                >
                  <ArrowDown className="h-3 w-3 text-amber-400" />
                  Force Flush to L0
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCompaction}
                  disabled={l0Tables.length === 0}
                  className="font-mono text-[10px] gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20"
                >
                  <Flame className="h-3 w-3 text-emerald-400" />
                  Trigger L0→L1 Compaction
                </Button>
              </div>
            </div>

            {/* Form: Point Lookup GET */}
            <div className="lg:col-span-5 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-emerald-400" />
                Read Path: Multi-Tier Point Lookup
              </span>

              <div className="flex gap-2">
                <Input
                  placeholder="Lookup key (e.g. user:104)"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="bg-card/40 border-border/40 text-xs font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleGet()
                    }
                  }}
                />
                <Button size="sm" onClick={() => handleGet()} className="text-xs font-mono gap-1">
                  <Search className="h-3.5 w-3.5" />
                  GET
                </Button>
              </div>

              {/* Preset test keys */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-muted-foreground">
                <span>Try keys:</span>
                {["user:101", "user:104", "user:108", "user:050", "unknown:99"].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSearchKey(k)
                      handleGet(k)
                    }}
                    className="px-1.5 py-0.5 rounded bg-card/60 border border-border/40 hover:text-foreground text-zinc-300 font-mono transition-colors"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= ARCHITECTURE DIAGRAM ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* VOLATILE RAM TIER: WAL + MemTable */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" />
                  Volatile RAM & Append Log
                </span>
                <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                  Low Latency (~0.1ms)
                </Badge>
              </div>

              {/* Active MemTable */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    MemTable (In-Memory SkipList)
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {memTable.length} / {MEMTABLE_CAPACITY} Slots
                  </Badge>
                </div>

                {memTable.length === 0 ? (
                  <div className="py-6 text-center text-zinc-500 text-[11px] border border-dashed border-border/30 rounded-lg">
                    MemTable is empty. Insert a key above.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {memTable.map((entry) => (
                      <div
                        key={entry.key}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                          entry.isTombstone
                            ? "bg-red-950/30 border-red-500/40 text-red-300"
                            : "bg-card/40 border-border/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{entry.key}</span>
                          <span className="text-muted-foreground text-[10px]">
                            {entry.isTombstone ? "☠️ [TOMBSTONE]" : `"${entry.value}"`}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500">ts:{entry.timestamp.toString().slice(-4)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Write-Ahead Log (WAL) */}
              <div className="rounded-xl border border-border/30 bg-card/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
                    Write-Ahead Log (WAL.log)
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">Append-Only</span>
                </div>
                <div className="space-y-1 bg-zinc-950 p-2.5 rounded-lg border border-border/30 font-mono text-[10px] text-zinc-400 max-h-32 overflow-y-auto">
                  {walLogs.map((log, i) => (
                    <div key={i} className="truncate text-zinc-300">
                      {`> ${log}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PERSISTENT DISK TIER: SSTables (L0 & L1) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4" />
                  Persistent Disk Storage (SSTables)
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                  Immutable Sorted Runs
                </Badge>
              </div>

              {/* Level 0 SSTables (May have overlapping keys) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    Level 0 (Uncompacted Flushes • Overlapping Key Ranges Allowed)
                  </span>
                  <span className="text-[10px] text-zinc-500">{l0Tables.length} Tables</span>
                </div>

                {l0Tables.length === 0 ? (
                  <div className="py-4 text-center text-zinc-500 text-[11px] border border-dashed border-border/30 rounded-lg">
                    Level 0 is clean. No uncompacted SSTables.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {l0Tables.map((sst) => (
                      <div
                        key={sst.id}
                        className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3 flex flex-col justify-between gap-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs">{sst.id}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-300">
                            {sst.keyRange[0]}..{sst.keyRange[1]}
                          </Badge>
                        </div>

                        {/* Bloom filter badge */}
                        <div className="flex items-center gap-1 text-[9px] text-zinc-400 bg-card/40 px-2 py-1 rounded border border-border/20">
                          <Filter className="h-3 w-3 text-indigo-400" />
                          <span>Bloom: [{sst.bloomFilterKeys.join(", ")}]</span>
                        </div>

                        {/* Entries */}
                        <div className="space-y-1">
                          {sst.entries.map((entry) => (
                            <div
                              key={entry.key}
                              className="flex items-center justify-between text-[10px] bg-card/25 px-1.5 py-0.5 rounded"
                            >
                              <span className="text-zinc-200 font-semibold">{entry.key}</span>
                              <span className="text-zinc-400 truncate max-w-30">
                                {entry.isTombstone ? "☠️ TOMBSTONE" : entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Level 1 SSTables (Partitioned, Non-overlapping keys) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    Level 1 (Compacted & Partitioned • Strict Non-Overlapping Ranges)
                  </span>
                  <span className="text-[10px] text-zinc-500">{l1Tables.length} Tables</span>
                </div>

                {l1Tables.length === 0 ? (
                  <div className="py-4 text-center text-zinc-500 text-[11px] border border-dashed border-border/30 rounded-lg">
                    Level 1 is empty. Trigger compaction above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {l1Tables.map((sst) => (
                      <div
                        key={sst.id}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3 flex flex-col justify-between gap-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs">{sst.id}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-300">
                            {sst.keyRange[0]}..{sst.keyRange[1]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-zinc-400 bg-card/40 px-2 py-1 rounded border border-border/20">
                          <Filter className="h-3 w-3 text-emerald-400" />
                          <span>Bloom: [{sst.bloomFilterKeys.join(", ")}]</span>
                        </div>

                        <div className="space-y-1">
                          {sst.entries.map((entry) => (
                            <div
                              key={entry.key}
                              className="flex items-center justify-between text-[10px] bg-card/25 px-1.5 py-0.5 rounded"
                            >
                              <span className="text-zinc-200 font-semibold">{entry.key}</span>
                              <span className="text-zinc-400 truncate max-w-30">
                                {entry.isTombstone ? "☠️ TOMBSTONE" : entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Storage Engine HUD Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Cumulative Writes</span>
              <span className="text-xl font-bold text-indigo-400">{stats.writes}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Disk Flushes (L0)</span>
              <span className="text-xl font-bold text-amber-400">{stats.flushes}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Compaction Runs</span>
              <span className="text-xl font-bold text-emerald-400">{stats.compactions}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Tombstones Purged</span>
              <span className="text-xl font-bold text-red-400">{stats.tombstonesPurged}</span>
            </div>
          </div>

          {/* Engine Execution Bus Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Storage Engine Execution Trace:</span>
              <span className="text-[9px] text-zinc-600 font-mono">Real-time IO bus</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0
                      ? "text-emerald-300 font-bold"
                      : "text-zinc-400 opacity-85"
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
