import React from "react"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { BlogList } from "@/components/blog/BlogList"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Engineering Blog | Dhananjay Singh",
  description: "Technical articles on distributed databases, backend architectures, performance tuning, and software design principles.",
}

const fallbackPosts = [
  {
    id: "blog-1",
    title: "Architecting Microsecond-Latency Systems in Rust",
    slug: "architecting-microsecond-latency-rust",
    excerpt: "Exploring memory models, thread pinning, non-blocking I/O queues, and custom lock-free structures for building ultra-high-throughput financial trading networks.",
    category: "Systems Engineering",
    readingTime: "8 min read",
    tags: ["rust", "latency", "concurrency"],
    createdAt: "Jul 28, 2026",
  },
  {
    id: "blog-2",
    title: "Designing a Custom Raft Consensus Protocol in Go",
    slug: "designing-custom-raft-go",
    excerpt: "A deep dive into distributed systems engineering: heartbeats, election timeouts, log compaction, and partition recovery strategies implemented from scratch.",
    category: "Distributed Systems",
    readingTime: "12 min read",
    tags: ["go", "distributed-systems", "raft"],
    createdAt: "Jul 15, 2026",
  },
  {
    id: "blog-3",
    title: "Why We Switched from Tailwind to OKLCH CSS Variables",
    slug: "why-switched-oklch-css",
    excerpt: "How modern color spaces and inline CSS themes dramatically simplify design consistency, accessibility compliance, and dynamic dark mode scaling.",
    category: "Frontend Architecture",
    readingTime: "6 min read",
    tags: ["css", "oklch", "design-system"],
    createdAt: "Jun 30, 2026",
  },
]

async function getBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })

    if (posts.length === 0) return fallbackPosts

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      category: p.category,
      tags: p.tags,
      readingTime: p.readingTime,
      createdAt: p.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }))
  } catch (error) {
    console.error("Prisma blog posts fetch failed; loading fallback posts", error)
    return fallbackPosts
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 flex flex-col gap-12">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Engineering Blog
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Articles & Technical Writeups
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-sans">
          Deep dives into backend optimization, concurrency, system design architectures, and modern engineering practices.
        </p>
      </ScrollReveal>

      {/* Blog list */}
      <ScrollReveal delay={0.1}>
        <BlogList initialPosts={posts} />
      </ScrollReveal>

    </div>
  )
}
