"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, Zap, RefreshCw, Plus, Search, Trash2, ArrowRight, ArrowLeftRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

interface CacheNode {
  key: string
  value: string
  accessCount: number
}

const INITIAL_CACHE: CacheNode[] = [
  { key: "user:101", value: "{ name: 'Alice', role: 'Admin' }", accessCount: 4 },
  { key: "session:89f", value: "{ ip: '10.0.1.4', ttl: 3600 }", accessCount: 2 },
  { key: "product:42", value: "{ title: 'Pro Plan', price: 99 }", accessCount: 1 },
]

export function LruCacheVisualizer() {
  const CACHE_CAPACITY = 5

  const [cache, setCache] = useState<CacheNode[]>(INITIAL_CACHE)
  const [inputKey, setInputKey] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [hits, setHits] = useState(12)
  const [misses, setMisses] = useState(3)
  const [evictions, setEvictions] = useState(2)
  const [log, setLog] = useState<string>("Cache initialized with 3 warm memory entries.")

  // 1. GET (Read item)
  const handleGet = (keyToFind: string) => {
    soundFx.playClick()
    const index = cache.findIndex((n) => n.key === keyToFind)

    if (index !== -1) {
      soundFx.playChime()
      const item = cache[index]
      const updated = [
        { ...item, accessCount: item.accessCount + 1 },
        ...cache.filter((_, i) => i !== index),
      ]
      setCache(updated)
      setHits((h) => h + 1)
      setLog(`🎯 CACHE HIT: Key "${keyToFind}" found. Moved to Head (Most Recently Used).`)
    } else {
      soundFx.playToggle()
      setMisses((m) => m + 1)
      setLog(`❌ CACHE MISS: Key "${keyToFind}" not found in L1 cache buffer.`)
    }
  }

  // 2. SET (Write item)
  const handleSet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputKey.trim()) return

    soundFx.playClick()
    const existingIndex = cache.findIndex((n) => n.key === inputKey.trim())

    if (existingIndex !== -1) {
      const updated = [
        { key: inputKey.trim(), value: inputValue.trim() || "{}", accessCount: cache[existingIndex].accessCount + 1 },
        ...cache.filter((_, i) => i !== existingIndex),
      ]
      setCache(updated)
      setLog(`✏️ CACHE UPDATE: Key "${inputKey}" updated and promoted to Head.`)
    } else {
      let evictedKey: string | null = null
      let newCache = [...cache]

      if (newCache.length >= CACHE_CAPACITY) {
        evictedKey = newCache[newCache.length - 1].key
        newCache = newCache.slice(0, CACHE_CAPACITY - 1)
        setEvictions((ev) => ev + 1)
      }

      newCache = [{ key: inputKey.trim(), value: inputValue.trim() || "{ data: 'ok' }", accessCount: 1 }, ...newCache]
      setCache(newCache)

      if (evictedKey) {
        setLog(`🚨 CAPACITY LIMIT (5/5): Evicted Least Recently Used tail "${evictedKey}". Added "${inputKey}" to Head.`)
      } else {
        setLog(`✅ CACHE INSERT: Added "${inputKey}" to Head. (${newCache.length}/${CACHE_CAPACITY} Capacity)`)
      }
    }

    setInputKey("")
    setInputValue("")
  }

  const handleReset = () => {
    soundFx.playChime()
    setCache(INITIAL_CACHE)
    setHits(0)
    setMisses(0)
    setEvictions(0)
    setLog("Cache reset to initial baseline state.")
  }

  const hitRate = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(0) : "0"

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                O(1) LRU (Least Recently Used) Cache Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates Hash Map + Doubly Linked List eviction mechanics with O(1) reads, promotions, and tail evictions.
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

        <CardContent className="pt-6 flex flex-col gap-6 font-mono">
          {/* Controls: Insert Form */}
          <form onSubmit={handleSet} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[10px] uppercase text-zinc-500">Key (e.g. order:99)</label>
              <Input
                placeholder="cache_key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="bg-card/30 border-border/40 text-xs font-mono"
              />
            </div>
            <div className="sm:col-span-5 space-y-1">
              <label className="text-[10px] uppercase text-zinc-500">Value Payload</label>
              <Input
                placeholder="{ amount: 500 }"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-card/30 border-border/40 text-xs font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm" className="w-full text-xs font-mono gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                SET Item
              </Button>
            </div>
          </form>

          {/* Linked List Visualizer */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" />
                HEAD (Most Recently Used)
              </span>
              <span className="text-zinc-500">
                Capacity: {cache.length} / {CACHE_CAPACITY} Slots
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                TAIL (Eviction Target)
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Nodes Container */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <AnimatePresence>
                {cache.map((node, idx) => (
                  <motion.div
                    key={node.key}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                      idx === 0
                        ? "border-emerald-500/50 bg-emerald-950/20 shadow-sm shadow-emerald-500/10"
                        : idx === cache.length - 1 && cache.length === CACHE_CAPACITY
                        ? "border-amber-500/50 bg-amber-950/20"
                        : "border-border/40 bg-card/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-foreground truncate">{node.key}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                        #{idx + 1}
                      </Badge>
                    </div>

                    <p className="text-[10px] text-muted-foreground line-clamp-2 bg-card/30 p-1.5 rounded border border-border/20">
                      {node.value}
                    </p>

                    <div className="flex items-center justify-between border-t border-border/15 pt-2">
                      <span className="text-[10px] text-zinc-500">Hits: {node.accessCount}</span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleGet(node.key)}
                        className="h-6 px-2 text-[10px] font-mono hover:bg-primary/20 hover:text-primary"
                      >
                        GET
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Cache Hits</span>
              <span className="text-xl font-bold text-emerald-400">{hits}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Cache Misses</span>
              <span className="text-xl font-bold text-amber-400">{misses}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Hit Ratio</span>
              <span className="text-xl font-bold text-indigo-400">{hitRate}%</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Evicted Items</span>
              <span className="text-xl font-bold text-red-400">{evictions}</span>
            </div>
          </div>

          {/* Event Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-1 shadow-inner">
            <span className="text-[10px] uppercase text-zinc-500">Memory Bus Event Stream:</span>
            <p className="text-zinc-200 font-semibold">{`> ${log}`}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
