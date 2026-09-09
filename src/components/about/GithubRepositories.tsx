"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Github, Star, GitFork, Copy, Check, Terminal, ExternalLink, Code2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface Repository {
  name: string
  description: string
  url: string
  stars: number
  forks: number
  primaryLanguage: string
  languageColor: string
  topics: string[]
}

const pinnedRepos: Repository[] = [
  {
    name: "nova-orchestrator",
    description: "Actor-model distributed task scheduler in Go handling 50k+ heartbeats with Raft quorum consensus.",
    url: "https://github.com/dhananjaysinghk",
    stars: 142,
    forks: 28,
    primaryLanguage: "Go",
    languageColor: "bg-cyan-500",
    topics: ["distributed-systems", "raft-consensus", "grpc", "actor-model"],
  },
  {
    name: "aura-ledger",
    description: "Microsecond-latency double-entry financial ledger in Rust with lock-free SPSC ring buffers.",
    url: "https://github.com/dhananjaysinghk",
    stars: 98,
    forks: 14,
    primaryLanguage: "Rust",
    languageColor: "bg-amber-600",
    topics: ["rust", "low-latency", "lock-free", "order-matching"],
  },
  {
    name: "vortex-cdn",
    description: "High-performance edge reverse proxy and Anycast CDN cache node engine supporting HTTP/3 QUIC.",
    url: "https://github.com/dhananjaysinghk",
    stars: 76,
    forks: 9,
    primaryLanguage: "Rust",
    languageColor: "bg-amber-600",
    topics: ["http3", "quic", "reverse-proxy", "caching"],
  },
  {
    name: "lsm-tree-rust",
    description: "Log-Structured Merge-Tree storage engine with concurrent SkipList MemTable and SSTable compaction.",
    url: "https://github.com/dhananjaysinghk",
    stars: 64,
    forks: 7,
    primaryLanguage: "Rust",
    languageColor: "bg-amber-600",
    topics: ["database-internals", "lsm-tree", "wal", "storage-engine"],
  },
]

export function GithubRepositories() {
  const [copiedRepo, setCopiedRepo] = useState<string | null>(null)

  const handleCopyClone = (repoName: string) => {
    soundFx.playClick()
    const cloneCmd = `git clone https://github.com/dhananjaysinghk/${repoName}.git`
    navigator.clipboard.writeText(cloneCmd)
    setCopiedRepo(repoName)
    setTimeout(() => setCopiedRepo(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {pinnedRepos.map((repo, idx) => (
        <motion.div
          key={repo.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="h-full bg-card/25 border-border/40 backdrop-blur-sm hover:border-border/70 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-heading text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors group"
                >
                  <Code2 className="h-4 w-4 text-primary" />
                  <span>{repo.name}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <button
                  onClick={() => handleCopyClone(repo.name)}
                  className="rounded-lg border border-border/30 bg-card/30 p-1.5 text-muted-foreground hover:text-foreground transition-all"
                  title="Copy git clone command"
                >
                  {copiedRepo === repo.name ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col gap-4 text-xs font-sans">
              <p className="text-muted-foreground leading-relaxed">
                {repo.description}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-1.5">
                {repo.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-md bg-card/40 border border-border/20 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                  >
                    #{topic}
                  </span>
                ))}
              </div>

              {/* Bottom Meta */}
              <div className="flex items-center justify-between border-t border-border/15 pt-3 text-[11px] font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${repo.languageColor}`} />
                  <span className="font-semibold text-foreground">{repo.primaryLanguage}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {repo.forks}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
