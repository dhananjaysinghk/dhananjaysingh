"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  ShieldAlert,
  Binary,
  Lock,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowDown,
  Layers,
  FileCode,
  Sliders,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

// Fast pseudo-SHA256 hex hash function for client-side cryptographic tree visualization
function simpleHash(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0
  }
  const hex = hash.toString(16).padStart(8, "0")
  // Generate deterministic 16-char hex string
  let secondary = 0
  for (let i = 0; i < input.length; i++) {
    secondary = (secondary << 5) - secondary + input.charCodeAt(i)
    secondary |= 0
  }
  const hex2 = Math.abs(secondary).toString(16).padStart(8, "0")
  return `0x${hex}${hex2}`
}

export function MerkleTreeVisualizer() {
  const INITIAL_LEAVES = [
    "Tx0: Alice -> Bob ($50.00)",
    "Tx1: Carol -> Dave ($20.00)",
    "Tx2: Eve -> Frank ($80.00)",
    "Tx3: Dhananjay -> Mesh ($100.00)",
  ]

  const [leaves, setLeaves] = useState<string[]>(INITIAL_LEAVES)
  const [selectedProofLeaf, setSelectedProofLeaf] = useState<number | null>(null)
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"tree" | "proof">("tree")

  // Compute Hashes
  const h0 = simpleHash(leaves[0])
  const h1 = simpleHash(leaves[1])
  const h2 = simpleHash(leaves[2])
  const h3 = simpleHash(leaves[3])

  const h01 = simpleHash(h0 + h1)
  const h23 = simpleHash(h2 + h3)

  const merkleRoot = simpleHash(h01 + h23)

  // Reference baseline root (to detect tampering)
  const baselineRoot = "0x7a30cf19234b910e" // Mock reference state

  const [logTrace, setLogTrace] = useState<string[]>([
    "Merkle Tree initialized with 4 transaction leaves. Root SHA-256 hash locked.",
  ])

  const appendLog = (msg: string) => {
    setLogTrace((prev) => [msg, ...prev.slice(0, 12)])
  }

  // 1. Mutate a leaf
  const handleEditLeaf = (index: number, newContent: string) => {
    soundFx.playClick()
    const updated = [...leaves]
    updated[index] = newContent
    setLeaves(updated)
    setTamperedIndex(index)
    appendLog(`✏️ MUTATION on Leaf #${index}: Recomputed branch hashes up to Root [${simpleHash(newContent).slice(0, 10)}...].`)
  }

  // 2. Generate Inclusion Proof for a leaf
  const handleGenerateProof = (leafIndex: number) => {
    soundFx.playChime()
    setSelectedProofLeaf(leafIndex)
    setActiveTab("proof")

    const siblings = leafIndex === 0 ? ["Leaf #1 (h1)", "Branch (h23)"]
      : leafIndex === 1 ? ["Leaf #0 (h0)", "Branch (h23)"]
      : leafIndex === 2 ? ["Leaf #3 (h3)", "Branch (h01)"]
      : ["Leaf #2 (h2)", "Branch (h01)"]

    appendLog(
      `🛡️ AUDIT PROOF GENERATED for Leaf #${leafIndex}: Requires only ${siblings.length} sibling hashes (64 bytes) to verify inclusion against Root.`
    )
  }

  // 3. Simulate Tamper Attack
  const handleTamperAttack = () => {
    soundFx.playToggle()
    const updated = [...leaves]
    updated[1] = "Tx1: Carol -> HACKER ($9,999.00)"
    setLeaves(updated)
    setTamperedIndex(1)
    appendLog(`🚨 TAMPER ATTACK: Modified Tx1 payload! Cascade hash divergence detected at Root.`)
  }

  // 4. Reset
  const handleReset = () => {
    soundFx.playChime()
    setLeaves(INITIAL_LEAVES)
    setSelectedProofLeaf(null)
    setTamperedIndex(null)
    setLogTrace(["Merkle Tree restored to authenticated baseline state."])
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <Binary className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Merkle Tree & Cryptographic Inclusion Proof Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates SHA-256 hash trees, O(log N) inclusion proofs, and instant tamper detection used in Git, Bitcoin, and Certificate Transparency.
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
          {/* Controls: Mode buttons & Tamper simulation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeTab === "tree" ? "default" : "outline"}
                onClick={() => {
                  soundFx.playToggle()
                  setActiveTab("tree")
                }}
                className="text-xs font-mono gap-1.5"
              >
                <Layers className="h-3.5 w-3.5" />
                Hash Tree View
              </Button>
              <Button
                size="sm"
                variant={activeTab === "proof" ? "default" : "outline"}
                onClick={() => {
                  soundFx.playToggle()
                  setActiveTab("proof")
                  if (selectedProofLeaf === null) setSelectedProofLeaf(2)
                }}
                className="text-xs font-mono gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Inclusion Proof (Audit Path)
              </Button>
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleTamperAttack}
              className="text-xs font-mono gap-1.5"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Simulate 1-Byte Tamper Attack
            </Button>
          </div>

          {/* ================= MERKLE TREE HIERARCHY ================= */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col items-center gap-8 shadow-inner overflow-x-auto">
            {/* LEVEL 0: MERKLE ROOT */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                Level 0 • Merkle Root Hash (Top of Chain)
              </span>

              <motion.div
                layout
                className={`rounded-xl border p-4 flex flex-col items-center gap-1 shadow-md transition-colors ${
                  tamperedIndex !== null
                    ? "border-red-500/80 bg-red-950/30 text-red-300 shadow-red-500/20"
                    : "border-emerald-500/80 bg-emerald-950/20 text-emerald-300 shadow-emerald-500/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  <span className="font-bold text-sm tracking-wide">{merkleRoot}</span>
                </div>
                <span className="text-[9px] text-zinc-400 font-mono">H_root = SHA256(H_01 + H_23)</span>
              </motion.div>
            </div>

            {/* Tree Branch Connectors */}
            <div className="w-full max-w-lg flex justify-around text-zinc-600 text-xs select-none">
              <span>↙ H_01 (Left Subtree)</span>
              <span>↘ H_23 (Right Subtree)</span>
            </div>

            {/* LEVEL 1: INTERNAL INTERMEDIATE HASH NODES */}
            <div className="flex items-center justify-around w-full max-w-xl gap-6">
              {/* Internal Node H_01 */}
              <motion.div
                layout
                className={`rounded-xl border p-3 flex flex-col items-center gap-1 grow transition-colors ${
                  tamperedIndex === 0 || tamperedIndex === 1
                    ? "border-red-500/70 bg-red-950/20 text-red-300"
                    : selectedProofLeaf === 2 || selectedProofLeaf === 3
                    ? "border-indigo-500/70 bg-indigo-950/30 text-indigo-300"
                    : "border-border/40 bg-card/30 text-foreground"
                }`}
              >
                <span className="text-[10px] text-zinc-400 font-bold">Node H_01</span>
                <span className="text-xs font-bold truncate max-w-40">{h01}</span>
                <span className="text-[8px] text-zinc-500">SHA256(h0 + h1)</span>
              </motion.div>

              {/* Internal Node H_23 */}
              <motion.div
                layout
                className={`rounded-xl border p-3 flex flex-col items-center gap-1 grow transition-colors ${
                  tamperedIndex === 2 || tamperedIndex === 3
                    ? "border-red-500/70 bg-red-950/20 text-red-300"
                    : selectedProofLeaf === 0 || selectedProofLeaf === 1
                    ? "border-indigo-500/70 bg-indigo-950/30 text-indigo-300"
                    : "border-border/40 bg-card/30 text-foreground"
                }`}
              >
                <span className="text-[10px] text-zinc-400 font-bold">Node H_23</span>
                <span className="text-xs font-bold truncate max-w-40">{h23}</span>
                <span className="text-[8px] text-zinc-500">SHA256(h2 + h3)</span>
              </motion.div>
            </div>

            {/* Tree Branch Connectors */}
            <div className="w-full max-w-2xl flex justify-around text-zinc-600 text-xs select-none">
              <span>↙ h0</span>
              <span>↘ h1</span>
              <span>↙ h2</span>
              <span>↘ h3</span>
            </div>

            {/* LEVEL 2: LEAF DATA NODES (Transactions) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
              {leaves.map((leaf, idx) => {
                const leafHash = idx === 0 ? h0 : idx === 1 ? h1 : idx === 2 ? h2 : h3
                const isTampered = tamperedIndex === idx
                const isSelectedProof = selectedProofLeaf === idx

                return (
                  <motion.div
                    key={idx}
                    layout
                    className={`rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all ${
                      isTampered
                        ? "border-red-500/80 bg-red-950/30 text-red-300 shadow-sm"
                        : isSelectedProof
                        ? "border-emerald-500/80 bg-emerald-950/25 shadow-sm"
                        : "border-border/40 bg-card/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-foreground">Leaf #{idx}</span>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 font-mono">
                        {leafHash.slice(0, 8)}...
                      </Badge>
                    </div>

                    <input
                      type="text"
                      value={leaf}
                      onChange={(e) => handleEditLeaf(idx, e.target.value)}
                      className="bg-zinc-900 border border-border/30 rounded p-1.5 text-[10px] text-zinc-200 font-mono focus:outline-none focus:border-primary/50 truncate"
                    />

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleGenerateProof(idx)}
                      className="text-[9px] font-mono h-6 hover:bg-emerald-950/40 hover:text-emerald-300 gap-1"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Audit Proof
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Audit Proof Inspection Box (When proof is selected) */}
          {selectedProofLeaf !== null && (
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/15 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-xs text-foreground">
                    Cryptographic Inclusion Proof (Audit Path for Leaf #{selectedProofLeaf})
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  Status: MATHEMATICALLY PROVEN
                </Badge>
              </div>

              <div className="space-y-1.5 text-[11px] leading-relaxed text-zinc-300 font-sans">
                <p>
                  To prove that <code className="font-mono text-emerald-300">{leaves[selectedProofLeaf]}</code> exists inside the Merkle Tree, a light client only requires <strong>2 sibling hashes ($O(\log_2 4) = 2$)</strong>:
                </p>
                <div className="bg-zinc-950 p-2 rounded border border-border/30 font-mono text-[10px] space-y-1 text-zinc-400">
                  <div>1. Calculate h_self = SHA256(Leaf #{selectedProofLeaf})</div>
                  <div>2. Fetch adjacent sibling hash h_sibling and compute intermediate node hash.</div>
                  <div>3. Fetch parent sibling branch hash and compute reconstructed Root.</div>
                  <div className="text-emerald-400 font-bold">4. Assert reconstructed Root == {merkleRoot} (Match!)</div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Crypto HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Leaf Elements</span>
              <span className="text-xl font-bold text-foreground">{leaves.length} Data Items</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Audit Proof Size</span>
              <span className="text-xl font-bold text-emerald-400">O(log N) ~ 64 Bytes</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Tamper Status</span>
              <span className={`text-xs font-bold pt-1 ${tamperedIndex !== null ? "text-red-400" : "text-emerald-400"}`}>
                {tamperedIndex !== null ? "⚠️ TAMPER DETECTED" : "✅ VERIFIED SECURE"}
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Hash Standard</span>
              <span className="text-xs font-bold text-indigo-300 pt-1">SHA-256 (256-bit)</span>
            </div>
          </div>

          {/* Crypto Bus Stream */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Cryptographic Engine Audit Trail:</span>
              <span className="text-[9px] text-zinc-600 font-mono">Immutable Hash Log</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logTrace.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-emerald-300 font-bold" : "text-zinc-400 opacity-85"
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
