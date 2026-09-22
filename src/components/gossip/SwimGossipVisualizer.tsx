"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Radio,
  Wifi,
  WifiOff,
  Activity,
  AlertTriangle,
  RefreshCw,
  Play,
  Zap,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Share2,
  Users,
  Server,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

type NodeHealth = "alive" | "suspect" | "dead"

interface ClusterNode {
  id: string
  name: string
  region: string
  ip: string
  status: NodeHealth
  incarnation: number
  suspectTimer?: number
}

const INITIAL_NODES: ClusterNode[] = [
  { id: "node-1", name: "Node 1", region: "us-east (IAD)", ip: "10.0.1.10", status: "alive", incarnation: 0 },
  { id: "node-2", name: "Node 2", region: "eu-central (FRA)", ip: "10.0.2.14", status: "alive", incarnation: 0 },
  { id: "node-3", name: "Node 3", region: "ap-south (BOM)", ip: "10.0.3.22", status: "alive", incarnation: 0 },
  { id: "node-4", name: "Node 4", region: "ap-northeast (NRT)", ip: "10.0.4.88", status: "alive", incarnation: 0 },
  { id: "node-5", name: "Node 5", region: "sa-east (GRU)", ip: "10.0.5.09", status: "alive", incarnation: 0 },
]

export function SwimGossipVisualizer() {
  const [nodes, setNodes] = useState<ClusterNode[]>(INITIAL_NODES)
  const [period, setPeriod] = useState(14)
  const [directPings, setDirectPings] = useState(42)
  const [indirectReqs, setIndirectReqs] = useState(8)
  const [activeProbe, setActiveProbe] = useState<{ from: string; to: string; type: "direct" | "indirect" | "ack" } | null>(null)
  const [logTrace, setLogTrace] = useState<string[]>([
    "SWIM Cluster Membership initialized. 5 P2P gossip replicas active with O(1) message overhead.",
  ])

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 12)])
  }

  // 1. Step Protocol Period (Direct Ping)
  const handleStepPing = () => {
    soundFx.playClick()
    const aliveNodes = nodes.filter((n) => n.status !== "dead")
    if (aliveNodes.length < 2) return

    const source = aliveNodes[0]
    const candidates = aliveNodes.slice(1)
    const target = candidates[Math.floor(Math.random() * candidates.length)]

    setActiveProbe({ from: source.id, to: target.id, type: "direct" })
    setPeriod((p) => p + 1)
    setDirectPings((d) => d + 1)

    if (target.status === "alive") {
      setTimeout(() => {
        soundFx.playChime()
        setActiveProbe({ from: target.id, to: source.id, type: "ack" })
        appendLog(`📡 PERIOD #${period + 1}: ${source.name} direct pinged ${target.name} -> Received ACK (Round-trip: 18ms).`)
      }, 300)
    } else if (target.status === "suspect") {
      setTimeout(() => {
        soundFx.playToggle()
        appendLog(`⚠️ PERIOD #${period + 1}: ${source.name} pinged ${target.name} (SUSPECT) -> No ACK received.`)
      }, 300)
    }
  }

  // 2. Trigger Indirect Ping-Req (Route around congestion)
  const handleIndirectPingReq = () => {
    soundFx.playToggle()
    const aliveNodes = nodes.filter((n) => n.status === "alive")
    if (aliveNodes.length < 3) return

    const source = aliveNodes[0]
    const helper = aliveNodes[1]
    const target = aliveNodes[aliveNodes.length - 1]

    setActiveProbe({ from: source.id, to: helper.id, type: "indirect" })
    setIndirectReqs((i) => i + 1)

    setTimeout(() => {
      soundFx.playChime()
      setActiveProbe({ from: helper.id, to: target.id, type: "direct" })
      appendLog(
        `🔀 INDIRECT PING-REQ: Direct probe to ${target.name} timed out. ${source.name} requested intermediary ${helper.name} to ping ${target.name}. ACK verified!`
      )
    }, 350)
  }

  // 3. Crash / Kill a Node
  const handleCrashNode = (nodeId: string) => {
    soundFx.playToggle()
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return { ...n, status: "suspect", suspectTimer: 5 }
        }
        return n
      })
    )
    appendLog(`🚨 NODE ANOMALY: ${nodeId} stopped responding. Marked as SUSPECT with countdown timer.`)
  }

  // 4. Confirm Dead / Evict
  const handleConfirmDead = (nodeId: string) => {
    soundFx.playToggle()
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return { ...n, status: "dead", suspectTimer: undefined }
        }
        return n
      })
    )
    appendLog(`☠️ CONFIRMED FAILURE: ${nodeId} declared DEAD. Tombstone rumor piggybacked on cluster gossip stream.`)
  }

  // 5. Refute Suspicion (Bump Incarnation Number)
  const handleRefuteSuspicion = (nodeId: string) => {
    soundFx.playChime()
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const nextInc = n.incarnation + 1
          return { ...n, status: "alive", incarnation: nextInc, suspectTimer: undefined }
        }
        return n
      })
    )
    appendLog(`🛡️ SELF-REFUTATION: ${nodeId} woke up and refuted suspicion by bumping incarnation number! Rumor overridden.`)
  }

  // 6. Reset
  const handleReset = () => {
    soundFx.playChime()
    setNodes(INITIAL_NODES)
    setPeriod(0)
    setDirectPings(0)
    setIndirectReqs(0)
    setActiveProbe(null)
    setLogTrace(["SWIM Cluster Membership reset to clean operational state."])
  }

  const aliveCount = nodes.filter((n) => n.status === "alive").length

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400 border border-teal-500/20">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                SWIM Gossip Protocol & Cluster Failure Detector
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates weakly-consistent infection-style membership, indirect ping-req failovers, suspicion refutations, and O(1) message complexity.
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
          {/* Controls: Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/20 pb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleStepPing}
                className="text-xs font-mono gap-1.5 bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
              >
                <Radio className="h-3.5 w-3.5" />
                Step Ping Period (T)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleIndirectPingReq}
                className="text-xs font-mono gap-1.5 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/20"
              >
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
                Simulate Indirect Ping-Req
              </Button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Cluster Quorum:</span>
              <Badge variant="outline" className="text-xs font-bold text-teal-400 border-teal-500/40">
                {aliveCount} / {nodes.length} Nodes Alive
              </Badge>
            </div>
          </div>

          {/* ================= CLUSTER NODE GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {nodes.map((node) => {
              const isSuspect = node.status === "suspect"
              const isDead = node.status === "dead"
              const isProbed = activeProbe?.to === node.id || activeProbe?.from === node.id

              return (
                <motion.div
                  key={node.id}
                  layout
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-4 transition-all shadow-sm ${
                    isDead
                      ? "border-red-500/40 bg-red-950/20 opacity-60"
                      : isSuspect
                      ? "border-amber-500/80 bg-amber-950/30 shadow-amber-500/10"
                      : isProbed
                      ? "border-teal-500/80 bg-teal-950/25 shadow-teal-500/10"
                      : "border-border/40 bg-card/30"
                  }`}
                >
                  {/* Node Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Server className={`h-3.5 w-3.5 ${isDead ? "text-red-400" : isSuspect ? "text-amber-400" : "text-teal-400"}`} />
                        <span className="font-bold text-foreground text-xs">{node.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate">{node.region}</span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[8px] px-1 py-0 uppercase font-mono ${
                        isDead
                          ? "border-red-500 text-red-400 bg-red-950/40"
                          : isSuspect
                          ? "border-amber-500 text-amber-300 bg-amber-950/40 animate-pulse"
                          : "border-teal-500 text-teal-300 bg-teal-950/40"
                      }`}
                    >
                      {node.status}
                    </Badge>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-[10px] bg-card/40 p-2 rounded border border-border/20">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>IP Address:</span>
                      <span className="font-mono text-zinc-300">{node.ip}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Incarnation:</span>
                      <span className="font-bold text-indigo-300">#{node.incarnation}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    {node.status === "alive" ? (
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => handleCrashNode(node.id)}
                        className="text-[9px] font-mono h-6 gap-1"
                      >
                        <Flame className="h-3 w-3" />
                        Simulate Crash
                      </Button>
                    ) : node.status === "suspect" ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleRefuteSuspicion(node.id)}
                          className="text-[9px] font-mono h-6 text-teal-300 border-teal-500/40 hover:bg-teal-950/30"
                        >
                          Refute
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleConfirmDead(node.id)}
                          className="text-[9px] font-mono h-6"
                        >
                          Mark Dead
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleRefuteSuspicion(node.id)}
                        className="text-[9px] font-mono h-6 gap-1 text-teal-300 border-teal-500/40"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Restart Node
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Telemetry HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Protocol Periods (T)</span>
              <span className="text-xl font-bold text-teal-400">{period}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Direct Pings</span>
              <span className="text-xl font-bold text-indigo-400">{directPings}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Indirect Ping-Reqs</span>
              <span className="text-xl font-bold text-amber-400">{indirectReqs}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Bandwidth Complexity</span>
              <span className="text-xs font-bold text-cyan-300 pt-1">O(1) Constant Overhead</span>
            </div>
          </div>

          {/* Gossip Event Bus Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">SWIM Epidemic Dissemination Stream:</span>
              <span className="text-[9px] text-zinc-600 font-mono">Piggybacked Gossip Buffer</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-teal-300 font-bold" : "text-zinc-400 opacity-85"
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
