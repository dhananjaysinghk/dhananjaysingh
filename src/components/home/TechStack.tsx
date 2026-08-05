"use client"

import React from "react"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Badge } from "@/components/ui/badge"

const categories = [
  {
    name: "Languages",
    items: ["Go", "TypeScript", "Rust", "Java", "Python", "C++", "SQL"],
  },
  {
    name: "Backend",
    items: ["Node.js", "Express", "Hono", "gRPC", "Protobuf", "Raft Consensus", "GraphQL"],
  },
  {
    name: "Frontend",
    items: ["React", "Next.js (App Router)", "TypeScript", "Tailwind CSS", "Framer Motion", "Vite"],
  },
  {
    name: "Database",
    items: ["PostgreSQL", "Prisma ORM", "Redis (Caching)", "MongoDB", "Elasticsearch"],
  },
  {
    name: "DevOps & Cloud",
    items: ["Docker", "Kubernetes", "AWS (EC2/S3/RDS)", "GCP", "GitHub Actions", "Vercel", "Linux"],
  },
  {
    name: "Tools & AI",
    items: ["Git", "Postman", "OpenAI APIs", "Vector Databases (Pinecone/PGVector)", "Neovim"],
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
                  className="group rounded-xl border border-border/30 bg-card/20 p-6 backdrop-blur-sm transition-all hover:border-border/80 hover:bg-card/40"
                >
                  <h3 className="font-heading text-sm font-bold tracking-tight text-foreground/90 uppercase border-b border-border/20 pb-3 mb-4 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs font-mono font-medium border border-border/10 bg-muted/40 hover:bg-muted/95 text-foreground/95 transition-all"
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
