import React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { MarkdownRenderer } from "@/components/content/markdown-renderer"
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar"
import { TableOfContents } from "@/components/blog/TableOfContents"
import { PostInteractions } from "@/components/blog/PostInteractions"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

interface BlogPostDetail {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  readingTime: string
  createdAt: string
}

const fallbackBlogDetails: Record<string, BlogPostDetail> = {
  "architecting-microsecond-latency-rust": {
    title: "Architecting Microsecond-Latency Systems in Rust",
    slug: "architecting-microsecond-latency-rust",
    excerpt: "Exploring memory models, thread pinning, non-blocking I/O queues, and custom lock-free structures for building ultra-high-throughput financial trading networks.",
    category: "Systems Engineering",
    readingTime: "8 min read",
    tags: ["rust", "latency", "concurrency"],
    createdAt: "Jul 28, 2026",
    content: `# Architecting Microsecond-Latency Systems in Rust

In systems engineering, optimizing transaction clearance speed from milliseconds to microseconds demands a fundamental shift in programming habits. This article explores memory models, thread pinning, non-blocking queues, and lock-free concurrency patterns in Rust.

## Core Latency Bottlenecks

Traditional backend designs operate under the assumption that network delays dominate latency tables. While this is true for consumer web interfaces, financial cleared networks or distributed database nodes face critical CPU and cache scheduling delays:

1. **Garbage Collection (GC)**: Languages like Go or Java introduce unpredictable Stop-The-World (STW) sweeps.
2. **Context Switching**: Scheduling threads via the OS kernel induces overheads (1-3 microseconds per switch).
3. **Cache Misses**: Accessing system RAM is orders of magnitude slower than reading local L1/L2 CPU caches.

:::info
By using Rust, we eliminate GC pauses completely due to compile-time memory ownership and lifetime validation patterns.
:::

## CPU Thread Pinning

To prevent the OS scheduler from shifting our execution threads across different physical CPU cores (which destroys CPU cache registers), we can pin threads to specific cores.

In Rust, this can be achieved using the \`core_affinity\` crate:

\`\`\`rust
use std::thread;

fn main() {
    let core_ids = core_affinity::get_core_ids().unwrap();
    
    // Pin this thread to the first available CPU core
    thread::spawn(move || {
        if let Some(core_id) = core_ids.first() {
            core_affinity::set_for_current(*core_id);
            println!("Thread pinned to core {:?}", core_id);
        }
        // Perform latency-critical loop here
    });
}
\`\`\`

## Memory Pre-allocation & Ring Buffers

To prevent page-fault interrupts during critical operations, avoid calling \`malloc\` or dynamically expanding vectors at runtime. Instead, instantiate memory-mapped buffers or ring queues at bootstrap.

Here is a typical layout structure using cache-line alignment in Rust to prevent **false sharing**:

\`\`\`rust
#[repr(align(64))]
struct CacheAlignedValue {
    sequence: u64,
}
\`\`\`

## Lock-Free Single-Producer Single-Consumer (SPSC) Queues

Using Mutex locks introduces threads to kernel lock wait-queues. Instead, utilize atomic ring buffers to pass events between core threads.

:::warning
When building lock-free structures, always use appropriate memory orderings. Relaxed memory bounds can lead to read-write reorderings on CPU registers.
:::

\`\`\`rust
use std::sync::atomic::{AtomicUsize, Ordering};

pub struct SpscQueue<T> {
    buffer: Vec<Option<T>>,
    write_cursor: AtomicUsize,
    read_cursor: AtomicUsize,
}
\`\`\`

By bypassing OS thread schedulers, optimizing CPU cache layouts, and opting for atomic instructions over mutex guards, we can reliably drop application latencies down into sub-microsecond levels.`,
  },
  "designing-custom-raft-go": {
    title: "Designing a Custom Raft Consensus Protocol in Go",
    slug: "designing-custom-raft-go",
    excerpt: "A deep dive into distributed systems engineering: heartbeats, election timeouts, log compaction, and partition recovery strategies implemented from scratch.",
    category: "Distributed Systems",
    readingTime: "12 min read",
    tags: ["go", "distributed-systems", "raft"],
    createdAt: "Jul 15, 2026",
    content: `# Custom Raft Consensus in Go

Distributed consensus is the bedrock of partition-tolerant databases and cloud container schedules. This writeup unpacks the implementation of the Raft consensus model in Go from scratch.

## Raft Core States

Raft divides node roles into three states:
- **Follower**: Passive state; responds to heartbeats and election queries.
- **Candidate**: Active election state; gathers votes to establish a new term.
- **Leader**: Central coordinator state; handles client writes and replicates log entries.

:::info
Node terms act as a logical clock in distributed systems, allowing nodes to detect and ignore outdated leaders.
:::

## The Election Loop

Raft uses randomized election timeouts (e.g. 150ms to 300ms) to prevent split-vote scenarios where multiple followers attempt to run elections simultaneously.

Here is a simplified Go implementation of the Candidate election trigger:

\`\`\`go
package consensus

import (
	"math/rand"
	"time"
)

type RaftNode struct {
	state       string
	currentTerm int
	votedFor    string
	peers       []string
}

func (r *RaftNode) startElection() {
	r.state = "Candidate"
	r.currentTerm++
	r.votedFor = "Self"
	
	votesReceived := 1
	for _, peer := range r.peers {
		go func(p string) {
			if r.requestVoteFromPeer(p) {
				votesReceived++
			}
		}(peer)
	}
}
\`\`\`

## Log Replication & Safety

Leaders must append entries to their local log and broadcast AppendEntries messages to all follower nodes. An entry is considered **committed** once it is successfully written to a majority of node logs.

:::warning
Raft guarantees that a committed log entry is present in all future leader terms, ensuring database durability.
:::

Implementing Raft highlights the necessity of thorough state tracking and network boundary controls when writing distributed code.`,
  },
  "why-switched-oklch-css": {
    title: "Why We Switched from Tailwind to OKLCH CSS Variables",
    slug: "why-switched-oklch-css",
    excerpt: "How modern color spaces and inline CSS themes dramatically simplify design consistency, accessibility compliance, and dynamic dark mode scaling.",
    category: "Frontend Architecture",
    readingTime: "6 min read",
    tags: ["css", "oklch", "design-system"],
    createdAt: "Jun 30, 2026",
    content: `# Switched to OKLCH CSS Variables

Design systems have traditionally relied on RGB or HSL color representations. While serviceable, these color models do not reflect perceptual brightness. This writeup explains why we restructured our styling around OKLCH variables.

## Perceptual Uniformity

The primary problem with HSL: **yellow and blue at the same lightness level (e.g. 50%) look completely different to the human eye**. Yellow looks bright; blue looks extremely dark.

OKLCH solves this by modeling:
- **Lightness (L)**: Perceptual brightness (0 to 1).
- **Chroma (C)**: Purity or saturation of the color.
- **Hue (H)**: Color angle (0 to 360 degrees).

:::success
OKLCH colors look uniform across varying hues, ensuring predictable text contrast ratios.
:::

## Tailwind CSS v4 & OKLCH

With Tailwind CSS v4, custom theme parameters map straight into native CSS variables. We define variables once in our root styles:

\`\`\`css
:root {
  --background: oklch(0.99 0.002 240);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
}

.dark {
  --background: oklch(0.09 0.002 286);
  --foreground: oklch(0.985 0 0);
}
\`\`\`

This setup enables us to perform dynamic theme mapping and contrast calculations inline without reloading scripts.`,
  },
}

async function getBlogPostDetail(slug: string): Promise<BlogPostDetail | null> {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
    })

    if (!post) {
      return fallbackBlogDetails[slug] || null
    }

    return {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      readingTime: post.readingTime,
      createdAt: post.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }
  } catch (error) {
    console.error("Database query failed; loading fallback blog detail", error)
    return fallbackBlogDetails[slug] || null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostDetail(slug)
  if (!post) {
    return {
      title: "Article Not Found",
    }
  }
  return {
    title: `${post.title} | Engineering Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPostDetail(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 flex flex-col gap-10">
      {/* Scroll indicator */}
      <ReadingProgressBar />

      {/* Back button */}
      <ScrollReveal>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>
      </ScrollReveal>

      {/* Header Info */}
      <ScrollReveal className="flex flex-col gap-4 border-b border-border/20 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="font-mono text-xs border-border/10 bg-indigo-500/10 text-indigo-400 uppercase">
            {post.category}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Calendar className="h-3.5 w-3.5" />
            <span>{post.createdAt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readingTime}</span>
          </div>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {post.tags.map((tag) => (
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
          <MarkdownRenderer content={post.content} />
          <PostInteractions title={post.title} slug={post.slug} type="blog" />
        </ScrollReveal>

        {/* Right sidebar: Table of Contents & Related info */}
        <ScrollReveal className="lg:col-span-1 flex flex-col gap-8 lg:sticky lg:top-24 border-l border-border/20 pl-6">
          <TableOfContents content={post.content} />
          
          <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
            <CardHeader className="border-b border-border/20 pb-3">
              <CardTitle className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                About the Author
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs text-muted-foreground leading-relaxed font-sans flex flex-col gap-2">
              <span className="font-semibold text-foreground">Dhananjay Singh</span>
              <span>Software engineer and B.Tech student interested in high-performance backends, operating systems, and distributed consensus rings.</span>
            </CardContent>
          </Card>
        </ScrollReveal>

      </div>

    </div>
  )
}
