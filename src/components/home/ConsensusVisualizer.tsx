"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Network, Play, Pause, RefreshCw, Zap, ShieldAlert, CheckCircle2, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface RaftNode {
  id: string
  name: string
  role: "Leader" | "Candidate" | "Follower"
  term: number
  isPartitioned: boolean
  committedIndex: number
}

export function ConsensusVisualizer() {
  const [nodes, setNodes] = useState<RaftNode[]>([
    { id: "node-1", name: "Node A (Cluster Leader)", role: "Leader", term: 1, isPartitioned: false, committedIndex: 42 },
    { id: "node-2", name: "Node B (Follower)", role: "Follower", term: 1, isPartitioned: false, committedIndex: 42 },
    { id: "node-3", name: "Node C (Follower)", role: "Follower", term: 1, isPartitioned: false, committedIndex: 42 },
  ])

  const [logs, setLogs] = useState<string[]>([
    "Term 1: Node A elected leader via majority quorum (2/3 votes)",
    "Heartbeat broadcast interval: 50ms active",
  ])
  const [isSimulating, setIsSimulating] = useState(true)

  // Simulation pulse
  useEffect(() => {
    if (!isSimulating) return
    const interval = setInterval(() => {
      // Periodic heartbeat pulse
    }, 2000)
    return () => clearInterval(interval)
  }, [isSimulating])

  const triggerPartition = () => {
    soundFx.playToggle()
    setNodes((prev) => {
      return prev.map((n) => {
        if (n.id === "node-1") {
          return { ...n, role: "Follower", isPartitioned: true }
        }
        if (n.id === "node-2") {
          return { ...n, role: "Leader", term: n.term + 1, committedIndex: n.committedIndex + 1 }
        }
        if (n.id === "node-3") {
          return { ...n, term: n.term + 1, committedIndex: n.committedIndex + 1 }
        }
        return n
      })
    })

    setLogs((prev) => [
      `🚨 Network Partition: Node A isolated!`,
      `Term 2: Node B timed out, triggered election, and received vote from Node C (2/3 quorum). Node B elected Leader!`,
      ...prev.slice(0, 4),
    ])
  }

  const healPartition = () => {
    soundFx.playChime()
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        isPartitioned: false,
        term: Math.max(...prev.map((p) => p.term)),
        role: n.id === "node-2" ? "Leader" : "Follower",
      }))
    )

    setLogs((prev) => [
      `✅ Network Healed: Node A re-joined cluster as Follower under Node B (Term 2). State sync complete.`,
      ...prev.slice(0, 4),
    ])
  }

  const submitTransaction = () => {
    soundFx.playClick()
    setNodes((prev) =>
      prev.map((n) => {
        if (!n.isPartitioned) {
          return { ...n, committedIndex: n.committedIndex + 1 }
        }
        return n
      })
    )

    const leader = nodes.find((n) => n.role === "Leader")
    setLogs((prev) => [
      `📝 Client write dispatched -> Replicated to ${leader?.name} (Log #${(leader?.committedIndex || 42) + 1}) -> Quorum ACK received.`,
      ...prev.slice(0, 4),
    ])
  }

  const isPartitionActive = nodes.some((n) => n.isPartitioned)

  return (
    <section className="py-16 bg-card/10 border-y border-border/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-3.5 py-1 text-xs font-mono text-muted-foreground uppercase">
              <Network className="h-3.5 w-3.5 text-primary" />
              <span>Interactive Architecture Simulator</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Distributed Raft Consensus Mesh
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              Test cluster partition tolerance, leader elections, and log replication across a simulated 3-node distributed consensus ring in real time.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 self-start md:self-auto">
            {isPartitionActive ? (
              <Button size="sm" onClick={healPartition} className="text-xs font-mono gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Heal Network Partition
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={triggerPartition} className="text-xs font-mono gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                <ShieldAlert className="h-3.5 w-3.5" />
                Partition Leader Node
              </Button>
            )}

            <Button size="sm" onClick={submitTransaction} className="text-xs font-mono gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Replicate Transaction Log
            </Button>
          </div>
        </div>

        {/* Interactive Visualizer Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {nodes.map((node) => {
            const isLeader = node.role === "Leader"
            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between gap-6 transition-all ${
                  node.isPartitioned
                    ? "border-red-500/40 bg-red-950/10 shadow-lg shadow-red-500/5 opacity-70"
                    : isLeader
                    ? "border-primary/60 bg-primary/5 shadow-xl shadow-primary/5 ring-1 ring-primary/30"
                    : "border-border/40 bg-card/30"
                }`}
              >
                {/* Node Top info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-3 border ${
                        node.isPartitioned
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : isLeader
                          ? "bg-primary/20 text-primary border-primary/40 animate-pulse"
                          : "bg-muted text-muted-foreground border-border/40"
                      }`}
                    >
                      <Server className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading text-sm font-bold text-foreground">
                        {node.name}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        IP: 10.0.1.{node.id.split("-")[1]}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={node.isPartitioned ? "destructive" : isLeader ? "default" : "secondary"}
                    className="text-[10px] font-mono uppercase"
                  >
                    {node.isPartitioned ? "Isolated" : node.role}
                  </Badge>
                </div>

                {/* State metrics */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs border-y border-border/20 py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Current Term</span>
                    <span className="text-base font-bold text-foreground">Term {node.term}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Committed Log</span>
                    <span className="text-base font-bold text-indigo-400">#{node.committedIndex}</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        node.isPartitioned ? "bg-red-500" : "bg-emerald-500 animate-ping"
                      }`}
                    />
                    {node.isPartitioned ? "Connection Dropped" : "Syncing RPC Stream"}
                  </span>
                  <span>{node.isPartitioned ? "Offline" : "50ms Heartbeat"}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Live Cluster Event Log */}
        <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 shadow-inner flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] text-zinc-500 uppercase">
            <span>Cluster Raft Event Bus Telemetry</span>
            <span>Real-time Stream</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, idx) => (
              <p key={idx} className={idx === 0 ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                {`> ${log}`}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
