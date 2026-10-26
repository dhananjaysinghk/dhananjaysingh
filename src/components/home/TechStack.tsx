import React from "react"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Badge } from "@/components/ui/badge"
import { Code2, Server, Layout, Database, Cloud, Wrench } from "lucide-react"

const categories = [
  {
    name: "Languages",
    icon: Code2,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    items: ["Go", "TypeScript", "Rust", "Java", "Python", "C++", "SQL"],
  },
  {
    name: "Backend & Systems",
    icon: Server,
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    items: ["Node.js", "Express", "Hono", "gRPC", "Protobuf", "Raft Consensus", "GraphQL"],
  },
  {
    name: "Frontend Architecture",
    icon: Layout,
    accent: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    items: ["React", "Next.js (App Router)", "TypeScript", "Tailwind CSS", "Framer Motion", "Vite"],
  },
  {
    name: "Databases & In-Memory",
    icon: Database,
    accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    items: ["PostgreSQL", "Prisma ORM", "Redis (Caching)", "MongoDB", "Elasticsearch"],
  },
  {
    name: "DevOps & Cloud",
    icon: Cloud,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    items: ["Docker", "Kubernetes", "AWS (EC2/S3/RDS)", "GCP", "GitHub Actions", "Vercel", "Linux"],
  },
  {
    name: "Tooling & Profiling",
    icon: Wrench,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    items: ["Git", "Postman", "OpenAI APIs", "Vector Databases", "Neovim", "Prometheus"],
  },
]

export function TechStack() {
  return (
    <section className="py-20 bg-card/5 border-b border-border/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col gap-12">
            
            {/* Header */}
            <div className="flex flex-col gap-3 max-w-2xl">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                Technology Stack & Systems Expertise
              </h2>
              <p className="text-muted-foreground font-sans">
                A selection of programming languages, infrastructure tools, and frameworks I use to build scalable systems.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-center gap-3 border-b border-border/20 pb-3 mb-4">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${category.accent}`}>
                      <category.icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-heading text-sm font-bold tracking-tight text-foreground/90 uppercase group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs font-mono font-medium border border-border/20 bg-muted/30 hover:bg-muted/80 hover:border-border/60 text-foreground/90 transition-all"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
