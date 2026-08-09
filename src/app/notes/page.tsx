import React from "react"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { NotesList } from "@/components/notes/NotesList"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Bookmark } from "lucide-react"

export const metadata: Metadata = {
  title: "Developer Notes | Dhananjay Singh",
  description: "Personal knowledge base, system designs, computer science definitions, algorithms, and technical cheat sheets.",
}

const fallbackNotes = [
  {
    id: "note-1",
    title: "System Design: Consistent Hashing Ring Algorithms",
    slug: "consistent-hashing-ring-algorithms",
    category: "System Design",
    tags: ["consistent-hashing", "scaling", "caching"],
  },
  {
    id: "note-2",
    title: "DSA: Designing Lock-free Ring Buffer Queues",
    slug: "dsa-lock-free-ring-buffers",
    category: "DSA",
    tags: ["queues", "concurrency", "lock-free"],
  },
  {
    id: "note-3",
    title: "Go: Advanced Goroutine Thread-Pinning Strategies",
    slug: "go-goroutine-thread-pinning",
    category: "Go",
    tags: ["goroutines", "scheduler", "runtime"],
  },
  {
    id: "note-4",
    title: "DevOps: Multi-region DNS Failover Architecture",
    slug: "multi-region-dns-failover",
    category: "DevOps",
    tags: ["dns", "route53", "failover"],
  },
]

async function getNotes() {
  try {
    const notes = await db.note.findMany({
      orderBy: { createdAt: "desc" },
    })

    if (notes.length === 0) return fallbackNotes

    return notes.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      category: n.category,
      tags: n.tags,
    }))
  } catch (error) {
    console.error("Prisma notes fetch failed; loading fallback knowledge base", error)
    return fallbackNotes
  }
}

export default async function NotesPage() {
  const notes = await getNotes()

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 flex flex-col gap-12">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Bookmark className="h-3.5 w-3.5 text-purple-500" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Personal Knowledge Base
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Developer Notes & Archives
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-sans">
          A collection of algorithms, distributed systems designs, programming concepts, and notes I keep during engineering updates.
        </p>
      </ScrollReveal>

      {/* Listing and Searching */}
      <ScrollReveal delay={0.1}>
        <NotesList initialNotes={notes} />
      </ScrollReveal>

    </div>
  )
}
