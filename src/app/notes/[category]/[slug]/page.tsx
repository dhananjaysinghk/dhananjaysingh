import React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { MarkdownRenderer } from "@/components/content/markdown-renderer"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Clock, Tag } from "lucide-react"

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

interface NoteDetail {
  title: string
  slug: string
  content: string
  category: string
  tags: string[]
  updatedAt: string
}

const fallbackNoteDetails: Record<string, NoteDetail> = {
  "consistent-hashing-ring-algorithms": {
    title: "System Design: Consistent Hashing Ring Algorithms",
    slug: "consistent-hashing-ring-algorithms",
    category: "System Design",
    tags: ["consistent-hashing", "scaling", "caching"],
    updatedAt: "Aug 2026",
    content: `# Consistent Hashing Rings

Consistent hashing is a crucial algorithm for scaling distributed database caching clusters. It solves the key remapping problem when servers are added or removed.

## The Re-mapping Problem

With traditional modulo hashing (\`hash(key) % N\`):
- When \`N\` (number of servers) changes, **almost all keys** map to new nodes.
- This causes cache stampedes and database overloads.

## The Ring Solution

1. **Hash Range**: The hash space is mapped to a circular ring (e.g. 0 to 2^32 - 1).
2. **Node Placement**: Nodes are hashed and placed on points on the ring.
3. **Key Mapping**: Keys are hashed onto the ring, then mapped to the first node encountered moving clockwise.

:::info
To balance key distribution, we introduce **Virtual Nodes (vnodes)**. Each physical node is hashed multiple times (e.g. 100-200 times) and mapped to multiple ring points.
:::

## Go Implementation

\`\`\`go
package hashing

import (
	"hash/fnv"
	"sort"
	"strconv"
)

type HashRing struct {
	vnodes  int
	ring    []uint32
	nodeMap map[uint32]string
}

func NewHashRing(vnodes int) *HashRing {
	return &HashRing{
		vnodes:  vnodes,
		nodeMap: make(map[uint32]string),
	}
}

func (h *HashRing) AddNode(node string) {
	for i := 0; i < h.vnodes; i++ {
		hash := h.hash(node + "#" + strconv.Itoa(i))
		h.ring = append(h.ring, hash)
		h.nodeMap[hash] = node
	}
	sort.Slice(h.ring, func(i, j int) bool {
		return h.ring[i] < h.ring[j]
	})
}

func (h *HashRing) GetNode(key string) string {
	if len(h.ring) == 0 {
		return ""
	}
	hash := h.hash(key)
	idx := sort.Search(len(h.ring), func(i int) bool {
		return h.ring[i] >= hash
	})
	if idx == len(h.ring) {
		idx = 0
	}
	return h.nodeMap[h.ring[idx]]
}

func (h *HashRing) hash(key string) uint32 {
	hasher := fnv.New32a()
	hasher.Write([]byte(key))
	return hasher.Sum32()
}
\`\`\``
  },
  "dsa-lock-free-ring-buffers": {
    title: "DSA: Designing Lock-free Ring Buffer Queues",
    slug: "dsa-lock-free-ring-buffers",
    category: "DSA",
    tags: ["queues", "concurrency", "lock-free"],
    updatedAt: "Jul 2026",
    content: `# Lock-free Ring Buffers

A high-throughput queue utilizing atomic sequence pointers instead of locks (Mutexes), matching LMAX Disruptor performance.

## Design Principles

- **Fixed Size**: Array size must be a power of 2 to allow fast bitwise modulo: \`index = sequence & (size - 1)\`.
- **Sequence Counters**: Atomic write and read cursors that increment infinitely.

:::warning
Be careful of CPU cache line false sharing. Pad the atomic sequences to prevent concurrent cores from locking the same L1/L2 cache line.
:::

## Rust Concurrent Ring Buffer Outline

\`\`\`rust
use std::sync::atomic::{AtomicUsize, Ordering};

pub struct RingBuffer<T> {
    buffer: Vec<Option<T>>,
    size: usize,
    write_cursor: AtomicUsize,
    read_cursor: AtomicUsize,
}

impl<T> RingBuffer<T> {
    pub fn new(size: usize) -> Self {
        assert!(size.is_power_of_two());
        let mut buffer = Vec::with_capacity(size);
        for _ in 0..size {
            buffer.push(None);
        }
        Self {
            buffer,
            size,
            write_cursor: AtomicUsize::new(0),
            read_cursor: AtomicUsize::new(0),
        }
    }

    pub fn push(&mut self, item: T) -> Result<(), &'static str> {
        let write = h.write_cursor.load(Ordering::Relaxed);
        let read = h.read_cursor.load(Ordering::Acquire);
        if write - read >= h.size {
            return Err("Queue is full");
        }
        let index = write & (h.size - 1);
        h.buffer[index] = Some(item);
        h.write_cursor.store(write + 1, Ordering::Release);
        Ok(())
    }
}
\`\`\``
  },
  "go-goroutine-thread-pinning": {
    title: "Go: Advanced Goroutine Thread-Pinning Strategies",
    slug: "go-goroutine-thread-pinning",
    category: "Go",
    tags: ["goroutines", "scheduler", "runtime"],
    updatedAt: "Jun 2026",
    content: `# Goroutine Thread Pinning

How and when to lock a goroutine to an OS thread using \`runtime.LockOSThread()\`.

## The Go Scheduler (GMP)

The Go runtime multiplexes \`G\` (Goroutines) onto \`M\` (Machine/OS threads) using \`P\` (Processors).
Normally, the scheduler shifts goroutines between OS threads dynamically.

## Thread Pinning Use Cases

1. **GUI Libraries**: Libraries like Cocoa, OpenGL, or Windows USER32 require GUI calls on the main OS thread.
2. **Thread-local States**: CGo interfaces mapping to libraries relying on thread-local storage (TLS).

:::warning
Call \`runtime.UnlockOSThread()\` if you want the thread to become reusable for other goroutines, but if you exit the goroutine without unlocking, Go will terminate the thread completely and spawn a replacement.
:::

\`\`\`go
package main

import (
	"fmt"
	"runtime"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		defer wg.Done()
		// Lock this goroutine to its current OS thread
		runtime.LockOSThread()
		defer runtime.UnlockOSThread()

		fmt.Println("This goroutine is locked to its thread!")
	}()

	wg.Wait()
}
\`\`\``
  },
  "multi-region-dns-failover": {
    title: "DevOps: Multi-region DNS Failover Architecture",
    slug: "multi-region-dns-failover",
    category: "DevOps",
    tags: ["dns", "route53", "failover"],
    updatedAt: "May 2026",
    content: `# Multi-region DNS Failover

Designing high-availability active-passive routing using Route 53 or Cloudflare.

## Core Metrics

- **RTO (Recovery Time Objective)**: The time it takes to detect failover and update DNS routing.
- **RPO (Recovery Point Objective)**: The data replication gap between primary and secondary regions.

:::info
Keep DNS TTL low (e.g. 30-60 seconds) so client caches expire quickly during failover events.
:::

## Architecture Pipeline

- **Health Checks**: Dynamic endpoint endpoints polled by DNS agents every 10 seconds.
- **Failover Threshold**: Trigger routing switch if endpoint fails 3 consecutive polls.`
  }
}

async function getNoteDetail(slug: string): Promise<NoteDetail | null> {
  try {
    const note = await db.note.findUnique({
      where: { slug },
    })

    if (!note) {
      return fallbackNoteDetails[slug] || null
    }

    return {
      title: note.title,
      slug: note.slug,
      content: note.content,
      category: note.category,
      tags: note.tags,
      updatedAt: note.updatedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    }
  } catch (error) {
    console.error("Database query failed; loading fallback note detail", error)
    return fallbackNoteDetails[slug] || null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const note = await getNoteDetail(slug)
  if (!note) {
    return {
      title: "Note Not Found",
    }
  }
  return {
    title: `${note.title} | Developer Notes`,
    description: `Technical notes and cheat sheet reference for ${note.title}.`,
  }
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params
  const note = await getNoteDetail(slug)

  if (!note) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 flex flex-col gap-10">
      
      {/* Back button */}
      <ScrollReveal>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Notes
        </Link>
      </ScrollReveal>

      {/* Header Info */}
      <ScrollReveal className="flex flex-col gap-4 border-b border-border/20 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="font-mono text-xs border-border/10 bg-purple-500/10 text-purple-400 uppercase">
            {note.category}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {note.updatedAt}</span>
          </div>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {note.title}
        </h1>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="px-2 py-0.5 text-[10px] font-mono border-border/30 text-muted-foreground">
              #{tag}
            </Badge>
          ))}
        </div>
      </ScrollReveal>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        
        {/* Left main: Markdown Renderer */}
        <ScrollReveal className="lg:col-span-3 flex flex-col gap-6">
          <MarkdownRenderer content={note.content} />
        </ScrollReveal>

        {/* Right sidebar: Related info / placeholder */}
        <ScrollReveal className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-24">
          <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
            <CardHeader className="border-b border-border/20 pb-3">
              <CardTitle className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Knowledge Base Note
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs text-muted-foreground leading-relaxed font-sans flex flex-col gap-4">
              <p>
                This document is a snapshot from my personal knowledge base, containing snippets, definitions, and code setups I run in daily routines.
              </p>
              <div className="border-t border-border/10 pt-4 flex flex-col gap-2">
                <span className="font-semibold text-foreground">Usage Rights:</span>
                <span>Open source under MIT. Feel free to copy, modify, and integrate into your repositories.</span>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

      </div>

    </div>
  )
}
