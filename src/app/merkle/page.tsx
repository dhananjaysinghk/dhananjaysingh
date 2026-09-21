import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { MerkleTreeVisualizer } from "@/components/merkle/MerkleTreeVisualizer"
import { Binary, ShieldCheck, Lock, Layers, Cpu } from "lucide-react"

export const metadata: Metadata = {
  title: "Merkle Tree & Cryptographic Inclusion Proof Simulator | Dhananjay Singh",
  description:
    "Interactive SHA-256 Merkle Tree simulator exploring binary hash trees, O(log N) cryptographic inclusion proofs, and tamper-evident data integrity verification across Git, blockchains, and distributed filesystems.",
}

export default function MerklePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Binary className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Applied Cryptography
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Merkle Tree & Inclusion Proof Simulator
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Discover how tamper-evident hash trees secure Git commit histories, Bitcoin SPV light clients, and Cassandra anti-entropy repairs. Simulate 1-byte data tampering and compute concise $O(\log N)$ cryptographic audit proofs.
        </p>
      </ScrollReveal>

      {/* Main Simulator */}
      <ScrollReveal delay={0.05}>
        <MerkleTreeVisualizer />
      </ScrollReveal>

      {/* Cryptographic Pillars */}
      <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-sm">
            <Lock className="h-4 w-4" />
            <span>Cryptographic Hashing</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Cryptographic hash functions like SHA-256 exhibit the avalanche effect: changing a single bit in a leaf payload completely alters the resulting 256-bit digest, propagating divergence all the way to the Merkle Root.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold font-heading text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>O(log N) Inclusion Proofs</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Light clients can mathematically prove membership of any element among millions of records by verifying only $\log_2 N$ sibling hashes, requiring mere kilobytes of bandwidth instead of gigabytes.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-heading text-sm">
            <Layers className="h-4 w-4" />
            <span>Anti-Entropy & Consistency</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Distributed databases like Apache Cassandra and Amazon Dynamo use Merkle trees to detect replica desynchronization. Comparing root hashes allows replicas to rapidly isolate corrupted ranges in $O(\log N)$ time.
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
