"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Layers,
  Server,
  Zap,
  RefreshCw,
  Plus,
  Play,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Users,
  Radio,
  ArrowRight,
  TrendingDown,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

interface Message {
  offset: number
  key: string
  payload: string
  timestamp: number
}

interface PartitionData {
  id: number
  broker: string
  leader: string
  messages: Message[]
  committedOffset: number
}

interface Consumer {
  id: string
  name: string
  assignedPartitions: number[]
  status: "active" | "lagged" | "crashed"
}

// Simple deterministic hash function for key-based partitioning
function hashKey(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 3
}

const INITIAL_PARTITIONS: PartitionData[] = [
  {
    id: 0,
    broker: "broker-101 (us-east)",
    leader: "Leader",
    committedOffset: 2,
    messages: [
      { offset: 0, key: "user:101", payload: "{ order: 100 }", timestamp: 10 },
      { offset: 1, key: "user:101", payload: "{ order: 102 }", timestamp: 20 },
      { offset: 2, key: "user:104", payload: "{ order: 105 }", timestamp: 30 },
    ],
  },
  {
    id: 1,
    broker: "broker-102 (eu-central)",
    leader: "Leader",
    committedOffset: 1,
    messages: [
      { offset: 0, key: "user:202", payload: "{ order: 201 }", timestamp: 15 },
      { offset: 1, key: "user:205", payload: "{ order: 208 }", timestamp: 25 },
    ],
  },
  {
    id: 2,
    broker: "broker-103 (ap-south)",
    leader: "Leader",
    committedOffset: 3,
    messages: [
      { offset: 0, key: "user:301", payload: "{ order: 300 }", timestamp: 12 },
      { offset: 1, key: "user:303", payload: "{ order: 304 }", timestamp: 18 },
      { offset: 2, key: "user:307", payload: "{ order: 309 }", timestamp: 28 },
      { offset: 3, key: "user:309", payload: "{ order: 312 }", timestamp: 35 },
    ],
  },
]

const INITIAL_CONSUMERS: Consumer[] = [
  { id: "c1", name: "Consumer C1", assignedPartitions: [0], status: "active" },
  { id: "c2", name: "Consumer C2", assignedPartitions: [1], status: "active" },
  { id: "c3", name: "Consumer C3", assignedPartitions: [2], status: "active" },
]

export function KafkaPartitionVisualizer() {
  const [partitions, setPartitions] = useState<PartitionData[]>(INITIAL_PARTITIONS)
  const [consumers, setConsumers] = useState<Consumer[]>(INITIAL_CONSUMERS)
  const [rebalanceMode, setRebalanceMode] = useState<"cooperative" | "eager">("cooperative")
  const [inputKey, setInputKey] = useState("user:101")
  const [inputPayload, setInputPayload] = useState("{ order: 550, amount: $99 }")
  const [rebalanceCount, setRebalanceCount] = useState(1)
  const [logTrace, setLogTrace] = useState<string[]>([
    "Kafka Cluster initialized. Topic 'orders.v1' (3 Partitions, RF=3) mapped to Consumer Group 'order-workers'.",
  ])

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 12)])
  }

  // 1. PRODUCE Message
  const handleProduce = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputKey.trim()) return

    soundFx.playClick()
    const targetPartitionId = hashKey(inputKey.trim())
    const targetPart = partitions[targetPartitionId]

    const newOffset = targetPart.messages.length
    const newMessage: Message = {
      offset: newOffset,
      key: inputKey.trim(),
      payload: inputPayload.trim() || "{ ok: true }",
      timestamp: Date.now(),
    }

    const updatedPartitions = partitions.map((p) => {
      if (p.id === targetPartitionId) {
        return {
          ...p,
          messages: [...p.messages, newMessage],
        }
      }
      return p
    })

    setPartitions(updatedPartitions)
    appendLog(
      `📝 PRODUCE: Key "${inputKey}" -> MurmurHash2 % 3 = Partition #${targetPartitionId} (Appended at offset ${newOffset}).`
    )
  }

  // 2. POLL / CONSUME Batch
  const handlePollBatch = () => {
    soundFx.playChime()
    let consumedCount = 0

    const updatedPartitions = partitions.map((p) => {
      const isAssigned = consumers.some((c) => c.status === "active" && c.assignedPartitions.includes(p.id))
      if (isAssigned && p.committedOffset < p.messages.length) {
        consumedCount += p.messages.length - p.committedOffset
        return {
          ...p,
          committedOffset: p.messages.length,
        }
      }
      return p
    })

    setPartitions(updatedPartitions)
    appendLog(`⚡ POLL: Active consumers polled and committed ${consumedCount} records across assigned partitions. Lag -> 0.`)
  }

  // 3. Scale Up Consumer (Add Consumer C4)
  const handleAddConsumer = () => {
    if (consumers.length >= 4) {
      appendLog("⚠️ Maximum demo consumer capacity reached (4 consumers).")
      return
    }

    soundFx.playToggle()
    const newConsumerId = `c${consumers.length + 1}`
    const newName = `Consumer C${consumers.length + 1}`

    // Rebalance logic
    let newConsumers: Consumer[] = []
    if (rebalanceMode === "cooperative") {
      newConsumers = [
        { id: "c1", name: "Consumer C1", assignedPartitions: [0], status: "active" },
        { id: "c2", name: "Consumer C2", assignedPartitions: [1], status: "active" },
        { id: "c3", name: "Consumer C3", assignedPartitions: [2], status: "active" },
        { id: newConsumerId, name: newName, assignedPartitions: [], status: "active" }, // Standby / idle
      ]
      appendLog(
        `🔄 INCREMENTAL REBALANCE: ${newName} joined. Incremental Cooperative protocol assigned partitions without stopping consumption.`
      )
    } else {
      newConsumers = [
        { id: "c1", name: "Consumer C1", assignedPartitions: [0], status: "active" },
        { id: "c2", name: "Consumer C2", assignedPartitions: [1], status: "active" },
        { id: "c3", name: "Consumer C3", assignedPartitions: [2], status: "active" },
        { id: newConsumerId, name: newName, assignedPartitions: [], status: "active" },
      ]
      appendLog(`🚨 EAGER REBALANCE: Stop-the-world partition revoke and full group sync triggered.`)
    }

    setConsumers(newConsumers)
    setRebalanceCount((r) => r + 1)
  }

  // 4. Crash Consumer C2 (Failover)
  const handleCrashConsumer = (consumerId: string) => {
    soundFx.playToggle()
    const crashedConsumer = consumers.find((c) => c.id === consumerId)
    if (!crashedConsumer) return

    const orphanedPartitions = crashedConsumer.assignedPartitions

    const remainingActive = consumers.filter((c) => c.id !== consumerId && c.status === "active")
    if (remainingActive.length === 0) return

    // Reassign orphaned partitions to active consumers
    const updatedConsumers = consumers.map((c) => {
      if (c.id === consumerId) {
        return { ...c, status: "crashed" as const, assignedPartitions: [] }
      }
      if (c.id === remainingActive[0].id) {
        return { ...c, assignedPartitions: Array.from(new Set([...c.assignedPartitions, ...orphanedPartitions])) }
      }
      return c
    })

    setConsumers(updatedConsumers)
    setRebalanceCount((r) => r + 1)
    appendLog(
      `🚨 HEARTBEAT TIMEOUT: ${crashedConsumer.name} crashed! Failover triggered: Partition #${orphanedPartitions.join(", ")} reassigned to ${remainingActive[0].name}.`
    )
  }

  // 5. Reset
  const handleReset = () => {
    soundFx.playChime()
    setPartitions(INITIAL_PARTITIONS)
    setConsumers(INITIAL_CONSUMERS)
    setRebalanceCount(1)
    setLogTrace(["Kafka Cluster reset to initial baseline state."])
  }

  // Calculate cumulative lag
  const totalLag = partitions.reduce((acc, p) => acc + (p.messages.length - p.committedOffset), 0)
  const totalMessages = partitions.reduce((acc, p) => acc + p.messages.length, 0)

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400 border border-orange-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Distributed Event Log & Kafka Partition Rebalance Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates append-only commit logs, MurmurHash2 partition routing, high watermarks, consumer lag, and cooperative rebalancing.
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
          {/* Controls: Produce Form & Group Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form: Produce */}
            <div className="lg:col-span-7 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-orange-400" />
                Produce Event (Key-Based Partition Routing)
              </span>

              <form onSubmit={handleProduce} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4 space-y-1">
                  <Input
                    placeholder="Key (e.g. user:101)"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="bg-card/40 border-border/40 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <Input
                    placeholder="Payload"
                    value={inputPayload}
                    onChange={(e) => setInputPayload(e.target.value)}
                    className="bg-card/40 border-border/40 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button type="submit" size="sm" className="w-full text-xs font-mono gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Produce
                  </Button>
                </div>
              </form>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground pt-1">
                <span>Try keys:</span>
                {["user:101 (P0)", "user:202 (P1)", "user:301 (P2)", "order:994"].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      const clean = k.split(" ")[0]
                      setInputKey(clean)
                    }}
                    className="px-1.5 py-0.5 rounded bg-card/60 border border-border/40 text-zinc-300 hover:text-foreground font-mono transition-colors"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Poll Batch & Scale */}
            <div className="lg:col-span-5 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  Consumer Group: `order-workers`
                </span>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono ${
                    totalLag > 0 ? "border-amber-500/50 text-amber-300" : "border-emerald-500/50 text-emerald-300"
                  }`}
                >
                  Lag: {totalLag} Msgs
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={handlePollBatch}
                  className="text-xs font-mono gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Play className="h-3.5 w-3.5" />
                  Poll / Consume
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddConsumer}
                  disabled={consumers.length >= 4}
                  className="text-xs font-mono gap-1.5 border-border/40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Scale Consumer
                </Button>
              </div>

              {/* Rebalance mode toggle */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                <span>Protocol:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setRebalanceMode("cooperative")}
                    className={`px-2 py-0.5 rounded border transition-colors ${
                      rebalanceMode === "cooperative"
                        ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/50"
                        : "bg-card/30 text-zinc-500 border-border/30"
                    }`}
                  >
                    Incremental Cooperative
                  </button>
                  <button
                    type="button"
                    onClick={() => setRebalanceMode("eager")}
                    className={`px-2 py-0.5 rounded border transition-colors ${
                      rebalanceMode === "eager"
                        ? "bg-amber-950/40 text-amber-300 border-amber-500/50"
                        : "bg-card/30 text-zinc-500 border-border/30"
                    }`}
                  >
                    Eager
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PARTITIONS & CONSUMERS ARCHITECTURE ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* TOPIC PARTITIONS */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <Server className="h-4 w-4" />
                  Topic: `orders.v1` (Append-Only Log Partitions)
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  3 Active Partitions
                </Badge>
              </div>

              <div className="flex flex-col gap-3">
                {partitions.map((part) => {
                  const lag = part.messages.length - part.committedOffset
                  const assignedConsumer = consumers.find((c) => c.status === "active" && c.assignedPartitions.includes(part.id))

                  return (
                    <div
                      key={part.id}
                      className="rounded-xl border border-border/40 bg-zinc-950 p-4 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold border-orange-500/40 text-orange-300">
                            Partition #{part.id}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 truncate">{part.broker}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1 py-0 font-mono ${
                              lag > 0 ? "border-amber-500/50 text-amber-300" : "border-emerald-500/50 text-emerald-400"
                            }`}
                          >
                            Lag: {lag}
                          </Badge>
                          <span className="text-[10px] text-indigo-300 font-bold">
                            Assigned: {assignedConsumer?.name || "None (Unassigned)"}
                          </span>
                        </div>
                      </div>

                      {/* Log Offset Cells */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {part.messages.map((msg) => {
                          const isCommitted = msg.offset < part.committedOffset
                          return (
                            <motion.div
                              key={msg.offset}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`p-2 rounded-lg border text-[10px] flex flex-col justify-between min-w-25 shrink-0 ${
                                isCommitted
                                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                                  : "bg-amber-950/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[9px] border-b border-border/20 pb-0.5">
                                <span>off: {msg.offset}</span>
                                <span>{isCommitted ? "ACK" : "PENDING"}</span>
                              </div>
                              <span className="font-bold truncate py-1 text-foreground">{msg.key}</span>
                              <span className="text-[8px] text-zinc-500 truncate">{msg.payload}</span>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CONSUMER GROUP REPLICAS */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Consumer Group Instances
                </span>
                <span className="text-[10px] text-zinc-500">Auto Offset Commit</span>
              </div>

              <div className="flex flex-col gap-3">
                {consumers.map((c) => {
                  const isCrashed = c.status === "crashed"

                  return (
                    <motion.div
                      key={c.id}
                      layout
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 shadow-sm ${
                        isCrashed
                          ? "border-red-500/40 bg-red-950/20 opacity-60"
                          : "border-border/40 bg-card/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs text-foreground block">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            Assigned:{" "}
                            {c.assignedPartitions.length > 0
                              ? c.assignedPartitions.map((p) => `Partition #${p}`).join(", ")
                              : "Idle (Over-provisioned)"}
                          </span>
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-[8px] px-1 py-0 uppercase font-mono ${
                            isCrashed
                              ? "border-red-500 text-red-400"
                              : "border-emerald-500 text-emerald-400 bg-emerald-950/30"
                          }`}
                        >
                          {c.status}
                        </Badge>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/20">
                        <span className="text-[9px] text-zinc-500 font-mono">Heartbeat: 3000ms</span>
                        {c.status === "active" ? (
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => handleCrashConsumer(c.id)}
                            className="text-[9px] font-mono h-6 gap-1"
                          >
                            <Flame className="h-3 w-3" />
                            Simulate Crash
                          </Button>
                        ) : (
                          <span className="text-[9px] text-red-400 font-bold">Failed / Evicted</span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Telemetry Metrics HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Log End Offsets (LEO)</span>
              <span className="text-xl font-bold text-orange-400">{totalMessages} Total Events</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Total Consumer Lag</span>
              <span className={`text-xl font-bold ${totalLag > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {totalLag} Unread
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Group Rebalances</span>
              <span className="text-xl font-bold text-indigo-400">{rebalanceCount}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Rebalance Protocol</span>
              <span className="text-xs font-bold text-cyan-300 pt-1 truncate">
                {rebalanceMode === "cooperative" ? "Incremental Sticky" : "Eager Stop-The-World"}
              </span>
            </div>
          </div>

          {/* Kafka Event Bus Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Kafka Broker & Coordinator Event Stream:</span>
              <span className="text-[9px] text-zinc-600 font-mono">Cluster Coordinator Log</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-orange-300 font-bold" : "text-zinc-400 opacity-85"
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
