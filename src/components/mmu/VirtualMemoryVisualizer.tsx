"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu,
  Layers,
  Zap,
  RefreshCw,
  Search,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Binary,
  ArrowRight,
  ShieldAlert,
  Server,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

interface TlbEntry {
  vpn: string // Virtual Page Number
  pfn: string // Physical Frame Number
  permissions: "R/W" | "R-O"
  hitCount: number
}

interface PageTableLevel {
  name: string
  index: number
  tableAddress: string
  targetFrame: string
}

export function VirtualMemoryVisualizer() {
  const [addressInput, setAddressInput] = useState("0x7fff_a041_c280")
  const [tlb, setTlb] = useState<TlbEntry[]>([
    { vpn: "0x7fff_a041", pfn: "0x14e0_9000", permissions: "R/W", hitCount: 14 },
    { vpn: "0x5555_a102", pfn: "0x02a1_8000", permissions: "R-O", hitCount: 6 },
  ])
  const [tlbHits, setTlbHits] = useState(24)
  const [tlbMisses, setTlbMisses] = useState(5)
  const [pageFaults, setPageFaults] = useState(2)
  const [lastTranslation, setLastTranslation] = useState<{
    virtualAddress: string
    physicalAddress: string
    isTlbHit: boolean
    isPageFault: boolean
    latency: string
    breakdown: { pml4: number; pdpt: number; pd: number; pt: number; offset: number }
  } | null>(null)

  const [logTrace, setLogTrace] = useState<string[]>([
    "Hardware MMU & 4-Level Page Table Walker initialized. CR3 Register loaded with PML4 root.",
  ])

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 12)])
  }

  // Parse 64-bit Virtual Address into 9-bit indices and 12-bit offset
  const parseAddress = (hexStr: string) => {
    const clean = hexStr.replace(/[^0-9a-fA-F]/g, "")
    const num = BigInt(`0x${clean || "0"}`)

    const offset = Number(num & BigInt(0xfff)) // Lower 12 bits
    const pt = Number((num >> BigInt(12)) & BigInt(0x1ff)) // 9 bits
    const pd = Number((num >> BigInt(21)) & BigInt(0x1ff)) // 9 bits
    const pdpt = Number((num >> BigInt(30)) & BigInt(0x1ff)) // 9 bits
    const pml4 = Number((num >> BigInt(39)) & BigInt(0x1ff)) // 9 bits

    const vpn = `0x${(num >> BigInt(12)).toString(16).padStart(8, "0").slice(-8)}`
    return { pml4, pdpt, pd, pt, offset, vpn }
  }

  // 1. Translate Virtual Address
  const handleTranslate = (addrOverride?: string) => {
    const addr = addrOverride || addressInput
    soundFx.playClick()
    const breakdown = parseAddress(addr)

    // Check NULL or invalid address for Page Fault
    if (addr.includes("0x0000_0000") || breakdown.pml4 === 0 && breakdown.pdpt === 0) {
      soundFx.playToggle()
      setPageFaults((pf) => pf + 1)
      setTlbMisses((m) => m + 1)
      setLastTranslation({
        virtualAddress: addr,
        physicalAddress: "PAGE_FAULT (#PF Vector 14)",
        isTlbHit: false,
        isPageFault: true,
        latency: "850 µs (Disk Swap / Kernel Trap)",
        breakdown,
      })
      appendLog(`🚨 PAGE FAULT (#PF Vector 14): Address ${addr} is unmapped (Present bit P=0). Kernel dispatched SIGSEGV.`)
      return
    }

    // Check TLB Cache
    const inTlbIndex = tlb.findIndex((e) => e.vpn === breakdown.vpn)
    if (inTlbIndex !== -1) {
      soundFx.playChime()
      setTlbHits((h) => h + 1)
      const hitEntry = tlb[inTlbIndex]
      const updatedTlb = [...tlb]
      updatedTlb[inTlbIndex] = { ...hitEntry, hitCount: hitEntry.hitCount + 1 }
      setTlb(updatedTlb)

      const physAddr = `${hitEntry.pfn.slice(0, 6)}_${breakdown.offset.toString(16).padStart(3, "0")}`
      setLastTranslation({
        virtualAddress: addr,
        physicalAddress: physAddr,
        isTlbHit: true,
        isPageFault: false,
        latency: "0.5 ns (1 CPU Cycle • L1 TLB Hit)",
        breakdown,
      })
      appendLog(`⚡ TLB HIT (0.5ns): Virtual Page ${breakdown.vpn} -> Physical Frame ${hitEntry.pfn} (Fast-path).`)
    } else {
      // TLB Miss -> 4-Level Page Table Walk
      soundFx.playToggle()
      setTlbMisses((m) => m + 1)
      const generatedPfn = `0x${Math.floor(0x1000 + Math.random() * 0x8fff).toString(16)}_0000`
      const physAddr = `${generatedPfn.slice(0, 6)}_${breakdown.offset.toString(16).padStart(3, "0")}`

      // Populate TLB
      const newTlbEntry: TlbEntry = {
        vpn: breakdown.vpn,
        pfn: generatedPfn,
        permissions: "R/W",
        hitCount: 1,
      }
      setTlb([newTlbEntry, ...tlb.slice(0, 3)])

      setLastTranslation({
        virtualAddress: addr,
        physicalAddress: physAddr,
        isTlbHit: false,
        isPageFault: false,
        latency: "45 ns (4-Level Page Table Walk)",
        breakdown,
      })
      appendLog(
        `🔍 TLB MISS: Executed 4-level MMU page walk [PML4[${breakdown.pml4}] -> PDPT[${breakdown.pdpt}] -> PD[${breakdown.pd}] -> PT[${breakdown.pt}]]. Populated TLB.`
      )
    }
  }

  // 2. Flush TLB (INVLPG instruction)
  const handleFlushTlb = () => {
    soundFx.playChime()
    setTlb([])
    appendLog("🧹 TLB FLUSH (INVLPG): All hardware Translation Lookaside Buffer entries invalidated.")
  }

  // 3. Reset
  const handleReset = () => {
    soundFx.playChime()
    setTlb([
      { vpn: "0x7fff_a041", pfn: "0x14e0_9000", permissions: "R/W", hitCount: 14 },
      { vpn: "0x5555_a102", pfn: "0x02a1_8000", permissions: "R-O", hitCount: 6 },
    ])
    setTlbHits(24)
    setTlbMisses(5)
    setPageFaults(2)
    setLastTranslation(null)
    setLogTrace(["Virtual Memory System reset to initial baseline state."])
  }

  const hitRate = tlbHits + tlbMisses > 0 ? ((tlbHits / (tlbHits + tlbMisses)) * 100).toFixed(1) : "0.0"

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Virtual Memory MMU & 4-Level Page Table Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates x86-64 address translation, TLB cache lookups, 4-level page walks (PML4, PDPT, PD, PT), and kernel page fault traps.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleFlushTlb}
              className="text-xs font-mono gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-950/20"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Flush TLB (INVLPG)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="text-xs font-mono gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-8 font-mono">
          {/* Controls: Address Input & Presets */}
          <div className="rounded-xl border border-border/30 bg-card/20 p-4 space-y-4">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Binary className="h-3.5 w-3.5 text-cyan-400" />
              Memory Bus: 64-Bit Virtual Address Translation
            </span>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Input
                placeholder="Virtual Address (e.g. 0x7fff_a041_c280)"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="bg-card/40 border-border/40 text-xs font-mono font-bold tracking-wide"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleTranslate()
                  }
                }}
              />
              <Button size="sm" onClick={() => handleTranslate()} className="w-full sm:w-auto text-xs font-mono gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Translate (MMU)
              </Button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-muted-foreground">
              <span>Quick Memory Targets:</span>
              {[
                { label: "Stack Top", addr: "0x7fff_fffe_4010" },
                { label: "Heap Chunk", addr: "0x5555_a102_0080" },
                { label: "Shared Lib (mmap)", addr: "0x7f88_3200_1000" },
                { label: "Unmapped (NULL #PF)", addr: "0x0000_0000_0000" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setAddressInput(preset.addr)
                    handleTranslate(preset.addr)
                  }}
                  className="px-2 py-1 rounded bg-card/60 border border-border/40 text-zinc-300 hover:text-foreground font-mono transition-colors"
                >
                  {preset.label} ({preset.addr})
                </button>
              ))}
            </div>
          </div>

          {/* ================= MMU HARDWARE PIPELINE ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* TLB Cache Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  L1 Hardware TLB Cache
                </span>
                <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                  ~0.5ns Latency
                </Badge>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/15 p-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-border/20 pb-1">
                  <span>VPN (Virtual Page)</span>
                  <span>PFN (Physical Frame)</span>
                  <span>Hits</span>
                </div>

                {tlb.length === 0 ? (
                  <div className="py-6 text-center text-zinc-500 text-[11px] border border-dashed border-border/30 rounded-lg">
                    TLB is empty (All entries flushed).
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {tlb.map((entry) => (
                      <div
                        key={entry.vpn}
                        className="flex items-center justify-between p-2 rounded bg-card/40 border border-border/20 text-[11px]"
                      >
                        <span className="font-bold text-foreground">{entry.vpn}</span>
                        <span className="text-emerald-400 font-mono">{entry.pfn}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                          {entry.hitCount}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4-Level Page Table Walk Pipeline */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  x86-64 4-Level Page Table Hierarchy
                </span>
                <span className="text-[10px] text-zinc-500">CR3 Register Base</span>
              </div>

              {lastTranslation ? (
                <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 space-y-4 shadow-inner">
                  {/* Bit decomposition */}
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded bg-card/40 border border-border/30">
                      <span className="text-zinc-500 block">PML4 (9b)</span>
                      <span className="font-bold text-indigo-300">idx: {lastTranslation.breakdown.pml4}</span>
                    </div>
                    <div className="p-2 rounded bg-card/40 border border-border/30">
                      <span className="text-zinc-500 block">PDPT (9b)</span>
                      <span className="font-bold text-indigo-300">idx: {lastTranslation.breakdown.pdpt}</span>
                    </div>
                    <div className="p-2 rounded bg-card/40 border border-border/30">
                      <span className="text-zinc-500 block">PD (9b)</span>
                      <span className="font-bold text-indigo-300">idx: {lastTranslation.breakdown.pd}</span>
                    </div>
                    <div className="p-2 rounded bg-card/40 border border-border/30">
                      <span className="text-zinc-500 block">PT (9b)</span>
                      <span className="font-bold text-indigo-300">idx: {lastTranslation.breakdown.pt}</span>
                    </div>
                    <div className="p-2 rounded bg-card/40 border border-border/30">
                      <span className="text-zinc-500 block">Offset (12b)</span>
                      <span className="font-bold text-emerald-300">+{lastTranslation.breakdown.offset}B</span>
                    </div>
                  </div>

                  {/* Result Box */}
                  <div
                    className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                      lastTranslation.isPageFault
                        ? "bg-red-950/30 border-red-500/50 text-red-300"
                        : lastTranslation.isTlbHit
                        ? "bg-cyan-950/30 border-cyan-500/50 text-cyan-300"
                        : "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
                    }`}
                  >
                    <div>
                      <span className="font-bold uppercase text-[10px] block opacity-75">Physical RAM Output:</span>
                      <span className="font-extrabold text-sm">{lastTranslation.physicalAddress}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono self-start sm:self-auto">
                      Latency: {lastTranslation.latency}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-border/30 rounded-xl">
                  Enter an address above and click Translate to execute an MMU lookup.
                </div>
              )}
            </div>
          </div>

          {/* Real-time Hardware Telemetry HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">TLB Cache Hits</span>
              <span className="text-xl font-bold text-cyan-400">{tlbHits}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">TLB Hit Rate</span>
              <span className="text-xl font-bold text-emerald-400">{hitRate}%</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Page Faults (#PF)</span>
              <span className="text-xl font-bold text-red-400">{pageFaults}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Page Size Standard</span>
              <span className="text-xs font-bold text-indigo-300 pt-1">4KB (4096 Bytes)</span>
            </div>
          </div>

          {/* MMU Bus Trace */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">MMU Memory Controller Event Stream:</span>
              <span className="text-[9px] text-zinc-600 font-mono">Hardware Bus</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-cyan-300 font-bold" : "text-zinc-400 opacity-85"
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
