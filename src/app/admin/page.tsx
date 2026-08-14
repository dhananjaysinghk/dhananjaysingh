import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, FileText, Database, ShieldAlert, Settings, HardDrive, BarChart3, LineChart, FileCode } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard | Developer Platform Architecture",
  description: "Architectural dashboard placeholder demonstrating the future CMS scalability.",
}

const stats = [
  { label: "Active Database Records", value: "24", icon: Database, color: "text-indigo-400" },
  { label: "System Media Storage", value: "1.2 GB / 10 GB", icon: HardDrive, color: "text-purple-400" },
  { label: "API Endpoint Telemetry Uptime", value: "99.98%", icon: LineChart, color: "text-emerald-400" },
]

const modules = [
  {
    title: "Blog CMS Manager",
    description: "Write and edit posts utilizing standard Markdown or import dynamic drafts. Supports tags, reading-time estimations, and cover assets mapping.",
    status: "Architecture Ready",
    icon: FileText,
  },
  {
    title: "Project Showcase Manager",
    description: "Configure case studies, problem-solution descriptions, dynamic tech stack badges, roadmap sequences, and github/demo link routes.",
    status: "Architecture Ready",
    icon: FileCode,
  },
  {
    title: "Knowledge Notes Editor",
    description: "Publish quick reference sheets, distributed algorithms descriptions, syntax cheatsheets directly into categorized notes rings.",
    status: "Architecture Ready",
    icon: Settings,
  },
  {
    title: "System Analytics Dashboard",
    description: "Monitor API connection thresholds, page render speeds, search query terms, and contact form transmission telemetry.",
    status: "Planning Stage",
    icon: BarChart3,
  },
]

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 flex flex-col gap-12">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 border-b border-border/20 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground">
              Developer Platform Admin CMS
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Admin control console layout demonstrating future scalability pathways.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Safety Notice Warning */}
      <ScrollReveal>
        <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-200/90 leading-relaxed">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex flex-col gap-1">
            <strong className="font-semibold text-foreground">Architectural Mock Mode</strong>
            <span>
              This is a structural placeholder showing how the CMS module integrates. In a fully configured production state, these routes are wrapped in Next.js Middleware check guards against OAuth auth tokens to secure database edit endpoints.
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((st, idx) => {
          const Icon = st.icon
          return (
            <ScrollReveal key={idx}>
              <Card className="bg-card/25 border-border/40 backdrop-blur-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    {st.label}
                  </span>
                  <Icon className={`h-4 w-4 shrink-0 ${st.color}`} />
                </CardHeader>
                <CardContent>
                  <dd className="font-mono text-2xl font-bold tracking-tight text-foreground">
                    {st.value}
                  </dd>
                </CardContent>
              </Card>
            </ScrollReveal>
          )
        })}
      </div>

      {/* CMS Module Areas */}
      <section className="flex flex-col gap-8">
        <ScrollReveal className="max-w-2xl flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Modular CMS Control Planes
          </h2>
          <p className="text-sm text-muted-foreground font-sans">
            Administrative layouts prepared for database mutation mappings.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((mod, idx) => {
            const Icon = mod.icon
            return (
              <ScrollReveal key={idx}>
                <Card className="h-full bg-card/20 border-border/30 hover:border-border/60 transition-all">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-zinc-500/10 p-2 text-zinc-400 border border-zinc-500/20 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="font-heading text-base font-bold text-foreground">
                        {mod.title}
                      </CardTitle>
                    </div>
                    <Badge variant={mod.status === "Planning Stage" ? "outline" : "secondary"} className="font-mono text-[9px]">
                      {mod.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {mod.description}
                  </CardContent>
                </Card>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

    </div>
  )
}
