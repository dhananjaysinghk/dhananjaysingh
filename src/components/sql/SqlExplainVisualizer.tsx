"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Database, Search, Zap, Layers, Server, Play, FileText, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface QueryScenario {
  id: string
  title: string
  query: string
  unoptimized: {
    plan: string[]
    cost: number
    timeMs: number
    scanType: string
    rowsScanned: number
  }
  optimized: {
    index: string
    plan: string[]
    cost: number
    timeMs: number
    scanType: string
    rowsScanned: number
  }
}

const scenarios: QueryScenario[] = [
  {
    id: "user-lookup",
    title: "Filter by Email Lookup (1M Rows)",
    query: "SELECT id, name, role FROM users WHERE email = 'user_9421@example.com';",
    unoptimized: {
      plan: [
        "-> Seq Scan on users (cost=0.00..18420.00 rows=1 width=48)",
        "   Filter: (email = 'user_9421@example.com')",
        "   Rows Removed by Filter: 999999",
      ],
      cost: 18420,
      timeMs: 42.8,
      scanType: "Sequential Table Scan",
      rowsScanned: 1000000,
    },
    optimized: {
      index: "CREATE UNIQUE INDEX idx_users_email ON users(email);",
      plan: [
        "-> Index Scan using idx_users_email on users (cost=0.42..8.44 rows=1 width=48)",
        "   Index Cond: (email = 'user_9421@example.com')",
        "   Buffers: shared hit=3",
      ],
      cost: 8.44,
      timeMs: 0.04,
      scanType: "B-Tree Index Scan",
      rowsScanned: 1,
    },
  },
  {
    id: "ledger-aggregation",
    title: "Ledger Volume Group By (10M Records)",
    query: "SELECT account_id, SUM(amount_cents) FROM ledger_entries GROUP BY account_id;",
    unoptimized: {
      plan: [
        "-> HashAggregate (cost=195420.00..210420.00 rows=150000 width=16)",
        "   Group Key: account_id",
        "   Planned Partitions: 4 (Spilled to disk)",
        "   -> Seq Scan on ledger_entries (cost=0.00..152400.00 rows=10000000)",
      ],
      cost: 210420,
      timeMs: 380.5,
      scanType: "Disk Hash Aggregate",
      rowsScanned: 10000000,
    },
    optimized: {
      index: "CREATE INDEX idx_ledger_account_amount ON ledger_entries(account_id) INCLUDE (amount_cents);",
      plan: [
        "-> GroupAggregate (cost=0.56..45200.00 rows=150000 width=16)",
        "   Group Key: account_id",
        "   -> Index Only Scan using idx_ledger_account_amount (cost=0.56..38500.00)",
        "   Heap Fetches: 0 (100% Index Only)",
      ],
      cost: 45200,
      timeMs: 14.2,
      scanType: "Covering Index-Only Scan",
      rowsScanned: 150000,
    },
  },
]

export function SqlExplainVisualizer() {
  const [selectedScenario, setSelectedScenario] = useState<QueryScenario>(scenarios[0])
  const [isOptimized, setIsOptimized] = useState<boolean>(true)

  const currentPlan = isOptimized ? selectedScenario.optimized : selectedScenario.unoptimized
  const speedup = (selectedScenario.unoptimized.timeMs / selectedScenario.optimized.timeMs).toFixed(0)

  return (
    <div className="flex flex-col gap-8">
      {/* Scenario Selector */}
      <div className="flex flex-wrap gap-2 border-b border-border/30 pb-4">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => {
              soundFx.playClick()
              setSelectedScenario(sc)
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-mono border transition-all ${
              selectedScenario.id === sc.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/30 bg-card/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            {sc.title}
          </button>
        ))}
      </div>

      {/* Main Analysis Card */}
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                PostgreSQL Query Execution Plan (EXPLAIN ANALYZE)
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates Postgres cost-based optimizer tree nodes and index-only scan memory page buffers.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isOptimized ? "default" : "outline"}
              onClick={() => {
                soundFx.playToggle()
                setIsOptimized(!isOptimized)
              }}
              className="text-xs font-mono gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              {isOptimized ? "B-Tree Index Applied" : "Unindexed (Raw Table Scan)"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-6 font-mono text-xs">
          {/* SQL Query Box */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2">
            <span className="text-[10px] text-zinc-500 uppercase">Target SQL Query:</span>
            <code className="text-indigo-300 font-semibold text-xs sm:text-sm">
              {selectedScenario.query}
            </code>
            {isOptimized && (
              <div className="pt-2 border-t border-zinc-800 text-[11px] text-emerald-400">
                Index DDL: <code>{selectedScenario.optimized.index}</code>
              </div>
            )}
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Scan Strategy</span>
              <span className="text-sm font-bold text-foreground truncate">{currentPlan.scanType}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Optimizer Cost</span>
              <span className="text-lg font-bold text-purple-400">{currentPlan.cost.toLocaleString()}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Execution Time</span>
              <span className={`text-lg font-bold ${isOptimized ? "text-emerald-400" : "text-amber-400"}`}>
                {currentPlan.timeMs} ms
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Rows Scanned</span>
              <span className="text-lg font-bold text-indigo-400">{currentPlan.rowsScanned.toLocaleString()}</span>
            </div>
          </div>

          {/* Execution Plan Tree */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] text-zinc-500 uppercase">
              <span>PostgreSQL EXPLAIN Tree Nodes</span>
              <span className="text-emerald-400 font-bold">{isOptimized ? `~${speedup}x Faster Execution` : "Baseline Unindexed"}</span>
            </div>
            <div className="space-y-1.5 py-1">
              {currentPlan.plan.map((line, idx) => (
                <div
                  key={idx}
                  className={`text-xs ${
                    idx === 0
                      ? isOptimized
                        ? "text-emerald-300 font-semibold"
                        : "text-amber-300 font-semibold"
                      : "text-zinc-400"
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
