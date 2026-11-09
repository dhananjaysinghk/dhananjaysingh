import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://dhananjaysinghk.vercel.app"

const fallbackPosts = [
  {
    title: "Architecting Microsecond-Latency Systems in Rust",
    slug: "architecting-microsecond-latency-rust",
    excerpt: "Exploring memory models, thread pinning, non-blocking I/O queues, and custom lock-free structures for building ultra-high-throughput financial trading networks.",
    createdAt: new Date("2026-07-28"),
  },
  {
    title: "Designing a Custom Raft Consensus Protocol in Go",
    slug: "designing-custom-raft-go",
    excerpt: "A deep dive into distributed systems engineering: heartbeats, election timeouts, log compaction, and partition recovery strategies implemented from scratch.",
    createdAt: new Date("2026-07-15"),
  },
  {
    title: "Why We Switched from Tailwind to OKLCH CSS Variables",
    slug: "why-switched-oklch-css",
    excerpt: "How modern color spaces and inline CSS themes dramatically simplify design consistency, accessibility compliance, and dynamic dark mode scaling.",
    createdAt: new Date("2026-06-30"),
  },
  {
    title: "Zero-Copy Networking with io_uring in Linux",
    slug: "zero-copy-linux-io-uring",
    excerpt: "Eliminating kernel context switch overhead and memory copies using asynchronous submission/completion ring buffers for multi-gigabit socket pipelines.",
    createdAt: new Date("2026-06-12"),
  },
  {
    title: "Distributed Deadlock Resolution: 2PC vs Saga Orchestration",
    slug: "distributed-deadlocks-2pc-saga",
    excerpt: "Contrasting two-phase commit protocols with choreographed saga patterns across heterogeneous microservices, covering compensation log recovery.",
    createdAt: new Date("2026-05-20"),
  },
  {
    title: "Cache-Line Alignment and False Sharing in High-Concurrency Disruptors",
    slug: "cache-line-false-sharing-disruptor",
    excerpt: "How L1/L2 cache coherency traffic bottlenecks multi-threaded ring buffers and how 64-byte memory padding recovers millions of operations per second.",
    createdAt: new Date("2026-05-04"),
  },
]

export async function GET() {
  try {
    let posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { title: true, slug: true, excerpt: true, createdAt: true },
    })

    if (posts.length === 0) {
      posts = fallbackPosts
    }

    const rssItems = posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid>${BASE_URL}/blog/${post.slug}</guid>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`
      )
      .join("")

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dhananjay Singh | Engineering Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Articles and technical writeups on distributed systems and backend infrastructure</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

    return new Response(rssFeed, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  } catch (error) {
    console.error("RSS feed generation failed:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
