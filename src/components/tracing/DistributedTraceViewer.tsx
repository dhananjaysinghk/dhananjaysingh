"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Server,
  Zap,
  Radio,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  FileCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface TraceSpan {
  id: string
  parentId: string | null
  service: string
  operation: string
  startTimeMs: number
  durationMs: number
  status: "ok" | "error" | "warning"
  serviceColor: string
  tags: Record<string, string>
  events: Array<{ timeMs: number; name: string }>
}

interface TraceScenario {
  id: string
  name: string
  totalDurationMs: number
  description: string
  spans: TraceSpan[]
}

const SCENARIOS: TraceScenario[] = [
  {
    id: "checkout_fast",
    name: "Standard Checkout Flow (200 OK • 52ms)",
    totalDurationMs: 52,
    description: "Optimal distributed transaction path with Redis session cache hit, non-blocking DB write, and async Kafka event publishing.",
    spans: [
      {
        id: "span_1",
        parentId: null,
        service: "api-gateway",
        operation: "POST /v1/checkout",
        startTimeMs: 0,
        durationMs: 52,
        status: "ok",
        serviceColor: "text-indigo-400 border-indigo-500/40 bg-indigo-950/20",
        tags: { "http.method": "POST", "http.status_code": "200", "net.peer.ip": "172.56.21.9" },
        events: [
          { timeMs: 1, name: "TLS 1.3 Handshake completed" },
          { timeMs: 4, name: "Rate limit token consumed (Bucket OK)" },
        ],
      },
      {
        id: "span_2",
        parentId: "span_1",
        service: "auth-service",
        operation: "gRPC ValidateSession",
        startTimeMs: 5,
        durationMs: 12,
        status: "ok",
        serviceColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/20",
        tags: { "rpc.service": "Auth.SessionValidator", "cache.hit": "true" },
        events: [{ timeMs: 8, name: "Redis L1 JWT Token Verified" }],
      },
      {
        id: "span_3",
        parentId: "span_1",
        service: "order-service",
        operation: "POST /internal/orders/create",
        startTimeMs: 18,
        durationMs: 32,
        status: "ok",
        serviceColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/20",
        tags: { "order.id": "ord_99014", "user.tier": "enterprise" },
        events: [{ timeMs: 20, name: "Saga transaction started" }],
      },
      {
        id: "span_4",
        parentId: "span_3",
        service: "postgres-cluster",
        operation: "SQL INSERT INTO orders",
        startTimeMs: 22,
        durationMs: 14,
        status: "ok",
        serviceColor: "text-amber-400 border-amber-500/40 bg-amber-950/20",
        tags: { "db.system": "postgresql", "db.statement": "INSERT INTO orders (id, amount) VALUES ($1, $2)" },
        events: [{ timeMs: 25, name: "WAL flush committed (L0)" }],
      },
      {
        id: "span_5",
        parentId: "span_3",
        service: "kafka-event-bus",
        operation: "PRODUCE topic:order.created",
        startTimeMs: 38,
        durationMs: 10,
        status: "ok",
        serviceColor: "text-purple-400 border-purple-500/40 bg-purple-950/20",
        tags: { "messaging.destination": "order.created", "messaging.partition": "2" },
        events: [{ timeMs: 44, name: "Leader replica ACK (acks=all)" }],
      },
    ],
  },
  {
    id: "db_lock_bottleneck",
    name: "PostgreSQL Row Lock Contention (840ms Bottleneck)",
    totalDurationMs: 840,
    description: "Downstream database transaction suffers lock wait timeouts on hot inventory rows, degrading end-to-end API response time.",
    spans: [
      {
        id: "span_10",
        parentId: null,
        service: "api-gateway",
        operation: "POST /v1/inventory/reserve",
        startTimeMs: 0,
        durationMs: 840,
        status: "warning",
        serviceColor: "text-indigo-400 border-indigo-500/40 bg-indigo-950/20",
        tags: { "http.method": "POST", "http.status_code": "200 (Degraded)", "latency.sla": "BREACHED (>500ms)" },
        events: [{ timeMs: 2, name: "Ingress proxy dispatch" }],
      },
      {
        id: "span_11",
        parentId: "span_10",
        service: "inventory-service",
        operation: "RPC ReserveStock",
        startTimeMs: 15,
        durationMs: 820,
        status: "warning",
        serviceColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/20",
        tags: { "stock.sku": "SKU_GPU_RTX5090", "warehouse.region": "us-west" },
        events: [{ timeMs: 25, name: "Acquiring row lock..." }],
      },
      {
        id: "span_12",
        parentId: "span_11",
        service: "postgres-cluster",
        operation: "SQL SELECT FOR UPDATE stock_items",
        startTimeMs: 30,
        durationMs: 800,
        status: "warning",
        serviceColor: "text-amber-400 border-amber-500/40 bg-amber-950/20",
        tags: { "db.system": "postgresql", "db.lock_wait_ms": "775ms", "db.contention": "HIGH" },
        events: [
          { timeMs: 35, name: "Lock wait queue position #4" },
          { timeMs: 810, name: "Lock acquired after blocking transaction commit" },
        ],
      },
    ],
  },
  {
    id: "circuit_breaker_fail",
    name: "Payment Gateway 504 Timeout & Circuit Breaker Trip",
    totalDurationMs: 310,
    description: "Third-party payment provider outage causes cascading gRPC timeouts, triggering automatic upstream circuit breaker state transition (CLOSED -> OPEN).",
    spans: [
      {
        id: "span_20",
        parentId: null,
        service: "api-gateway",
        operation: "POST /v1/payments/charge",
        startTimeMs: 0,
        durationMs: 310,
        status: "error",
        serviceColor: "text-indigo-400 border-indigo-500/40 bg-indigo-950/20",
        tags: { "http.status_code": "504 Gateway Timeout", "error": "true" },
        events: [{ timeMs: 305, name: "Emitted error response to client" }],
      },
      {
        id: "span_21",
        parentId: "span_20",
        service: "payment-service",
        operation: "HTTP Outbound Stripe API",
        startTimeMs: 10,
        durationMs: 295,
        status: "error",
        serviceColor: "text-pink-400 border-pink-500/40 bg-pink-950/20",
        tags: { "net.peer.name": "api.stripe.com", "circuit_breaker.state": "TRIPPED_OPEN", "error.message": "ETIMEDOUT after 3 retries" },
        events: [
          { timeMs: 100, name: "Retry #1 timeout" },
          { timeMs: 200, name: "Retry #2 timeout" },
          { timeMs: 290, name: "Circuit Breaker OPENED: Short-circuiting future requests" },
        ],
      },
    ],
  },
]

export function DistributedTraceViewer() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("checkout_fast")
  const [selectedSpan, setSelectedSpan] = useState<TraceSpan | null>(null)

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0]

  const handleSelectScenario = (id: string) => {
    soundFx.playToggle()
    setSelectedScenarioId(id)
    setSelectedSpan(null)
  }

  const handleSelectSpan = (span: TraceSpan) => {
    soundFx.playClick()
    setSelectedSpan(span)
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Distributed OpenTelemetry Waterfall & Trace Profiler
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates microservice request propagation, OpenTelemetry spans, latency waterfall timelines, and circuit breaker trip points.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono border-indigo-500/30 text-indigo-300">
              Trace ID: 4bf92f3577b34da6
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-8 font-mono">
          {/* Scenario Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border/20 pb-4">
            {SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono transition-all border ${
                    isSelected
                      ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/10"
                      : "bg-card/30 text-muted-foreground border-border/30 hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <Radio className={`h-3.5 w-3.5 ${isSelected ? "text-indigo-400 animate-pulse" : "text-zinc-500"}`} />
                  <span className="font-semibold">{sc.name}</span>
                </button>
              )
            })}
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border/30 bg-card/20 p-3.5 flex items-start gap-2.5 text-zinc-300">
            <Layers className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs font-sans leading-relaxed text-muted-foreground">
              {activeScenario.description}
            </p>
          </div>

          {/* ================= GANTT WATERFALL TIMELINE ================= */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-border/20 pb-2">
              <span className="w-1/3">SERVICE & OPERATION</span>
              <span className="w-2/3 flex justify-between">
                <span>0ms</span>
                <span>{(activeScenario.totalDurationMs * 0.25).toFixed(0)}ms</span>
                <span>{(activeScenario.totalDurationMs * 0.5).toFixed(0)}ms</span>
                <span>{(activeScenario.totalDurationMs * 0.75).toFixed(0)}ms</span>
                <span>{activeScenario.totalDurationMs}ms</span>
              </span>
            </div>

            {/* Spans List */}
            <div className="flex flex-col gap-2">
              {activeScenario.spans.map((span, idx) => {
                const isSelected = selectedSpan?.id === span.id
                const startPct = (span.startTimeMs / activeScenario.totalDurationMs) * 100
                const widthPct = Math.max((span.durationMs / activeScenario.totalDurationMs) * 100, 4)
                const indent = span.parentId ? "pl-6" : "pl-0"

                return (
                  <div
                    key={span.id}
                    onClick={() => handleSelectSpan(span)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-muted/80 border-indigo-500/80 shadow-sm"
                        : "bg-card/30 border-border/30 hover:border-border/60 hover:bg-card/50"
                    }`}
                  >
                    {/* Left Column: Service & Operation */}
                    <div className={`w-1/3 flex items-center gap-2 truncate ${indent}`}>
                      {span.status === "ok" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : span.status === "warning" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 animate-pulse" />
                      )}

                      <div className="flex flex-col truncate">
                        <span className="font-bold text-foreground text-xs truncate">{span.service}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{span.operation}</span>
                      </div>
                    </div>

                    {/* Right Column: Waterfall Gantt Bar */}
                    <div className="w-2/3 relative h-6 bg-zinc-950/60 rounded-lg overflow-hidden border border-border/20 flex items-center px-1">
                      <motion.div
                        layout
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: `${widthPct}%`, left: `${startPct}%` }}
                        transition={{ duration: 0.3 }}
                        className={`absolute h-4 rounded-md border flex items-center px-2 text-[9px] font-bold truncate ${span.serviceColor}`}
                      >
                        {span.durationMs}ms
                      </motion.div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Span Details Drawer (When a span is selected) */}
          <AnimatePresence>
            {selectedSpan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-xl border border-indigo-500/40 bg-indigo-950/15 p-5 space-y-4 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{selectedSpan.service}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {selectedSpan.operation}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-400">
                      Duration: {selectedSpan.durationMs}ms
                    </Badge>
                    <button
                      onClick={() => setSelectedSpan(null)}
                      className="text-zinc-500 hover:text-foreground text-xs"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* OpenTelemetry Semantic Attributes */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold">OpenTelemetry Attributes (Tags):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(selectedSpan.tags).map(([k, v]) => (
                      <div key={k} className="p-1.5 rounded bg-card/40 border border-border/20 flex items-center justify-between">
                        <span className="text-zinc-400 font-mono">{k}:</span>
                        <span className="text-foreground font-semibold truncate max-w-45">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In-Span Event Logs */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold">Span Timeline Events:</span>
                  <div className="space-y-1 bg-zinc-950 p-2.5 rounded-lg border border-border/30 text-[10px] text-zinc-300">
                    {selectedSpan.events.map((evt, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span>{`> ${evt.name}`}</span>
                        <span className="text-zinc-500">+{evt.timeMs}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Total Latency</span>
              <span className="text-xl font-bold text-indigo-400">{activeScenario.totalDurationMs}ms</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Total Spans</span>
              <span className="text-xl font-bold text-emerald-400">{activeScenario.spans.length}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Bottleneck Layer</span>
              <span className="text-xs font-bold text-amber-300 pt-1 truncate">
                {activeScenario.spans.reduce((max, s) => (s.durationMs > max.durationMs ? s : max)).service}
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Trace Context</span>
              <span className="text-xs font-bold text-cyan-300 pt-1">W3C TraceContext (00-)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
