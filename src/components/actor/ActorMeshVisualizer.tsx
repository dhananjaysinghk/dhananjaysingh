"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Shield,
  Zap,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Play,
  Flame,
  Radio,
  Send,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface ActorNode {
  id: string
  name: string
  role: "supervisor" | "worker"
  parentId?: string
  status: "IDLE" | "PROCESSING" | "CRASHED" | "RESTARTING"
  mailbox: string[]
  processedCount: number
  restartCount: number
  stateSummary: string
}

type SupervisionStrategy = "OneForOne" | "AllForOne"

export function ActorMeshVisualizer() {
  const [strategy, setStrategy] = useState<SupervisionStrategy>("OneForOne")
  const [deadLetterQueue, setDeadLetterQueue] = useState<string[]>([])
  
  const [actors, setActors] = useState<ActorNode[]>([
    {
      id: "root",
      name: "RootSupervisor",
      role: "supervisor",
      status: "IDLE",
      mailbox: [],
      processedCount: 142,
      restartCount: 0,
      stateSummary: "Cluster Health: OK (MaxRestarts=5/10s)",
    },
    {
      id: "order-sup",
      name: "OrderSupervisor",
      role: "supervisor",
      parentId: "root",
      status: "IDLE",
      mailbox: [],
      processedCount: 98,
      restartCount: 0,
      stateSummary: "Managing [Payment, Inventory]",
    },
    {
      id: "payment",
      name: "PaymentWorker",
      role: "worker",
      parentId: "order-sup",
      status: "IDLE",
      mailbox: ["ChargeCard($120)", "VerifyStripeToken()"],
      processedCount: 45,
      restartCount: 0,
      stateSummary: "Balance: $4,520 (Active)",
    },
    {
      id: "inventory",
      name: "InventoryWorker",
      role: "worker",
      parentId: "order-sup",
      status: "IDLE",
      mailbox: ["DeductStock(SKU-902, qty: 1)"],
      processedCount: 53,
      restartCount: 0,
      stateSummary: "ReservedItems: 12",
    },
    {
      id: "notify-sup",
      name: "NotifySupervisor",
      role: "supervisor",
      parentId: "root",
      status: "IDLE",
      mailbox: [],
      processedCount: 44,
      restartCount: 0,
      stateSummary: "Managing [Email, Push]",
    },
    {
      id: "email",
      name: "EmailWorker",
      role: "worker",
      parentId: "notify-sup",
      status: "IDLE",
      mailbox: ["SendReceipt(order_88)"],
      processedCount: 22,
      restartCount: 0,
      stateSummary: "SMTP Queue: 0 pending",
    },
    {
      id: "push",
      name: "PushWorker",
      role: "worker",
      parentId: "notify-sup",
      status: "IDLE",
      mailbox: [],
      processedCount: 22,
      restartCount: 0,
      stateSummary: "APNS Socket: Connected",
    },
  ])

  const [eventLogs, setEventLogs] = useState<string[]>([
    "Erlang/OTP Actor Supervision Tree initialized. Mailbox queues active.",
  ])

  const appendLog = (msg: string) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 12)])
  }

  // 1. Dispatch Asynchronous Message (Tell Pattern ! )
  const handleDispatchMessage = (targetActorId: string, messageText: string) => {
    soundFx.playClick()
    setActors((prev) =>
      prev.map((actor) => {
        if (actor.id === targetActorId) {
          if (actor.status === "CRASHED") {
            appendLog(`🚨 DEAD LETTER: Message '${messageText}' routed to DLQ because Actor '${actor.name}' is CRASHED.`)
            setDeadLetterQueue((dlq) => [messageText, ...dlq.slice(0, 6)])
            return actor
          }
          appendLog(`📨 TELL: Dispatched message '${messageText}' to mailbox of '${actor.name}' (Async Non-blocking).`)
          return {
            ...actor,
            mailbox: [...actor.mailbox, messageText],
          }
        }
        return actor
      })
    )
  }

  // 2. Process Next Message in Mailbox
  const handleProcessMessage = (actorId: string) => {
    soundFx.playChime()
    setActors((prev) =>
      prev.map((actor) => {
        if (actor.id === actorId) {
          if (actor.mailbox.length === 0) {
            appendLog(`⚠️ Mailbox of '${actor.name}' is empty. Nothing to process.`)
            return actor
          }
          const [currentMsg, ...remaining] = actor.mailbox
          appendLog(`⚡ PROCESS: Actor '${actor.name}' consumed message '${currentMsg}' from FIFO mailbox.`)
          return {
            ...actor,
            mailbox: remaining,
            processedCount: actor.processedCount + 1,
            status: "PROCESSING",
          }
        }
        return actor
      })
    )

    setTimeout(() => {
      setActors((prev) =>
        prev.map((actor) => (actor.id === actorId ? { ...actor, status: "IDLE" } : actor))
      )
    }, 400)
  }

  // 3. Inject Fault / Panic Crash
  const handleCrashActor = (actorId: string) => {
    soundFx.playToggle()
    const target = actors.find((a) => a.id === actorId)
    if (!target) return

    appendLog(`💥 CRASH PANIC: Actor '${target.name}' crashed with unhandled exception (Signal SIGSEGV / Panic)!`)

    // Mark as crashed
    setActors((prev) =>
      prev.map((a) => (a.id === actorId ? { ...a, status: "CRASHED" } : a))
    )

    // Trigger Supervision Strategy Restart after 700ms
    setTimeout(() => {
      soundFx.playChime()
      if (strategy === "OneForOne") {
        appendLog(`🛡️ SUPERVISOR (${target.parentId}): Applying 'OneForOne' strategy -> Restarting ONLY '${target.name}'.`)
        setActors((prev) =>
          prev.map((a) =>
            a.id === actorId
              ? {
                  ...a,
                  status: "IDLE",
                  restartCount: a.restartCount + 1,
                  stateSummary: "Recovered via Initial State Replenish",
                }
              : a
          )
        )
      } else {
        // AllForOne: Restart all siblings under the same supervisor
        appendLog(`🛡️ SUPERVISOR (${target.parentId}): Applying 'AllForOne' strategy -> Restarting ALL sibling actors under supervisor!`)
        setActors((prev) =>
          prev.map((a) =>
            a.parentId === target.parentId || a.id === actorId
              ? {
                  ...a,
                  status: "IDLE",
                  restartCount: a.restartCount + 1,
                  stateSummary: "Reinitialized via AllForOne Cascade",
                }
              : a
          )
        )
      }
    }, 800)
  }

  // 4. Reset All
  const handleReset = () => {
    soundFx.playChime()
    setDeadLetterQueue([])
    setActors([
      {
        id: "root",
        name: "RootSupervisor",
        role: "supervisor",
        status: "IDLE",
        mailbox: [],
        processedCount: 142,
        restartCount: 0,
        stateSummary: "Cluster Health: OK (MaxRestarts=5/10s)",
      },
      {
        id: "order-sup",
        name: "OrderSupervisor",
        role: "supervisor",
        parentId: "root",
        status: "IDLE",
        mailbox: [],
        processedCount: 98,
        restartCount: 0,
        stateSummary: "Managing [Payment, Inventory]",
      },
      {
        id: "payment",
        name: "PaymentWorker",
        role: "worker",
        parentId: "order-sup",
        status: "IDLE",
        mailbox: ["ChargeCard($120)", "VerifyStripeToken()"],
        processedCount: 45,
        restartCount: 0,
        stateSummary: "Balance: $4,520 (Active)",
      },
      {
        id: "inventory",
        name: "InventoryWorker",
        role: "worker",
        parentId: "order-sup",
        status: "IDLE",
        mailbox: ["DeductStock(SKU-902, qty: 1)"],
        processedCount: 53,
        restartCount: 0,
        stateSummary: "ReservedItems: 12",
      },
      {
        id: "notify-sup",
        name: "NotifySupervisor",
        role: "supervisor",
        parentId: "root",
        status: "IDLE",
        mailbox: [],
        processedCount: 44,
        restartCount: 0,
        stateSummary: "Managing [Email, Push]",
      },
      {
        id: "email",
        name: "EmailWorker",
        role: "worker",
        parentId: "notify-sup",
        status: "IDLE",
        mailbox: ["SendReceipt(order_88)"],
        processedCount: 22,
        restartCount: 0,
        stateSummary: "SMTP Queue: 0 pending",
      },
      {
        id: "push",
        name: "PushWorker",
        role: "worker",
        parentId: "notify-sup",
        status: "IDLE",
        mailbox: [],
        processedCount: 22,
        restartCount: 0,
        stateSummary: "APNS Socket: Connected",
      },
    ])
    setEventLogs(["Actor Supervision Tree restored to baseline state."])
  }

  const totalRestarts = actors.reduce((acc, a) => acc + a.restartCount, 0)
  const totalMessagesProcessed = actors.reduce((acc, a) => acc + a.processedCount, 0)

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Distributed Actor Model & Fault-Tolerant Supervision Tree
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates asynchronous message passing (Tell pattern), isolated state mailboxes, and Erlang/OTP &apos;Let It Crash&apos; supervision trees.
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
          {/* Controls Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Quick Dispatch Controls */}
            <div className="lg:col-span-7 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-purple-400" />
                Asynchronous Mailbox Dispatch & Fault Injection
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    handleDispatchMessage("payment", `AuthorizePayment($${Math.floor(Math.random() * 200 + 20)})`)
                  }
                  className="text-xs font-mono gap-1 bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                  Dispatch Payment Msg
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProcessMessage("payment")}
                  className="text-xs font-mono gap-1 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/20"
                >
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  Process Payment Mailbox
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleCrashActor("payment")}
                  className="text-[10px] font-mono gap-1 border-rose-500/40 text-rose-300 hover:bg-rose-950/20"
                >
                  <Flame className="h-3 w-3 text-rose-400" />
                  Crash Payment Worker (Panic)
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleCrashActor("inventory")}
                  className="text-[10px] font-mono gap-1 border-amber-500/40 text-amber-300 hover:bg-amber-950/20"
                >
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  Crash Inventory Worker (OOM)
                </Button>
              </div>
            </div>

            {/* Strategy Selector */}
            <div className="lg:col-span-5 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                Supervision Recovery Strategy
              </span>

              <div className="flex gap-2">
                {(["OneForOne", "AllForOne"] as SupervisionStrategy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      soundFx.playClick()
                      setStrategy(s)
                      appendLog(`Supervision recovery strategy switched to ${s}.`)
                    }}
                    className={`flex-1 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      strategy === s
                        ? "bg-purple-500 text-purple-950 font-bold shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                {strategy === "OneForOne"
                  ? "OneForOne: If a child actor crashes, only that specific actor is restarted. Siblings continue uninterrupted."
                  : "AllForOne: If any child actor crashes, all sibling actors supervised by the same parent are restarted together."}
              </p>
            </div>
          </div>

          {/* Actor Supervision Tree Visual Hierarchy */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col gap-6 shadow-inner">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                Erlang/OTP Supervision Tree Topology
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Strategy: <strong className="text-purple-300">{strategy}</strong>
              </span>
            </div>

            {/* Tree Nodes Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actors.map((actor) => {
                const isCrashed = actor.status === "CRASHED"
                const isProcessing = actor.status === "PROCESSING"
                const isSupervisor = actor.role === "supervisor"

                return (
                  <motion.div
                    key={actor.id}
                    layout
                    className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all ${
                      isCrashed
                        ? "border-rose-500/80 bg-rose-950/30 ring-1 ring-rose-500/50 shadow-md shadow-rose-500/10"
                        : isProcessing
                        ? "border-emerald-500 bg-emerald-950/20 shadow-md"
                        : isSupervisor
                        ? "border-indigo-500/40 bg-indigo-950/20"
                        : "border-border/40 bg-card/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {isSupervisor ? (
                          <Shield className="h-3.5 w-3.5 text-indigo-400" />
                        ) : (
                          <Cpu className="h-3.5 w-3.5 text-purple-400" />
                        )}
                        <span className="font-bold text-foreground truncate">{actor.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[8px] font-mono px-1.5 py-0 ${
                          isCrashed
                            ? "border-rose-500 text-rose-300 bg-rose-950/40"
                            : isProcessing
                            ? "border-emerald-500 text-emerald-300 bg-emerald-950/40"
                            : "border-border/40 text-muted-foreground"
                        }`}
                      >
                        {actor.status}
                      </Badge>
                    </div>

                    {/* Mailbox Status */}
                    <div className="bg-zinc-900/90 p-2 rounded border border-border/20 space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                        <span>Mailbox Queue:</span>
                        <span className="font-bold text-purple-300">{actor.mailbox.length} msgs</span>
                      </div>
                      <div className="text-[10px] text-zinc-300 truncate font-mono">
                        {actor.mailbox.length > 0 ? (
                          <span className="text-emerald-300">{actor.mailbox[0]}</span>
                        ) : (
                          <span className="text-zinc-600">Empty</span>
                        )}
                      </div>
                    </div>

                    {/* Metrics & Restart Count */}
                    <div className="flex items-center justify-between text-[9px] text-zinc-400 border-t border-border/20 pt-2 font-mono">
                      <span>Processed: {actor.processedCount}</span>
                      <span className={actor.restartCount > 0 ? "text-amber-400 font-bold" : "text-zinc-500"}>
                        Restarts: {actor.restartCount}
                      </span>
                    </div>

                    {/* Action buttons on worker */}
                    {!isSupervisor && (
                      <div className="flex gap-1.5 pt-1">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleProcessMessage(actor.id)}
                          disabled={isCrashed || actor.mailbox.length === 0}
                          className="flex-1 text-[9px] font-mono h-6 border-purple-500/40 text-purple-300 hover:bg-purple-950/20"
                        >
                          Step Msg
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleCrashActor(actor.id)}
                          disabled={isCrashed}
                          className="text-[9px] font-mono h-6 border-rose-500/40 text-rose-300 hover:bg-rose-950/20"
                        >
                          Crash
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Telemetry & Dead Letter Queue (DLQ) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Total Processed Msgs</span>
              <span className="text-xl font-bold text-purple-400">{totalMessagesProcessed} Msgs</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Supervisor Restarts</span>
              <span className="text-xl font-bold text-amber-400">{totalRestarts} Restarts</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Dead Letter Queue (DLQ)</span>
              <span className="text-xl font-bold text-rose-400">{deadLetterQueue.length} Dropped</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Concurrency Safety</span>
              <span className="text-xs font-bold text-emerald-400 pt-1">Zero Shared Memory Mutexes</span>
            </div>
          </div>

          {/* Erlang OTP Supervision Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                Erlang/OTP Supervision Report Stream:
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">Actor Message Bus</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {eventLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-purple-300 font-bold" : "text-zinc-400 opacity-85"
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
