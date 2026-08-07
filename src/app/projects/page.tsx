import React from "react"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { ProjectsShowcase } from "@/components/projects/ProjectsShowcase"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "Projects Showcase | Dhananjay Singh",
  description: "Browse engineering projects, systems designs, and case studies built by Dhananjay Singh.",
}

const fallbackProjects = [
  {
    id: "proj-1",
    title: "Nova Orchestrator",
    slug: "nova-orchestrator",
    description: "A high-performance cloud container scheduler and mesh network orchestrator written in Go, featuring a sub-10ms scheduling latency and custom raft consensus consensus model.",
    techStack: ["Go", "Raft", "gRPC", "Protobuf", "Docker"],
    category: "Backend & Systems",
    github: "https://github.com/dhananjaysinghk",
  },
  {
    id: "proj-2",
    title: "Aura Ledger",
    slug: "aura-ledger",
    description: "Distributed transactional ledger and financial clearance backend designed for microsecond settlement with complete ACID compliance and cryptographic audit logs.",
    techStack: ["Rust", "PostgreSQL", "Tokio", "Redis"],
    category: "Distributed Systems",
    github: "https://github.com/dhananjaysinghk",
  },
  {
    id: "proj-3",
    title: "Vortex CDN",
    slug: "vortex-cdn",
    description: "Edge server caching platform built on WebAssembly and Rust, reducing cold-start latency for severless edge workers by 70%.",
    techStack: ["Rust", "Wasm", "TypeScript", "Next.js"],
    category: "Cloud Infrastructure",
    github: "https://github.com/dhananjaysinghk",
    demo: "https://github.com/dhananjaysinghk",
  },
]

async function getProjects() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
    })
    
    if (projects.length === 0) return fallbackProjects

    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      techStack: p.techStack,
      category: p.category,
      github: p.github,
      demo: p.demo,
    }))
  } catch (error) {
    console.error("Database query failed; loading fallback projects", error)
    return fallbackProjects
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 flex flex-col gap-12">
      
      {/* Header section */}
      <ScrollReveal className="flex flex-col gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Case Studies & Codebases
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Selected Software Architectures
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-sans">
          A showcase of backend systems, databases, distributed microservices, and platforms I have architected and built.
        </p>
      </ScrollReveal>

      {/* Interactive Showcase component */}
      <ScrollReveal delay={0.1}>
        <ProjectsShowcase initialProjects={projects} />
      </ScrollReveal>

    </div>
  )
}
