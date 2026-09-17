"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Share2,
  Globe,
  Radio,
  RefreshCw,
  Plus,
  Minus,
  Zap,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Network,
  Cpu,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

type CrdtMode = "pn_counter" | "lww_kv"

interface NodeCounterState {
  id: "A" | "B" | "C"
  name: string
  region: string
  isOnline: boolean
  p: [number, number, number] // [A, B, C] Positive increments
  n: [number, number, number] // [A, B, C] Negative decrements
  vectorClock: [number, number, number]
}

interface LwwEntry {
  key: string
  value: string
  nodeId: "A" | "B" | "C"
  timestamp: number
  vectorClock: [number, number, number]
}

const INITIAL_NODES: NodeCounterState[] = [
  { id: "A", name: "Node A", region: "Tokyo (NRT)", isOnline: true, p: [3, 0, 0], n: [0, 0, 0], vectorClock: [3, 0, 0] },
  { id: "B", name: "Node B", region: "Frankfurt (FRA)", isOnline: true, p: [0, 5, 0], n: [0, 1, 0], vectorClock: [0, 6, 0] },
  { id: "C", name: "Node C", region: "Silicon Valley (SJC)", isOnline: true, p: [0, 0, 2], n: [0, 0, 0], vectorClock: [0, 0, 2] },
]

export function CrdtVisualizer() {
  const [mode, setMode] = useState<CrdtMode>("pn_counter")
  const [nodes, setNodes] = useState<NodeCounterState[]>(INITIAL_NODES)
  const [lwwStore, setLwwStore] = useState<Record<"A" | "B" | "C", LwwEntry[]>>({
    A: [{ key: "doc:title", value: "Distributed Mesh", nodeId: "A", timestamp: 100, vectorClock: [1, 0, 0] }],
    B: [{ key: "doc:title", value: "Distributed Mesh", nodeId: "B", timestamp: 100, vectorClock: [1, 0, 0] }],
    C: [{ key: "doc:title", value: "Distributed Mesh", nodeId: "C", timestamp: 100, vectorClock: [1, 0, 0] }],
  })
  const [inputVal, setInputVal] = useState("")
  const [syncCount, setSyncCount] = useState(4)
  const [logTrace, setLogTrace] = useState<string[]>([
    "CRDT Mesh initialized. 3 distributed replicas connected across Tokyo, Frankfurt, and Silicon Valley.",
  ])

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 12)])
  }

  // 1. PN-Counter Mutators (Local node mutation)
  const handleCounterMutate = (nodeIndex: number, type: "inc" | "dec") => {
    soundFx.playClick()
    const node = nodes[nodeIndex]
    const nodeIdx = nodeIndex // 0=A, 1=B, 2=C

    const newNodes = [...nodes]
    const updated = { ...newNodes[nodeIndex] }

    if (type === "inc") {
      const newP = [...updated.p] as [number, number, number]
      newP[nodeIdx] += 1
      updated.p = newP
    } else {
      const newN = [...updated.n] as [number, number, number]
      newN[nodeIdx] += 1
      updated.n = newN
    }

    const newClock = [...updated.vectorClock] as [number, number, number]
    newClock[nodeIdx] += 1
    updated.vectorClock = newClock

    newNodes[nodeIndex] = updated
    setNodes(newNodes)

    const op = type === "inc" ? "+1" : "-1"
    appendLog(`📝 Local ${op} applied on ${node.name} (${node.region}). Vector Clock updated to [${newClock.join(", ")}].`)
  }

  // 2. Toggle Online/Partition status
  const handleToggleOnline = (nodeIndex: number) => {
    soundFx.playToggle()
    const newNodes = [...nodes]
    newNodes[nodeIndex] = { ...newNodes[nodeIndex], isOnline: !newNodes[nodeIndex].isOnline }
    setNodes(newNodes)

    const state = newNodes[nodeIndex].isOnline ? "Reconnected to mesh" : "Network Partitioned (Offline Mode)"
    appendLog(`🌐 ${newNodes[nodeIndex].name} (${newNodes[nodeIndex].region}): ${state}.`)
  }

  // 3. Gossip Sync across all online nodes
  const handleGossipSync = () => {
    soundFx.playChime()
    const onlineNodes = nodes.filter((n) => n.isOnline)

    if (onlineNodes.length <= 1) {
      appendLog("⚠️ Cannot sync: Fewer than 2 online nodes available.")
      return
    }

    // Compute pairwise join for PN-Counter: P = max(P_i), N = max(N_i)
    const maxP: [number, number, number] = [0, 0, 0]
    const maxN: [number, number, number] = [0, 0, 0]
    const maxClock: [number, number, number] = [0, 0, 0]

    onlineNodes.forEach((n) => {
      for (let i = 0; i < 3; i++) {
        maxP[i] = Math.max(maxP[i], n.p[i])
        maxN[i] = Math.max(maxN[i], n.n[i])
        maxClock[i] = Math.max(maxClock[i], n.vectorClock[i])
      }
    })

    const newNodes = nodes.map((n) => {
      if (n.isOnline) {
        return {
          ...n,
          p: [...maxP] as [number, number, number],
          n: [...maxN] as [number, number, number],
          vectorClock: [...maxClock] as [number, number, number],
        }
      }
      return n
    })

    setNodes(newNodes)
    setSyncCount((c) => c + 1)
    appendLog(
      `⚡ GOSSIP MERGE COMPLETE: Reconciled ${onlineNodes.length} online nodes. Converged on Vector Clock [${maxClock.join(", ")}].`
    )
  }

  // 4. LWW Key-Value Mutation
  const handleLwwMutate = (nodeId: "A" | "B" | "C") => {
    if (!inputVal.trim()) return
    soundFx.playClick()

    const now = Date.now()
    const nodeIdx = nodeId === "A" ? 0 : nodeId === "B" ? 1 : 2
    const currentClock = [...nodes[nodeIdx].vectorClock] as [number, number, number]
    currentClock[nodeIdx] += 1

    const newEntry: LwwEntry = {
      key: "doc:title",
      value: inputVal.trim(),
      nodeId,
      timestamp: now,
      vectorClock: currentClock,
    }

    setLwwStore((prev) => ({
      ...prev,
      [nodeId]: [newEntry, ...prev[nodeId]],
    }))

    // Update node vector clock
    const newNodes = [...nodes]
    newNodes[nodeIdx] = { ...newNodes[nodeIdx], vectorClock: currentClock }
    setNodes(newNodes)

    appendLog(`✏️ LWW-Set PUT("doc:title" = "${inputVal}") on Node ${nodeId} at ts=${now.toString().slice(-4)}.`)
    setInputVal("")
  }

  // 5. Reset State
  const handleReset = () => {
    soundFx.playChime()
    setNodes(INITIAL_NODES)
    setSyncCount(0)
    setLogTrace(["CRDT Mesh reset to initial baseline state."])
  }

  // Compute calculated counter value for a node: sum(P) - sum(N)
  const getNodeValue = (node: NodeCounterState) => {
    const sumP = node.p.reduce((a, b) => a + b, 0)
    const sumN = node.n.reduce((a, b) => a + b, 0)
    return sumP - sumN
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400 border border-pink-500/20">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                CRDT & Vector Clock Distributed Sync Mesh
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates state-based Conflict-Free Replicated Data Types (PN-Counters and LWW-Registers) across distributed edge nodes.
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
          {/* Mode Switcher & Global Sync Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={mode === "pn_counter" ? "default" : "outline"}
                onClick={() => {
                  soundFx.playToggle()
                  setMode("pn_counter")
                }}
                className="text-xs font-mono gap-1.5"
              >
                <Layers className="h-3.5 w-3.5" />
                PN-Counter CRDT
              </Button>
              <Button
                size="sm"
                variant={mode === "lww_kv" ? "default" : "outline"}
                onClick={() => {
                  soundFx.playToggle()
                  setMode("lww_kv")
                }}
                className="text-xs font-mono gap-1.5"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                LWW-Register CRDT
              </Button>
            </div>

            <Button
              size="sm"
              onClick={handleGossipSync}
              className="text-xs font-mono gap-2 bg-linear-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-md shadow-pink-500/20"
            >
              <Zap className="h-3.5 w-3.5" />
              Trigger Gossip Sync Reconcile
            </Button>
          </div>

          {/* 3 Distributed Node Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nodes.map((node, idx) => {
              const val = getNodeValue(node)
              return (
                <div
                  key={node.id}
                  className={`rounded-xl border p-5 flex flex-col justify-between gap-5 transition-all duration-300 ${
                    node.isOnline
                      ? "bg-card/30 border-border/40 shadow-sm"
                      : "bg-red-950/15 border-red-500/40 opacity-75"
                  }`}
                >
                  {/* Node Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{node.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 font-mono ${
                            node.isOnline
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/20"
                              : "border-red-500/40 text-red-400 bg-red-950/20"
                          }`}
                        >
                          {node.isOnline ? "ONLINE" : "PARTITIONED"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{node.region}</span>
                    </div>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleToggleOnline(idx)}
                      className={`h-7 px-2 text-[10px] font-mono gap-1 ${
                        node.isOnline
                          ? "text-red-400 hover:bg-red-950/30"
                          : "text-emerald-400 hover:bg-emerald-950/30"
                      }`}
                      title="Simulate network partition"
                    >
                      {node.isOnline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
                    </Button>
                  </div>

                  {/* Mode-specific content */}
                  {mode === "pn_counter" ? (
                    <div className="space-y-4">
                      {/* Live Counter Display */}
                      <div className="rounded-xl border border-border/30 bg-card/40 p-4 text-center space-y-1">
                        <span className="text-[10px] uppercase text-zinc-500">Replicated Value</span>
                        <div className="text-3xl font-extrabold text-foreground tracking-tight font-sans">
                          {val}
                        </div>
                      </div>

                      {/* Vector Vectors */}
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between bg-card/25 p-1.5 rounded border border-border/20">
                          <span className="text-emerald-400">P Vector (Inc):</span>
                          <span className="font-bold">[{node.p.join(", ")}]</span>
                        </div>
                        <div className="flex items-center justify-between bg-card/25 p-1.5 rounded border border-border/20">
                          <span className="text-red-400">N Vector (Dec):</span>
                          <span className="font-bold">[{node.n.join(", ")}]</span>
                        </div>
                        <div className="flex items-center justify-between bg-card/25 p-1.5 rounded border border-border/20">
                          <span className="text-indigo-400">Vector Clock:</span>
                          <span className="font-bold">[{node.vectorClock.join(", ")}]</span>
                        </div>
                      </div>

                      {/* Local mutation buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCounterMutate(idx, "inc")}
                          className="font-mono text-xs gap-1 hover:border-emerald-500 hover:text-emerald-400"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          +1 Local
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCounterMutate(idx, "dec")}
                          className="font-mono text-xs gap-1 hover:border-red-500 hover:text-red-400"
                        >
                          <Minus className="h-3.5 w-3.5" />
                          -1 Local
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* LWW Value Display */}
                      <div className="rounded-xl border border-border/30 bg-card/40 p-3 space-y-1">
                        <span className="text-[10px] uppercase text-zinc-500">Key: "doc:title"</span>
                        <div className="text-sm font-bold text-foreground truncate">
                          {lwwStore[node.id][0]?.value || "Empty"}
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1">
                          <span>Updated by: Node {lwwStore[node.id][0]?.nodeId}</span>
                          <span>ts:{lwwStore[node.id][0]?.timestamp.toString().slice(-4)}</span>
                        </div>
                      </div>

                      {/* Vector clock */}
                      <div className="flex items-center justify-between bg-card/25 p-1.5 rounded border border-border/20 text-[10px]">
                        <span className="text-indigo-400">Vector Clock:</span>
                        <span className="font-bold">[{node.vectorClock.join(", ")}]</span>
                      </div>

                      {/* Input to write */}
                      <div className="space-y-1.5">
                        <Input
                          placeholder="New title value..."
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          className="bg-card/40 border-border/40 text-xs font-mono h-8"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleLwwMutate(node.id)}
                          className="w-full text-xs font-mono"
                        >
                          Write to Node {node.id}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sync Mesh Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Active Replicas</span>
              <span className="text-xl font-bold text-pink-400">{nodes.filter((n) => n.isOnline).length} / 3</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Gossip Sync Rounds</span>
              <span className="text-xl font-bold text-emerald-400">{syncCount}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Conflict Errors</span>
              <span className="text-xl font-bold text-indigo-400">0 (Deterministic)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Consistency Model</span>
              <span className="text-xs font-bold text-amber-300 pt-1 truncate">Strong Eventual (SEC)</span>
            </div>
          </div>

          {/* Real-time Mesh Event Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Causal Mesh Replication Trace:</span>
              <span className="text-[9px] text-zinc-600 font-mono">P2P Gossip Bus</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
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
