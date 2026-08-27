import React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { PostInteractions } from "@/components/blog/PostInteractions"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Github, ExternalLink, Calendar, Code, Shield, Network, Terminal, Lightbulb } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

interface ProjectDetail {
  title: string
  slug: string
  description: string
  problem: string
  solution: string
  architecture: string
  techStack: string[]
  features: string[]
  challenges: string
  lessons: string
  github?: string | null
  demo?: string | null
  roadmap: string[]
  category: string
  date: string
}

const fallbackProjects: ProjectDetail[] = [
  {
    title: "Nova Orchestrator",
    slug: "nova-orchestrator",
    description: "A high-performance cloud container scheduler and mesh network orchestrator written in Go, featuring a sub-10ms scheduling latency and custom raft consensus model.",
    problem: "Traditional schedulers had latency overheads and did not support distributed low-latency consensus, causing significant scheduling delays (up to 800ms) when orchestrating thousands of active nodes on lossy mesh networks.",
    solution: "Implemented a custom lightweight scheduler in Go, using bidirectional gRPC stream channels for real-time node polling and a custom Raft consensus state machine for partition-tolerant database synchronization.",
    architecture: "A central orchestrator cluster running a three-node Raft consensus group communicating via protobuf messages over HTTP/2, with workers running lightweight local agents that execute scheduling tasks and report state telemetry.",
    techStack: ["Go", "Raft", "gRPC", "Protobuf", "Docker", "Prometheus", "Linux"],
    features: ["Sub-10ms scheduling latency", "Automatic node partition recovery", "Cryptographic task integrity validation", "gRPC streaming server telemetry"],
    challenges: "Tuning Raft heartbeat intervals on lossy mesh networks without inducing cluster-wide election loops during packet loss spikes.",
    lessons: "Decoupling the transaction write-ahead-log (WAL) routing pipelines from primary network routing threads is vital to preventing scheduling head-of-line blocking.",
    github: "https://github.com/dhananjaysinghk",
    roadmap: [
      "Support multi-region cluster federation",
      "Build custom WebAssembly sandbox container runtime",
      "Add automatic GPU-acceleration node scheduling pipelines"
    ],
    category: "Backend & Systems",
    date: "Jun 2025"
  },
  {
    title: "Aura Ledger",
    slug: "aura-ledger",
    description: "Distributed transactional ledger and financial clearance backend designed for microsecond settlement with complete ACID compliance and cryptographic audit logs.",
    problem: "High-frequency financial clears required microsecond persistence and cryptographically verifiable audits. Standard relational database transactional structures caused resource locks under concurrent account loads.",
    solution: "Developed a distributed in-memory state clearing engine in Rust, utilizing a write-ahead log (WAL) and memory-mapped files (mmap) for ultra-fast persistent transaction logging.",
    architecture: "Rust Tokio async engine acting as an execution pipeline, Redis for session cache, and PostgreSQL for archival storage and secondary auditing index queries.",
    techStack: ["Rust", "PostgreSQL", "Tokio", "Redis", "Docker", "Grafana"],
    features: ["ACID-compliant in-memory ledger state", "Microsecond transaction logging via mmap", "Cryptographically signed audit logs", "Prometheus performance metrics"],
    challenges: "Handling thread contention on atomic balance updates without causing deadlocks on high-frequency account clearings.",
    lessons: "Lock-free ring buffers (disruptor pattern) offer orders of magnitude higher throughput than standard Mutex locking primitives in high-concurrency Rust environments.",
    github: "https://github.com/dhananjaysinghk",
    roadmap: [
      "Implement zero-knowledge privacy audit proofs",
      "Create automatic currency-hedging routing nodes",
      "Introduce gRPC financial reporting streams"
    ],
    category: "Distributed Systems",
    date: "Dec 2024"
  },
  {
    title: "Vortex CDN",
    slug: "vortex-cdn",
    description: "Edge server caching platform built on WebAssembly and Rust, reducing cold-start latency for serverless edge workers by 70%.",
    problem: "Serverless edge functions had heavy cold start overheads, degrading user response latency by up to 800ms during scale-out events.",
    solution: "Created an edge server caching system running lightweight WebAssembly sandboxes, utilizing shared V8 isolate memory rings for immediate worker boot-ups.",
    architecture: "Rust proxy server acting as the gateway traffic load balancer, compiling edge handlers to Wasm modules executed via Wasmtime engine instances.",
    techStack: ["Rust", "Wasm", "TypeScript", "Next.js", "Vercel", "Wasmtime"],
    features: ["Sub-10 microsecond worker boot-ups", "V8 isolate memory pooling", "Global Geo-DNS route optimization", "Dynamic cache eviction algorithms"],
    challenges: "Designing strict memory boundaries to prevent shared memory corruption across untrusted worker isolates.",
    lessons: "WebAssembly modules loaded in pre-initialized memory states cut activation latencies down to sub-10 microseconds.",
    github: "https://github.com/dhananjaysinghk",
    demo: "https://github.com/dhananjaysinghk",
    roadmap: [
      "Integrate edge-native vector index caching",
      "Add global Geo-DNS route optimization routing",
      "Support automated HTTP/3 QUIC connection pooling"
    ],
    category: "Cloud Infrastructure",
    date: "Jul 2024"
  }
]

async function getProjectDetail(slug: string): Promise<ProjectDetail | null> {
  try {
    const p = await db.project.findUnique({
      where: { slug },
    })

    if (!p) {
      return fallbackProjects.find((proj) => proj.slug === slug) || null
    }

    return {
      title: p.title,
      slug: p.slug,
      description: p.description,
      problem: p.problem,
      solution: p.solution,
      architecture: p.architecture,
      techStack: p.techStack,
      features: p.features,
      challenges: p.challenges,
      lessons: p.lessons,
      github: p.github,
      demo: p.demo,
      roadmap: Array.isArray(p.roadmap) ? (p.roadmap as string[]) : [],
      category: p.category,
      date: p.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    }
  } catch (error) {
    console.error("Database query failed; loading fallback project detail", error)
    return fallbackProjects.find((proj) => proj.slug === slug) || null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectDetail(slug)
  if (!project) {
    return {
      title: "Project Not Found",
    }
  }
  return {
    title: `${project.title} Case Study | Dhananjay Singh`,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getProjectDetail(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 flex flex-col gap-10">
      
      {/* Back to projects */}
      <ScrollReveal>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>
      </ScrollReveal>

      {/* Hero Header */}
      <ScrollReveal className="flex flex-col gap-4 border-b border-border/20 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs border-border/40 text-muted-foreground uppercase">
            {project.category}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Calendar className="h-3.5 w-3.5" />
            <span>{project.date}</span>
          </div>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          {project.title}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-sans max-w-4xl">
          {project.description}
        </p>
      </ScrollReveal>

      {/* Case Study Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Left Column: Extensive Writeup */}
        <ScrollReveal className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Problem */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <h3 className="font-heading text-xl font-bold text-foreground">The Problem</h3>
            </div>
            <p className="text-muted-foreground font-sans text-base leading-relaxed pl-7">
              {project.problem}
            </p>
          </div>

          {/* Solution */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <Lightbulb className="h-5 w-5" />
              <h3 className="font-heading text-xl font-bold text-foreground">The Solution</h3>
            </div>
            <p className="text-muted-foreground font-sans text-base leading-relaxed pl-7">
              {project.solution}
            </p>
          </div>

          {/* Architecture */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-indigo-500">
              <Network className="h-5 w-5" />
              <h3 className="font-heading text-xl font-bold text-foreground">System Architecture</h3>
            </div>
            <p className="text-muted-foreground font-sans text-base leading-relaxed pl-7">
              {project.architecture}
            </p>
          </div>

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-purple-500">
                <Terminal className="h-5 w-5" />
                <h3 className="font-heading text-xl font-bold text-foreground">Technical Highlights</h3>
              </div>
              <ul className="list-disc list-outside pl-11 space-y-2 text-muted-foreground leading-relaxed text-base">
                {project.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges & Lessons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-border/20 pt-8 mt-4">
            <div className="flex flex-col gap-2">
              <h4 className="font-heading text-base font-bold text-foreground">Challenges Overcome</h4>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                {project.challenges}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-heading text-base font-bold text-foreground">Key Lessons Learned</h4>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                {project.lessons}
              </p>
            </div>
          </div>

          {/* Interactive Reactions & Social Share */}
          <PostInteractions title={project.title} slug={project.slug} type="project" />

        </ScrollReveal>

        {/* Right Column: Meta Info & Sidebar */}
        <ScrollReveal className="flex flex-col gap-8 lg:sticky lg:top-24">
          
          {/* Metadata Card */}
          <Card className="bg-card/20 border-border/40 backdrop-blur-sm">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="font-heading text-sm font-bold tracking-tight uppercase text-muted-foreground">
                Case Study Meta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 flex flex-col gap-6">
              
              {/* Stack */}
              <div>
                <span className="text-xs text-muted-foreground font-mono block mb-2">Technologies Used</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="px-2 py-0.5 text-[10px] font-mono border-border/10 bg-muted/40">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {(project.github || project.demo) && (
                <div className="flex flex-col gap-3 pt-2">
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Launch Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-all"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Browse Repository
                    </a>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

          {/* Roadmap Card */}
          {project.roadmap && project.roadmap.length > 0 && (
            <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
              <CardHeader className="border-b border-border/20 pb-4">
                <CardTitle className="font-heading text-sm font-bold tracking-tight uppercase text-muted-foreground">
                  Future Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ul className="space-y-3">
                  {project.roadmap.map((step, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground font-sans">
                      <span className="font-mono text-primary font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        </ScrollReveal>

      </div>

    </div>
  )
}
