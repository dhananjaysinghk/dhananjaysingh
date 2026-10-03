"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu,
  Layers,
  Zap,
  Shield,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Play,
  Flame,
  HardDrive,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

type AllocatorMode = "BUDDY" | "SLAB"

interface BuddyBlock {
  id: string
  address: number // 0 to 256
  size: number // 32, 64, 128, 256 KB
  allocated: boolean
  tag?: string
}

interface SlabObject {
  id: string
  cacheName: string
  objectSize: number
  allocated: boolean
}

export function MemoryAllocatorVisualizer() {
  const [mode, setMode] = useState<AllocatorMode>("BUDDY")
  
  // ================= 1. BUDDY ALLOCATOR STATE (256 KB Pool) =================
  const [buddyBlocks, setBuddyBlocks] = useState<BuddyBlock[]>([
    { id: "b1", address: 0, size: 64, allocated: true, tag: "kernel_pgd" },
    { id: "b2", address: 64, size: 64, allocated: false },
    { id: "b3", address: 128, size: 128, allocated: false },
  ])

  // ================= 2. SLAB ALLOCATOR STATE =================
  const [slabCaches, setSlabCaches] = useState<{
    name: string
    sizeBytes: number
    objects: SlabObject[]
  }[]>([
    {
      name: "task_struct",
      sizeBytes: 512,
      objects: [
        { id: "ts-1", cacheName: "task_struct", objectSize: 512, allocated: true },
        { id: "ts-2", cacheName: "task_struct", objectSize: 512, allocated: true },
        { id: "ts-3", cacheName: "task_struct", objectSize: 512, allocated: false },
        { id: "ts-4", cacheName: "task_struct", objectSize: 512, allocated: false },
      ],
    },
    {
      name: "inode_cache",
      sizeBytes: 256,
      objects: [
        { id: "in-1", cacheName: "inode_cache", objectSize: 256, allocated: true },
        { id: "in-2", cacheName: "inode_cache", objectSize: 256, allocated: false },
        { id: "in-3", cacheName: "inode_cache", objectSize: 256, allocated: false },
        { id: "in-4", cacheName: "inode_cache", objectSize: 256, allocated: false },
      ],
    },
    {
      name: "sk_buff (socket)",
      sizeBytes: 1024,
      objects: [
        { id: "sk-1", cacheName: "sk_buff (socket)", objectSize: 1024, allocated: true },
        { id: "sk-2", cacheName: "sk_buff (socket)", objectSize: 1024, allocated: false },
      ],
    },
  ])

  const [eventLogs, setEventLogs] = useState<string[]>([
    "Linux Kernel Memory Allocator initialized (Binary Buddy Pool: 256 KB, Slab Object Caches active).",
  ])

  const appendLog = (msg: string) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 14)])
  }

  // ================= BUDDY OPERATIONS =================
  // Allocate requested size (32, 64, or 128 KB)
  const handleBuddyAllocate = (reqSize: number) => {
    soundFx.playClick()

    // Find smallest free block >= reqSize
    const eligibleIdx = buddyBlocks.findIndex((b) => !b.allocated && b.size >= reqSize)
    if (eligibleIdx === -1) {
      soundFx.playToggle()
      appendLog(`🚨 OUT OF MEMORY: No contiguous buddy block available for ${reqSize} KB allocation.`)
      return
    }

    const block = buddyBlocks[eligibleIdx]

    if (block.size === reqSize) {
      // Perfect fit
      const updated = [...buddyBlocks]
      updated[eligibleIdx] = {
        ...block,
        allocated: true,
        tag: `alloc_${reqSize}k`,
      }
      setBuddyBlocks(updated)
      soundFx.playChime()
      appendLog(`⚡ ALLOCATED: Block [addr: ${block.address}KB, size: ${reqSize}KB] assigned directly.`)
    } else {
      // Need to split recursively
      const newBlocks = [...buddyBlocks]
      let currentBlock = block
      let currentIdx = eligibleIdx

      while (currentBlock.size > reqSize) {
        const halfSize = currentBlock.size / 2
        appendLog(`✂️ BUDDY SPLIT: Split ${currentBlock.size}KB block at addr ${currentBlock.address}KB into two ${halfSize}KB buddy blocks.`)

        const buddy1: BuddyBlock = {
          id: Math.random().toString(36).substring(7),
          address: currentBlock.address,
          size: halfSize,
          allocated: false,
        }
        const buddy2: BuddyBlock = {
          id: Math.random().toString(36).substring(7),
          address: currentBlock.address + halfSize,
          size: halfSize,
          allocated: false,
        }

        newBlocks.splice(currentIdx, 1, buddy1, buddy2)
        currentBlock = buddy1
      }

      // Mark first half as allocated
      newBlocks[currentIdx] = {
        ...currentBlock,
        allocated: true,
        tag: `alloc_${reqSize}k`,
      }

      setBuddyBlocks(newBlocks)
      soundFx.playChime()
      appendLog(`✅ ALLOCATED: Assigned ${reqSize}KB block at addr ${currentBlock.address}KB after buddy split.`)
    }
  }

  // Free block & coalesce buddies
  const handleBuddyFree = (blockId: string) => {
    soundFx.playToggle()
    const targetIdx = buddyBlocks.findIndex((b) => b.id === blockId)
    if (targetIdx === -1) return

    let updated = buddyBlocks.map((b) => (b.id === blockId ? { ...b, allocated: false, tag: undefined } : b))
    appendLog(`🗑️ FREE: Released block at addr ${buddyBlocks[targetIdx].address}KB (${buddyBlocks[targetIdx].size}KB).`)

    // Attempt Coalescing Pass
    let coalesced = true
    while (coalesced) {
      coalesced = false
      for (let i = 0; i < updated.length - 1; i++) {
        const b1 = updated[i]
        const b2 = updated[i + 1]

        // Check if b1 and b2 are free, same size, and aligned buddy pairs
        if (
          !b1.allocated &&
          !b2.allocated &&
          b1.size === b2.size &&
          b1.address % (b1.size * 2) === 0 &&
          b2.address === b1.address + b1.size
        ) {
          const merged: BuddyBlock = {
            id: Math.random().toString(36).substring(7),
            address: b1.address,
            size: b1.size * 2,
            allocated: false,
          }
          appendLog(`🔗 BUDDY COALESCE: Merged buddy blocks [${b1.address}KB] & [${b2.address}KB] into single ${merged.size}KB block!`)
          updated.splice(i, 2, merged)
          coalesced = true
          break
        }
      }
    }

    setBuddyBlocks(updated)
    soundFx.playChime()
  }

  // ================= SLAB OPERATIONS =================
  const handleSlabAllocate = (cacheName: string) => {
    soundFx.playClick()
    setSlabCaches((prev) =>
      prev.map((c) => {
        if (c.name === cacheName) {
          const freeIdx = c.objects.findIndex((o) => !o.allocated)
          if (freeIdx === -1) {
            appendLog(`⚠️ Slab cache '${cacheName}' is full. Allocating new slab page...`)
            return c
          }
          const updatedObjs = [...c.objects]
          updatedObjs[freeIdx] = { ...updatedObjs[freeIdx], allocated: true }
          appendLog(`⚡ SLAB ALLOC: Allocated ${c.sizeBytes}B '${cacheName}' object from pre-initialized freelist in O(1) time.`)
          soundFx.playChime()
          return { ...c, objects: updatedObjs }
        }
        return c
      })
    )
  }

  const handleSlabFree = (cacheName: string, objId: string) => {
    soundFx.playToggle()
    setSlabCaches((prev) =>
      prev.map((c) => {
        if (c.name === cacheName) {
          const updatedObjs = c.objects.map((o) => (o.id === objId ? { ...o, allocated: false } : o))
          appendLog(`🗑️ SLAB FREE: Returned object '${objId}' (${c.sizeBytes}B) to '${cacheName}' freelist.`)
          return { ...c, objects: updatedObjs }
        }
        return c
      })
    )
  }

  // Reset
  const handleReset = () => {
    soundFx.playChime()
    setBuddyBlocks([
      { id: "b1", address: 0, size: 64, allocated: true, tag: "kernel_pgd" },
      { id: "b2", address: 64, size: 64, allocated: false },
      { id: "b3", address: 128, size: 128, allocated: false },
    ])
    setSlabCaches([
      {
        name: "task_struct",
        sizeBytes: 512,
        objects: [
          { id: "ts-1", cacheName: "task_struct", objectSize: 512, allocated: true },
          { id: "ts-2", cacheName: "task_struct", objectSize: 512, allocated: true },
          { id: "ts-3", cacheName: "task_struct", objectSize: 512, allocated: false },
          { id: "ts-4", cacheName: "task_struct", objectSize: 512, allocated: false },
        ],
      },
      {
        name: "inode_cache",
        sizeBytes: 256,
        objects: [
          { id: "in-1", cacheName: "inode_cache", objectSize: 256, allocated: true },
          { id: "in-2", cacheName: "inode_cache", objectSize: 256, allocated: false },
          { id: "in-3", cacheName: "inode_cache", objectSize: 256, allocated: false },
          { id: "in-4", cacheName: "inode_cache", objectSize: 256, allocated: false },
        ],
      },
      {
        name: "sk_buff (socket)",
        sizeBytes: 1024,
        objects: [
          { id: "sk-1", cacheName: "sk_buff (socket)", objectSize: 1024, allocated: true },
          { id: "sk-2", cacheName: "sk_buff (socket)", objectSize: 1024, allocated: false },
        ],
      },
    ])
    setEventLogs(["Memory Allocator reset to baseline state."])
  }

  // Metrics calculation
  const totalAllocatedBuddy = buddyBlocks.filter((b) => b.allocated).reduce((acc, b) => acc + b.size, 0)
  const totalFreeBuddy = 256 - totalAllocatedBuddy
  const largestFreeBlock = Math.max(0, ...buddyBlocks.filter((b) => !b.allocated).map((b) => b.size))
  const externalFragmentation =
    totalFreeBuddy > 0 ? (((totalFreeBuddy - largestFreeBlock) / totalFreeBuddy) * 100).toFixed(1) : "0.0"

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Linux Kernel Memory Allocator: Binary Buddy & Slab Engine
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Interactive physical page allocation, binary buddy block splitting/coalescing, and fixed-size Slab object caches.
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
              <span className="text-xs font-bold text-foreground">Memory Subsystem:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    soundFx.playClick()
                    setMode("BUDDY")
                  }}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    mode === "BUDDY"
                      ? "bg-indigo-500 text-indigo-950 font-bold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                  }`}
                >
                  Binary Buddy System (Physical Pages / Power-of-Two)
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick()
                    setMode("SLAB")
                  }}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    mode === "SLAB"
                      ? "bg-indigo-500 text-indigo-950 font-bold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                  }`}
                >
                  Slab Allocator (Fixed Kernel Objects / task_struct)
                </button>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 font-sans">
              {mode === "BUDDY" ? "256 KB Total Physical Frame Pool" : "Zero-Fragmentation O(1) Object Freelist"}
            </div>
          </div>

          {/* ================= BUDDY ALLOCATOR VIEW ================= */}
          {mode === "BUDDY" && (
            <div className="flex flex-col gap-6">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-foreground">Allocate Page Block:</span>
                <Button
                  size="sm"
                  onClick={() => handleBuddyAllocate(32)}
                  className="text-xs font-mono gap-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Alloc 32 KB (Order 0)
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBuddyAllocate(64)}
                  className="text-xs font-mono gap-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Alloc 64 KB (Order 1)
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBuddyAllocate(128)}
                  className="text-xs font-mono gap-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Alloc 128 KB (Order 2)
                </Button>
              </div>

              {/* Visual 256KB Memory Map */}
              <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col gap-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    Physical Address Space (0x0000 to 0x0040 - 256 KB)
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Allocated: <strong className="text-emerald-400">{totalAllocatedBuddy} KB</strong> | Free: <strong className="text-indigo-300">{totalFreeBuddy} KB</strong>
                  </span>
                </div>

                {/* Proportional Memory Block Grid */}
                <div className="flex w-full gap-1.5 h-20">
                  {buddyBlocks.map((block) => {
                    const widthPercent = (block.size / 256) * 100
                    return (
                      <motion.div
                        key={block.id}
                        layout
                        style={{ width: `${widthPercent}%` }}
                        className={`rounded-lg border p-2 flex flex-col justify-between transition-all ${
                          block.allocated
                            ? "border-emerald-500/70 bg-emerald-950/40 text-emerald-300 shadow-xs"
                            : "border-border/40 bg-card/25 text-zinc-500 border-dashed"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="font-bold">[{block.address}KB]</span>
                          <span className="font-bold text-foreground">{block.size} KB</span>
                        </div>

                        <div className="flex items-center justify-between text-[9px]">
                          <span className={block.allocated ? "text-emerald-400 font-bold" : "text-zinc-600"}>
                            {block.allocated ? block.tag || "ALLOCATED" : "FREE BUDDY"}
                          </span>
                          {block.allocated && (
                            <button
                              onClick={() => handleBuddyFree(block.id)}
                              className="text-rose-400 hover:text-rose-300 cursor-pointer p-0.5"
                              title="Free block & coalesce"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                  <span>Buddy Address Alignment Formula: <code className="text-indigo-300">BuddyAddress = Address XOR BlockSize</code></span>
                  <span>Automatic Recursive Coalescing on Free</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= SLAB ALLOCATOR VIEW ================= */}
          {mode === "SLAB" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slabCaches.map((cache) => {
                  const allocatedCount = cache.objects.filter((o) => o.allocated).length
                  const freeCount = cache.objects.length - allocatedCount

                  return (
                    <div
                      key={cache.name}
                      className="rounded-xl border border-border/40 bg-card/25 p-4 flex flex-col justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-foreground text-xs">{cache.name}</span>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            Object Size: {cache.sizeBytes} Bytes
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {allocatedCount}/{cache.objects.length} Active
                        </Badge>
                      </div>

                      {/* Objects Freelist Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {cache.objects.map((obj) => (
                          <div
                            key={obj.id}
                            className={`p-2 rounded border flex items-center justify-between text-[9px] font-mono ${
                              obj.allocated
                                ? "border-purple-500/70 bg-purple-950/30 text-purple-300 font-bold"
                                : "border-border/30 bg-card/20 text-zinc-600 border-dashed"
                            }`}
                          >
                            <span>{obj.allocated ? "IN_USE" : "FREELIST"}</span>
                            {obj.allocated && (
                              <button
                                onClick={() => handleSlabFree(cache.name, obj.id)}
                                className="text-rose-400 hover:text-rose-300 cursor-pointer"
                                title="Free object"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        size="xs"
                        onClick={() => handleSlabAllocate(cache.name)}
                        disabled={freeCount === 0}
                        className="w-full text-[10px] font-mono gap-1 bg-purple-600 hover:bg-purple-500 text-white"
                      >
                        <Plus className="h-3 w-3" />
                        Alloc {cache.name}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Telemetry Metrics HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">External Fragmentation</span>
              <span className="text-xl font-bold text-indigo-400">{externalFragmentation}%</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Internal Fragmentation</span>
              <span className="text-xl font-bold text-emerald-400">0.0% (Exact Fit)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Allocation Complexity</span>
              <span className="text-xl font-bold text-cyan-400">O(1) / O(log N)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Kernel Mechanism</span>
              <span className="text-xs font-bold text-amber-300 pt-1">
                {mode === "BUDDY" ? "Binary Order Splitting" : "kmem_cache Freelist"}
              </span>
            </div>
          </div>

          {/* Allocator Log Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                Kernel Memory Management Event Log:
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">kmem stream</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {eventLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-indigo-300 font-bold" : "text-zinc-400 opacity-85"
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
