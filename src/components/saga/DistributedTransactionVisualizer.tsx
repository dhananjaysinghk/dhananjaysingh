"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Layers,
  Zap,
  Shield,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Play,
  Flame,
  Radio,
  Send,
  Sparkles,
  RefreshCw,
  Cpu,
  ArrowRight,
  Database,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

type ProtocolMode = "SAGA" | "2PC"

interface SagaStep {
  id: string
  name: string
  action: string
  compensate: string
  status: "PENDING" | "EXECUTING" | "COMPLETED" | "COMPENSATING" | "COMPENSATED" | "FAILED"
  responseMs: number
}

interface Participant2PC {
  id: string
  name: string
  dbType: string
  phase1Vote: "PENDING" | "VOTE_COMMIT" | "VOTE_ABORT"
  phase2Status: "PENDING" | "COMMITTED" | "ABORTED"
}

export function DistributedTransactionVisualizer() {
  const [mode, setMode] = useState<ProtocolMode>("SAGA")
  
  // Saga State
  const [sagaSteps, setSagaSteps] = useState<SagaStep[]>([
    {
      id: "step-1",
      name: "Order Service",
      action: "CreatePendingOrder(order_892)",
      compensate: "CancelOrder(order_892)",
      status: "PENDING",
      responseMs: 12,
    },
    {
      id: "step-2",
      name: "Inventory Service",
      action: "ReserveStock(SKU_409, qty: 2)",
      compensate: "ReleaseStock(SKU_409, qty: 2)",
      status: "PENDING",
      responseMs: 24,
    },
    {
      id: "step-3",
      name: "Payment Gateway",
      action: "AuthorizeCard($240.00)",
      compensate: "RefundCharge($240.00)",
      status: "PENDING",
      responseMs: 65,
    },
    {
      id: "step-4",
      name: "Shipping Service",
      action: "GenerateWaybill(FedEx Priority)",
      compensate: "VoidWaybill()",
      status: "PENDING",
      responseMs: 38,
    },
  ])

  // 2PC State
  const [coordinatorState, setCoordinatorState] = useState<"IDLE" | "PREPARE" | "GLOBAL_COMMIT" | "GLOBAL_ABORT">("IDLE")
  const [participants, setParticipants] = useState<Participant2PC[]>([
    { id: "p1", name: "Shard-Alpha (US-East)", dbType: "PostgreSQL 16", phase1Vote: "PENDING", phase2Status: "PENDING" },
    { id: "p2", name: "Shard-Beta (EU-Central)", dbType: "PostgreSQL 16", phase1Vote: "PENDING", phase2Status: "PENDING" },
    { id: "p3", name: "Ledger-Store (APAC)", dbType: "RocksDB WAL", phase1Vote: "PENDING", phase2Status: "PENDING" },
  ])

  const [eventLogs, setEventLogs] = useState<string[]>([
    "Distributed Transaction Coordinator initialized. Ready for Saga or 2-Phase Commit execution.",
  ])

  const appendLog = (msg: string) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 14)])
  }

  // ================= 1. SAGA EXECUTION =================
  const handleRunSagaSuccess = async () => {
    soundFx.playClick()
    appendLog("🚀 SAGA ORCHESTRATOR: Starting sequential forward transaction workflow...")

    for (let i = 0; i < sagaSteps.length; i++) {
      setSagaSteps((prev) =>
        prev.map((step, idx) => (idx === i ? { ...step, status: "EXECUTING" } : step))
      )
      await new Promise((r) => setTimeout(r, 450))
      soundFx.playChime()

      setSagaSteps((prev) =>
        prev.map((step, idx) => (idx === i ? { ...step, status: "COMPLETED" } : step))
      )
      appendLog(`✅ SAGA: Step #${i + 1} [${sagaSteps[i].name}] -> '${sagaSteps[i].action}' committed successfully.`)
    }

    appendLog("🎉 SAGA COMPLETE: All distributed steps succeeded. Eventual consistency guaranteed.")
  }

  // Saga Failure with Compensating Rollbacks
  const handleRunSagaFailure = async () => {
    soundFx.playToggle()
    appendLog("🚀 SAGA ORCHESTRATOR: Starting transaction with simulated step #3 payment failure...")

    // Step 1
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, status: "EXECUTING" } : s))
    )
    await new Promise((r) => setTimeout(r, 400))
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, status: "COMPLETED" } : s))
    )
    appendLog("✅ SAGA: Step #1 [Order Service] committed.")

    // Step 2
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 1 ? { ...s, status: "EXECUTING" } : s))
    )
    await new Promise((r) => setTimeout(r, 400))
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 1 ? { ...s, status: "COMPLETED" } : s))
    )
    appendLog("✅ SAGA: Step #2 [Inventory Service] committed.")

    // Step 3 (FAILS)
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 2 ? { ...s, status: "FAILED" } : s))
    )
    soundFx.playToggle()
    appendLog("🚨 SAGA FAILURE: Step #3 [Payment Gateway] failed with 'CARD_INSUFFICIENT_FUNDS'!")
    appendLog("⚡ BACKWARD COMPENSATION: Initiating rollback of completed steps...")

    await new Promise((r) => setTimeout(r, 600))

    // Compensate Step 2
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 1 ? { ...s, status: "COMPENSATING" } : s))
    )
    await new Promise((r) => setTimeout(r, 450))
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 1 ? { ...s, status: "COMPENSATED" } : s))
    )
    appendLog("🔄 COMPENSATED: Step #2 Inventory released via 'ReleaseStock(SKU_409, qty: 2)'.")

    // Compensate Step 1
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, status: "COMPENSATING" } : s))
    )
    await new Promise((r) => setTimeout(r, 450))
    setSagaSteps((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, status: "COMPENSATED" } : s))
    )
    appendLog("🔄 COMPENSATED: Step #1 Order cancelled via 'CancelOrder(order_892)'.")
    appendLog("🛡️ SAGA ROLLBACK COMPLETE: System returned cleanly to original state without data corruption.")
  }

  // ================= 2. TWO-PHASE COMMIT (2PC) =================
  const handleRun2PCCommit = async () => {
    soundFx.playClick()
    setCoordinatorState("PREPARE")
    appendLog("📡 2PC PHASE 1 (PREPARE): Coordinator broadcasted 'CanCommit?' query to all 3 participant shards.")

    await new Promise((r) => setTimeout(r, 500))

    // All vote VOTE_COMMIT
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, phase1Vote: "VOTE_COMMIT" }))
    )
    soundFx.playChime()
    appendLog("🗳️ 2PC VOTING: All shards wrote to WAL and replied 'VOTE_COMMIT'.")

    await new Promise((r) => setTimeout(r, 600))

    // Coordinator issues GLOBAL_COMMIT
    setCoordinatorState("GLOBAL_COMMIT")
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, phase2Status: "COMMITTED" }))
    )
    appendLog("🌐 2PC PHASE 2 (GLOBAL_COMMIT): Coordinator issued Global Commit. All participants finalized ACID writes.")
  }

  const handleRun2PCAbort = async () => {
    soundFx.playToggle()
    setCoordinatorState("PREPARE")
    appendLog("📡 2PC PHASE 1 (PREPARE): Coordinator broadcasted 'CanCommit?' query to all participant shards.")

    await new Promise((r) => setTimeout(r, 500))

    // Shard Beta votes VOTE_ABORT due to disk lock conflict
    setParticipants((prev) => [
      { ...prev[0], phase1Vote: "VOTE_COMMIT" },
      { ...prev[1], phase1Vote: "VOTE_ABORT" },
      { ...prev[2], phase1Vote: "VOTE_COMMIT" },
    ])
    appendLog("🚨 2PC VOTE ABORT: Shard-Beta replied 'VOTE_ABORT' (Lock conflict detected on rows).")

    await new Promise((r) => setTimeout(r, 600))

    // Coordinator issues GLOBAL_ABORT
    setCoordinatorState("GLOBAL_ABORT")
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, phase2Status: "ABORTED" }))
    )
    soundFx.playToggle()
    appendLog("⛔ 2PC PHASE 2 (GLOBAL_ABORT): Coordinator broadcasted Global Abort. All participant locks released.")
  }

  // Reset
  const handleReset = () => {
    soundFx.playChime()
    setCoordinatorState("IDLE")
    setSagaSteps([
      {
        id: "step-1",
        name: "Order Service",
        action: "CreatePendingOrder(order_892)",
        compensate: "CancelOrder(order_892)",
        status: "PENDING",
        responseMs: 12,
      },
      {
        id: "step-2",
        name: "Inventory Service",
        action: "ReserveStock(SKU_409, qty: 2)",
        compensate: "ReleaseStock(SKU_409, qty: 2)",
        status: "PENDING",
        responseMs: 24,
      },
      {
        id: "step-3",
        name: "Payment Gateway",
        action: "AuthorizeCard($240.00)",
        compensate: "RefundCharge($240.00)",
        status: "PENDING",
        responseMs: 65,
      },
      {
        id: "step-4",
        name: "Shipping Service",
        action: "GenerateWaybill(FedEx Priority)",
        compensate: "VoidWaybill()",
        status: "PENDING",
        responseMs: 38,
      },
    ])
    setParticipants([
      { id: "p1", name: "Shard-Alpha (US-East)", dbType: "PostgreSQL 16", phase1Vote: "PENDING", phase2Status: "PENDING" },
      { id: "p2", name: "Shard-Beta (EU-Central)", dbType: "PostgreSQL 16", phase1Vote: "PENDING", phase2Status: "PENDING" },
      { id: "p3", name: "Ledger-Store (APAC)", dbType: "RocksDB WAL", phase1Vote: "PENDING", phase2Status: "PENDING" },
    ])
    setEventLogs(["Distributed Transaction Coordinator reset to initial state."])
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Distributed Transactions: 2-Phase Commit (2PC) & Saga Coordinator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Interactive atomic multi-database coordination and asynchronous compensating transaction workflows.
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
          {/* Top Switcher: Saga vs 2PC */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl border border-border/30 bg-card/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Protocol Architecture:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    soundFx.playClick()
                    setMode("SAGA")
                    handleReset()
                  }}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    mode === "SAGA"
                      ? "bg-indigo-500 text-indigo-950 font-bold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                  }`}
                >
                  Saga Pattern (Compensating Actions)
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick()
                    setMode("2PC")
                    handleReset()
                  }}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    mode === "2PC"
                      ? "bg-indigo-500 text-indigo-950 font-bold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                  }`}
                >
                  Two-Phase Commit (2PC / Atomic Shards)
                </button>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 font-sans">
              {mode === "SAGA" ? "Eventual Consistency | Non-Blocking | High Scale" : "Strict Linearizable ACID | Blocking Locks | Low-Latency Shards"}
            </div>
          </div>

          {/* ================= SAGA PATTERN VIEW ================= */}
          {mode === "SAGA" && (
            <div className="flex flex-col gap-6">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  onClick={handleRunSagaSuccess}
                  className="text-xs font-mono gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Play className="h-3.5 w-3.5" />
                  Execute Successful Saga Flow
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRunSagaFailure}
                  className="text-xs font-mono gap-1 border-rose-500/40 text-rose-300 hover:bg-rose-950/20"
                >
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  Simulate Failure & Compensate Rollback
                </Button>
              </div>

              {/* Step Flow Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sagaSteps.map((step, idx) => {
                  const isCompleted = step.status === "COMPLETED"
                  const isExecuting = step.status === "EXECUTING"
                  const isFailed = step.status === "FAILED"
                  const isCompensating = step.status === "COMPENSATING"
                  const isCompensated = step.status === "COMPENSATED"

                  return (
                    <motion.div
                      key={step.id}
                      layout
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                        isCompleted
                          ? "border-emerald-500/70 bg-emerald-950/20"
                          : isExecuting
                          ? "border-indigo-500 bg-indigo-950/30 animate-pulse"
                          : isFailed
                          ? "border-rose-500 bg-rose-950/40 ring-1 ring-rose-500"
                          : isCompensating
                          ? "border-amber-500 bg-amber-950/30 animate-pulse"
                          : isCompensated
                          ? "border-amber-500/50 bg-amber-950/20 text-amber-300"
                          : "border-border/40 bg-card/25"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Step #{idx + 1}</span>
                        <Badge
                          variant="outline"
                          className={`text-[8px] font-mono px-1.5 py-0 ${
                            isCompleted
                              ? "border-emerald-500 text-emerald-300 bg-emerald-950/40"
                              : isFailed
                              ? "border-rose-500 text-rose-300 bg-rose-950/40"
                              : isCompensated
                              ? "border-amber-500 text-amber-300 bg-amber-950/40"
                              : "border-border/40 text-muted-foreground"
                          }`}
                        >
                          {step.status}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1">
                          <Database className="h-3 w-3 text-indigo-400" />
                          {step.name}
                        </div>
                        <div className="text-[10px] text-zinc-300 font-mono bg-zinc-900/80 p-1.5 rounded border border-border/20">
                          {step.action}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/20 space-y-1">
                        <span className="text-[9px] text-zinc-500 block uppercase">Compensating Action:</span>
                        <div className="text-[9px] text-amber-400 font-mono truncate">
                          {step.compensate}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ================= 2-PHASE COMMIT VIEW ================= */}
          {mode === "2PC" && (
            <div className="flex flex-col gap-6">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  onClick={handleRun2PCCommit}
                  className="text-xs font-mono gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Play className="h-3.5 w-3.5" />
                  Run 2PC Global Commit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRun2PCAbort}
                  className="text-xs font-mono gap-1 border-rose-500/40 text-rose-300 hover:bg-rose-950/20"
                >
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  Simulate Shard Abort & Global Rollback
                </Button>
              </div>

              {/* Coordinator & Shards Topology */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Coordinator Node */}
                <div className="rounded-xl border border-indigo-500/60 bg-indigo-950/30 p-4 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Coordinator
                    </span>
                    <Badge variant="outline" className="text-[8px] font-mono border-indigo-400 text-indigo-300">
                      {coordinatorState}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    Orchestrates Phase 1 voting and writes commit decisions to Write-Ahead Log (WAL).
                  </p>
                </div>

                {/* Shards Participants */}
                {participants.map((p) => {
                  const isVoteCommit = p.phase1Vote === "VOTE_COMMIT"
                  const isVoteAbort = p.phase1Vote === "VOTE_ABORT"
                  const isCommitted = p.phase2Status === "COMMITTED"
                  const isAborted = p.phase2Status === "ABORTED"

                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-4 space-y-2.5 transition-all ${
                        isCommitted
                          ? "border-emerald-500/70 bg-emerald-950/20"
                          : isAborted
                          ? "border-rose-500/70 bg-rose-950/20"
                          : "border-border/40 bg-card/25"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs truncate">{p.name}</span>
                        <Badge variant="outline" className="text-[8px] font-mono">
                          {p.dbType}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-[10px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Phase 1 Vote:</span>
                          <span
                            className={`font-bold ${
                              isVoteCommit
                                ? "text-emerald-400"
                                : isVoteAbort
                                ? "text-rose-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {p.phase1Vote}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Phase 2 State:</span>
                          <span
                            className={`font-bold ${
                              isCommitted
                                ? "text-emerald-400"
                                : isAborted
                                ? "text-rose-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {p.phase2Status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Telemetry HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Consistency Guarantee</span>
              <span className="text-base font-bold text-indigo-400">
                {mode === "SAGA" ? "Eventual Consistency" : "Strict Linearizable ACID"}
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Locking Mode</span>
              <span className="text-base font-bold text-emerald-400">
                {mode === "SAGA" ? "Lock-Free (Semantic)" : "Distributed 2-Phase Locking"}
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Participant Nodes</span>
              <span className="text-base font-bold text-cyan-400">
                {mode === "SAGA" ? "4 Microservices" : "3 Database Shards"}
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Recovery Mechanism</span>
              <span className="text-base font-bold text-amber-400">
                {mode === "SAGA" ? "Compensating Transactions" : "WAL Replay / Abort Rollback"}
              </span>
            </div>
          </div>

          {/* Transaction Log Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                Distributed Coordinator Audit Log (WAL):
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">Consensus Stream</span>
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
