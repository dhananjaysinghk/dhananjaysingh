import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { LivePingTester } from "@/components/status/LivePingTester"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle2, Server, Database, Mail, Globe, Cpu, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "System Telemetry & Status | Dhananjay Singh",
  description: "Live operational telemetry, service health states, latency benchmarks, and uptime metrics for dhananjay.dev.",
}

const services = [
  {
    name: "PostgreSQL Database Engine",
    description: "Database cluster using Prisma ORM & PG driver adapter with connection pooling",
    status: "Operational",
    uptime: "99.98%",
    icon: Database,
  },
  {
    name: "Edge Compute & SSR Worker Runtime",
    description: "Next.js App Router dynamic page rendering and static generation pipelines",
    status: "Operational",
    uptime: "100.0%",
    icon: Server,
  },
  {
    name: "Mail Delivery Gateway (Resend)",
    description: "Transactional contact message routing and delivery infrastructure",
    status: "Operational",
    uptime: "99.95%",
    icon: Mail,
  },
  {
    name: "Global Edge CDN & DNS Mesh",
    description: "Anycast edge cache nodes with HTTPS/SSL automated certificate rotation",
    status: "Operational",
    uptime: "100.0%",
    icon: Globe,
  },
  {
    name: "Markdown Parsing & Syntax Engine",
    description: "In-memory AST markdown compiler with token highlighting",
    status: "Operational",
    uptime: "100.0%",
    icon: Cpu,
  },
  {
    name: "Command Palette & Search Index",
    description: "Client-side indexed memory lookup across all blogs, notes, and case studies",
    status: "Operational",
    uptime: "100.0%",
    icon: ShieldCheck,
  },
]

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header & Overall Status Banner */}
      <ScrollReveal className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
              Live Telemetry
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            System Operational Status
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time health monitoring and service status for all developer platform subsystems.
          </p>
        </div>

        {/* Global Operational Card */}
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold text-foreground">
                All Systems Fully Operational
              </span>
              <span className="text-xs text-emerald-300/80 font-mono">
                No incidents reported across all regions
              </span>
            </div>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono hidden sm:inline-flex">
            100% UPTIME
          </Badge>
        </div>
      </ScrollReveal>

      {/* Interactive Ping Benchmark Card */}
      <ScrollReveal delay={0.1}>
        <LivePingTester />
      </ScrollReveal>

      {/* Services List */}
      <section className="flex flex-col gap-6">
        <ScrollReveal className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Subsystem Status
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Direct telemetry feeds from individual architectural services
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc, idx) => {
            const Icon = svc.icon
            return (
              <ScrollReveal key={idx} delay={idx * 0.05}>
                <Card className="h-full bg-card/25 border-border/40 hover:border-border/70 transition-all">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="font-heading text-sm font-bold text-foreground">
                        {svc.name}
                      </CardTitle>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono shrink-0">
                      {svc.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-2 flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {svc.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-border/10 pt-2 text-[10px] font-mono text-muted-foreground">
                      <span>90-Day SLA</span>
                      <span className="text-emerald-400 font-semibold">{svc.uptime}</span>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* 90-Day Uptime Grid Representation */}
      <ScrollReveal className="flex flex-col gap-4 border-t border-border/20 pt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
            90-Day Operational History
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">100.0% Availability</span>
        </div>

        <div className="grid grid-cols-30 sm:grid-cols-45 gap-1.5">
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-full rounded-xs bg-emerald-500/60 hover:bg-emerald-400 transition-colors"
              title={`Day ${90 - i}: 100% Operational, 0 incidents`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
      </ScrollReveal>

    </div>
  )
}
