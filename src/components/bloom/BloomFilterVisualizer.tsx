"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Binary,
  Zap,
  Shield,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Play,
  Flame,
  Search,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

type FilterMode = "STANDARD" | "COUNTING"

// Hash Functions
function hashFNV1a(str: string, mod: number): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) % mod
}

function hashMurmur(str: string, mod: number): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % mod
}

function hashDJB2(str: string, mod: number): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return Math.abs(hash) % mod
}

export function BloomFilterVisualizer() {
  const BIT_SIZE = 32
  const [mode, setMode] = useState<FilterMode>("STANDARD")
  const [inputKey, setInputKey] = useState("user:alex_88")
  const [queryKey, setQueryKey] = useState("user:alex_88")
  const [queryResult, setQueryResult] = useState<{
    found: boolean
    indices: number[]
    msg: string
  } | null>(null)

  // 32-bit standard filter array & counting filter array
  const [bitArray, setBitArray] = useState<number[]>(new Array(BIT_SIZE).fill(0))
  const [counterArray, setCounterArray] = useState<number[]>(new Array(BIT_SIZE).fill(0))
  const [insertedKeys, setInsertedKeys] = useState<string[]>(["session:prod_4", "cache:home_feed"])
  
  const [eventLogs, setEventLogs] = useState<string[]>([
    "Bloom Filter initialized (m=32 bits, k=3 hash functions: FNV-1a, Murmur3, DJB2).",
  ])

  // Initialize with 2 items
  React.useEffect(() => {
    let bits = new Array(BIT_SIZE).fill(0)
    let counters = new Array(BIT_SIZE).fill(0)
    
    ;["session:prod_4", "cache:home_feed"].forEach((key) => {
      const h1 = hashFNV1a(key, BIT_SIZE)
      const h2 = hashMurmur(key, BIT_SIZE)
      const h3 = hashDJB2(key, BIT_SIZE)
      bits[h1] = 1
      bits[h2] = 1
      bits[h3] = 1
      counters[h1] = (counters[h1] || 0) + 1
      counters[h2] = (counters[h2] || 0) + 1
      counters[h3] = (counters[h3] || 0) + 1
    })

    setBitArray(bits)
    setCounterArray(counters)
  }, [])

  const appendLog = (msg: string) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 14)])
  }

  // 1. Insert Key
  const handleInsert = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputKey.trim()) return

    soundFx.playClick()
    const key = inputKey.trim()
    const h1 = hashFNV1a(key, BIT_SIZE)
    const h2 = hashMurmur(key, BIT_SIZE)
    const h3 = hashDJB2(key, BIT_SIZE)
    const indices = [h1, h2, h3]

    const newBits = [...bitArray]
    const newCounters = [...counterArray]

    indices.forEach((idx) => {
      newBits[idx] = 1
      newCounters[idx] = (newCounters[idx] || 0) + 1
    })

    setBitArray(newBits)
    setCounterArray(newCounters)
    if (!insertedKeys.includes(key)) {
      setInsertedKeys((prev) => [...prev, key])
    }

    appendLog(`📝 INSERT: '${key}' -> Hashed to bit indices [${indices.join(", ")}].`)
    setInputKey(`user:session_${Math.floor(Math.random() * 900 + 100)}`)
    setQueryResult(null)
  }

  // 2. Query Key
  const handleQuery = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!queryKey.trim()) return

    soundFx.playChime()
    const key = queryKey.trim()
    const h1 = hashFNV1a(key, BIT_SIZE)
    const h2 = hashMurmur(key, BIT_SIZE)
    const h3 = hashDJB2(key, BIT_SIZE)
    const indices = [h1, h2, h3]

    const targetArray = mode === "STANDARD" ? bitArray : counterArray
    const allSet = indices.every((idx) => targetArray[idx] > 0)

    if (allSet) {
      const isActualMember = insertedKeys.includes(key)
      const msg = isActualMember
        ? "PROBABLY IN SET (True Positive: Key was previously inserted)"
        : "PROBABLY IN SET (False Positive: Collision occurred across all 3 hash indices)"
      setQueryResult({ found: true, indices, msg })
      appendLog(`🔍 QUERY: '${key}' [${indices.join(", ")}] -> ALL BITS SET (1) => ${msg}`)
    } else {
      setQueryResult({
        found: false,
        indices,
        msg: "DEFINITELY NOT IN SET (Zero False Negative Guarantee)",
      })
      appendLog(`🔍 QUERY: '${key}' [${indices.join(", ")}] -> Missing bit(s) detected => DEFINITELY NOT IN SET.`)
    }
  }

  // 3. Delete Key (Counting Bloom Filter)
  const handleDelete = (key: string) => {
    soundFx.playToggle()
    const h1 = hashFNV1a(key, BIT_SIZE)
    const h2 = hashMurmur(key, BIT_SIZE)
    const h3 = hashDJB2(key, BIT_SIZE)
    const indices = [h1, h2, h3]

    const newCounters = [...counterArray]
    const newBits = [...bitArray]

    indices.forEach((idx) => {
      newCounters[idx] = Math.max(0, newCounters[idx] - 1)
      if (newCounters[idx] === 0) {
        newBits[idx] = 0
      }
    })

    setCounterArray(newCounters)
    setBitArray(newBits)
    setInsertedKeys((prev) => prev.filter((k) => k !== key))
    appendLog(`🗑️ DELETE: '${key}' -> Decremented counter indices [${indices.join(", ")}].`)
    setQueryResult(null)
  }

  // 4. Reset
  const handleReset = () => {
    soundFx.playChime()
    setBitArray(new Array(BIT_SIZE).fill(0))
    setCounterArray(new Array(BIT_SIZE).fill(0))
    setInsertedKeys([])
    setQueryResult(null)
    setEventLogs(["Bloom Filter reset to empty 32-bit state."])
  }

  // Math Calculations
  const n = insertedKeys.length
  const m = BIT_SIZE
  const k = 3
  const setBitsCount = bitArray.filter((b) => b === 1).length
  const bitDensity = ((setBitsCount / m) * 100).toFixed(1)
  const theoreticalFpRate =
    n > 0 ? (Math.pow(1 - Math.exp((-k * n) / m), k) * 100).toFixed(2) : "0.00"

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400 border border-pink-500/20">
              <Binary className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Probabilistic Data Structures: Bloom Filter & Counting Filter
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Interactive bitwise hashing, zero false negatives guarantee, and Cassandra/RocksDB SSTable avoidance mechanics.
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

        <CardContent className="pt-6 flex flex-col gap-8 font-mono">
          {/* Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl border border-border/30 bg-card/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Filter Mode:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    soundFx.playClick()
                    setMode("STANDARD")
                  }}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    mode === "STANDARD"
                      ? "bg-pink-500 text-pink-950 font-bold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                  }`}
                >
                  Standard Bloom Filter (1-bit per slot)
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick()
                    setMode("COUNTING")
                  }}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    mode === "COUNTING"
                      ? "bg-pink-500 text-pink-950 font-bold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                  }`}
                >
                  Counting Bloom Filter (4-bit Counters / Deletion Support)
                </button>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 font-sans">
              k = 3 Hash Functions (FNV-1a, Murmur3, DJB2) | Modulo m = 32
            </div>
          </div>

          {/* Insert & Query Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Insert Box */}
            <div className="lg:col-span-6 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-pink-400" />
                Insert Element (Hash & Set k Bits)
              </span>

              <form onSubmit={handleInsert} className="flex gap-2">
                <Input
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="e.g. user:1092"
                  className="bg-card/40 border-border/40 text-xs font-mono grow"
                />
                <Button type="submit" size="sm" className="text-xs font-mono gap-1 bg-pink-600 hover:bg-pink-500 text-white shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                  Insert
                </Button>
              </form>

              {/* Inserted keys list */}
              <div className="pt-1">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Inserted Set Keys ({insertedKeys.length}):</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {insertedKeys.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-border/30 text-[10px] text-zinc-300"
                    >
                      {k}
                      {mode === "COUNTING" && (
                        <button
                          onClick={() => handleDelete(k)}
                          className="hover:text-rose-400 text-zinc-500 cursor-pointer"
                          title="Delete element"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {insertedKeys.length === 0 && <span className="text-zinc-600 text-[10px]">No keys in filter</span>}
                </div>
              </div>
            </div>

            {/* Query Box */}
            <div className="lg:col-span-6 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-cyan-400" />
                Test Set Membership (Fast Probabilistic Lookup)
              </span>

              <form onSubmit={handleQuery} className="flex gap-2">
                <Input
                  value={queryKey}
                  onChange={(e) => setQueryKey(e.target.value)}
                  placeholder="e.g. user:alex_88"
                  className="bg-card/40 border-border/40 text-xs font-mono grow"
                />
                <Button type="submit" size="sm" variant="outline" className="text-xs font-mono gap-1 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/20 shrink-0">
                  <Search className="h-3.5 w-3.5" />
                  Query Key
                </Button>
              </form>

              {queryResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-1 ${
                    queryResult.found
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : "border-rose-500/40 bg-rose-950/30 text-rose-300"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {queryResult.found ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-rose-400" />}
                    {queryResult.found ? "MATCH: Probable Member" : "MISS: Definite Non-Member"}
                  </div>
                  <div className="text-[10px] opacity-90">{queryResult.msg}</div>
                  <div className="text-[9px] text-zinc-400 pt-0.5">Checked Bit Indices: [{queryResult.indices.join(", ")}]</div>
                </div>
              )}
            </div>
          </div>

          {/* 32-Bit Interactive Array Representation */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col gap-5 shadow-inner">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                Bit Array Memory Buffer (m = 32 Slots)
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-pink-300 font-bold">Bit Density: {bitDensity}% ({setBitsCount}/32 set)</span>
                <span className="text-amber-300 font-bold">Theoretical False Positive Rate: {theoreticalFpRate}%</span>
              </div>
            </div>

            {/* 32 Cells Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
              {Array.from({ length: BIT_SIZE }).map((_, idx) => {
                const isSet = bitArray[idx] === 1
                const count = counterArray[idx]
                const isQueried = queryResult?.indices.includes(idx)

                return (
                  <div
                    key={idx}
                    className={`h-12 rounded border flex flex-col items-center justify-center p-1 text-[9px] transition-all ${
                      isQueried
                        ? "border-cyan-400 bg-cyan-950/50 text-cyan-200 ring-2 ring-cyan-400/50"
                        : isSet
                        ? "border-pink-500/70 bg-pink-950/30 text-pink-300 font-bold shadow-xs shadow-pink-500/10"
                        : "border-border/30 bg-card/20 text-zinc-600"
                    }`}
                  >
                    <span className="text-[8px] opacity-70 font-mono">[{idx}]</span>
                    <span className="text-xs font-bold font-mono">
                      {mode === "STANDARD" ? bitArray[idx] : count}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
              <span>Formula: <code className="text-pink-300">P ≈ (1 - e^(-kn/m))^k</code></span>
              <span>100% Negative Determinism (If bit is 0 → Key was never added)</span>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">False Negative Rate</span>
              <span className="text-xl font-bold text-emerald-400">0.00% (Guaranteed)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">False Positive Rate</span>
              <span className="text-xl font-bold text-pink-400">{theoreticalFpRate}%</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Hash Functions (k)</span>
              <span className="text-xl font-bold text-cyan-400">3 Hashes</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Memory Efficiency</span>
              <span className="text-xs font-bold text-amber-300 pt-1">32 Bits (4 Bytes RAM)</span>
            </div>
          </div>

          {/* Audit Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                Bloom Filter Hash Operations Stream:
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">Bitwise Bus</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {eventLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-pink-300 font-bold" : "text-zinc-400 opacity-85"
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
