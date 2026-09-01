import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { Hero } from "@/components/home/Hero"
import { Stats } from "@/components/home/Stats"
import { TechStack } from "@/components/home/TechStack"
import { ContributionGraph } from "@/components/home/ContributionGraph"
import { ConsensusVisualizer } from "@/components/home/ConsensusVisualizer"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ExternalLink, Github, BookOpen, Notebook, Mail } from "lucide-react"

// Types matching database schema
interface ProjectData {
  title: string
  slug: string
  description: string
  techStack: string[]
  category: string
  github?: string | null
  demo?: string | null
}

interface BlogData {
  title: string
  slug: string
  excerpt: string
  category: string
  readingTime: string
  createdAt: Date
}

interface NoteData {
  title: string
  slug: string
  category: string
}

// Fallback Mock Data for Immediate Showcase
const fallbackProjects: ProjectData[] = [
  {
    title: "Nova Orchestrator",
    slug: "nova-orchestrator",
    description: "A high-performance cloud container scheduler and mesh network orchestrator written in Go, featuring a sub-10ms scheduling latency and custom raft consensus consensus model.",
    techStack: ["Go", "Raft", "gRPC", "Protobuf", "Docker"],
    category: "Backend & Systems",
    github: "https://github.com",
  },
  {
    title: "Aura Ledger",
    slug: "aura-ledger",
    description: "Distributed transactional ledger and financial clearance backend designed for microsecond settlement with complete ACID compliance and cryptographic audit logs.",
    techStack: ["Rust", "PostgreSQL", "Tokio", "Redis"],
    category: "Distributed Systems",
    github: "https://github.com",
  },
  {
    title: "Vortex CDN",
    slug: "vortex-cdn",
    description: "Edge server caching platform built on WebAssembly and Rust, reducing cold-start latency for severless edge workers by 70%.",
    techStack: ["Rust", "Wasm", "TypeScript", "Next.js"],
    category: "Cloud Infrastructure",
    github: "https://github.com",
    demo: "https://example.com",
  },
]

const fallbackBlogs: BlogData[] = [
  {
    title: "Architecting Microsecond-Latency Systems in Rust",
    slug: "architecting-microsecond-latency-rust",
    excerpt: "Exploring memory models, thread pinning, non-blocking I/O queues, and custom lock-free structures for building ultra-high-throughput financial trading networks.",
    category: "Systems Engineering",
    readingTime: "8 min read",
    createdAt: new Date("2026-07-28"),
  },
  {
    title: "Designing a Custom Raft Consensus Protocol in Go",
    slug: "designing-custom-raft-go",
    excerpt: "A deep dive into distributed systems engineering: heartbeats, election timeouts, log compaction, and partition recovery strategies implemented from scratch.",
    category: "Distributed Systems",
    readingTime: "12 min read",
    createdAt: new Date("2026-07-15"),
  },
  {
    title: "Why We Switched from Tailwind to OKLCH CSS Variables",
    slug: "why-switched-oklch-css",
    excerpt: "How modern color spaces and inline CSS themes dramatically simplify design consistency, accessibility compliance, and dynamic dark mode scaling.",
    category: "Frontend Architecture",
    readingTime: "6 min read",
    createdAt: new Date("2026-06-30"),
  },
]

const fallbackNotes: NoteData[] = [
  {
    title: "System Design: Consistent Hashing Ring Algorithms",
    slug: "consistent-hashing-ring-algorithms",
    category: "System Design",
  },
  {
    title: "DSA: Designing Lock-free Ring Buffer Queues",
    slug: "dsa-lock-free-ring-buffers",
    category: "DSA",
  },
  {
    title: "DevOps: Multi-region DNS Failover Architecture",
    slug: "multi-region-dns-failover",
    category: "DevOps",
  },
  {
    title: "Go: Advanced Goroutine Thread-Pinning Strategies",
    slug: "go-goroutine-thread-pinning",
    category: "Go",
  },
]

// Database Fetch helper
async function getFeaturedData() {
  try {
    const projects = await db.project.findMany({
      where: { featured: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    })
    const blogs = await db.blogPost.findMany({
      where: { featured: true, published: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    })
    const notes = await db.note.findMany({
      where: { published: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    })

    return {
      projects: projects.length > 0 ? projects : fallbackProjects,
      blogs: blogs.length > 0 ? blogs : fallbackBlogs,
      notes: notes.length > 0 ? notes : fallbackNotes,
    }
  } catch (error) {
    console.error("Prisma lookup failed; resolving fallback mock content", error)
    return {
      projects: fallbackProjects,
      blogs: fallbackBlogs,
      notes: fallbackNotes,
    }
  }
}

export default async function Home() {
  const { projects, blogs, notes } = await getFeaturedData()

  return (
    <div className="flex flex-col grow">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Stats */}
      <Stats />

      {/* 3. Tech Stack */}
      <TechStack />

      {/* 4. Featured Projects Grid */}
      <section className="py-20 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col gap-12">
              
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-3">
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                    Featured Systems & Projects
                  </h2>
                  <p className="text-muted-foreground font-sans max-w-2xl">
                    Demonstrated architectures built with code quality, telemetry, and horizontal scaling in mind.
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  All Projects
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <Card key={project.slug} className="flex flex-col h-full bg-card/25 backdrop-blur-sm border-border/40 hover:border-border/80 transition-all hover:bg-card/45 group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono tracking-tight text-muted-foreground uppercase">
                          {project.category}
                        </span>
                      </div>
                      <CardTitle className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
                        <Link href={`/projects/${project.slug}`}>
                          {project.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grow">
                      <CardDescription className="text-sm font-sans text-muted-foreground leading-relaxed">
                        {project.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {project.techStack.map((tech) => (
                          <Badge key={tech} variant="outline" className="px-2 py-0.5 text-[10px] font-mono border-border/30 text-muted-foreground">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-border/20 flex gap-4 text-xs font-medium">
                      <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        View Case Study
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-auto text-muted-foreground hover:text-foreground transition-colors">
                          <Github className="h-3.5 w-3.5" />
                          Source
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="sm:hidden text-center mt-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
                >
                  View All Projects
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4.5 Interactive Distributed Consensus Visualizer */}
      <ConsensusVisualizer />

      {/* 5. Blogs and Notes Section */}
      <section className="py-20 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left: Blog Column */}
            <ScrollReveal className="flex flex-col gap-8">
              <div className="flex items-center justify-between pb-3 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Featured Articles & Writeups
                  </h3>
                </div>
                <Link href="/blog" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  View All
                </Link>
              </div>

              <div className="flex flex-col gap-6">
                {blogs.map((post) => (
                  <article key={post.slug} className="group flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readingTime}</span>
                    </div>
                    <h4 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </article>
                ))}
              </div>
            </ScrollReveal>

            {/* Right: Notes Column */}
            <ScrollReveal className="flex flex-col gap-8">
              <div className="flex items-center justify-between pb-3 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <Notebook className="h-4 w-4 text-purple-500" />
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Knowledge Base Notes
                  </h3>
                </div>
                <Link href="/notes" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <Link
                    key={note.slug}
                    href={`/notes/${note.category.toLowerCase().replace(/\s+/g, "-")}/${note.slug}`}
                    className="p-4 rounded-lg border border-border/30 bg-card/25 hover:border-border/80 transition-all hover:bg-card/45 group"
                  >
                    <span className="text-[10px] font-mono font-semibold text-purple-500 uppercase tracking-wider block mb-1">
                      {note.category}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors leading-tight">
                      {note.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* 6. GitHub Activity Graph */}
      <ContributionGraph />

      {/* 7. Contact CTA Block */}
      <section className="py-20 bg-muted/20 border-t border-border/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="rounded-2xl border border-border/40 bg-card/40 p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-4xl mx-auto backdrop-blur-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary border border-primary/20">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                Let&apos;s Build Something Resilient Together
              </h2>
              <p className="max-w-xl text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
                Whether you need high-performance API structures, database optimization audits, or systems integration roadmaps—I am open to architecting solutions.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all mt-2"
              >
                Start a Conversation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
