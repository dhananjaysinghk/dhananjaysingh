import React from "react"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { Timeline, TimelineEvent } from "@/components/about/Timeline"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, Target, Compass, Code, Server, Shield, Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "About Dhananjay Singh | Software Engineer & Student",
  description: "Read my academic journey, core values, mission, vision, and project history.",
}

const fallbackEvents: TimelineEvent[] = [
  {
    id: "work-1",
    role: "Software Engineer Intern",
    company: "InnovateTech Cloud",
    location: "Remote",
    startDate: "May 2025",
    endDate: "Present",
    description: [
      "Worked on implementing real-time event-streaming messaging brokers using Go and Raft consensus.",
      "Optimized cold start times of container schedulers by 35% through profiling and code refactoring.",
      "Collaborated with core infrastructure engineers to configure service mesh networks.",
    ],
    type: "work",
  },
  {
    id: "work-2",
    role: "Backend Developer Intern",
    company: "Nexus Finance",
    location: "Bengaluru, India",
    startDate: "May 2024",
    endDate: "Jul 2024",
    description: [
      "Developed high-throughput transaction ledger interfaces using Rust and PostgreSQL.",
      "Assisted in configuring active-active database replicas to improve failover latency.",
    ],
    type: "work",
  },
  {
    id: "edu-1",
    role: "Bachelor of Technology in Computer Science & Engineering",
    company: "GLA University",
    location: "Mathura, India",
    startDate: "Jul 2023",
    endDate: "Expected May 2027",
    description: [
      "Currently pursuing B.Tech in Computer Science & Engineering.",
      "Core coursework includes Data Structures & Algorithms, Operating Systems, Database Management Systems, and Distributed Computing.",
      "Active participant in tech communities, coding contests, and building open-source projects.",
    ],
    type: "education",
  },
]

const values = [
  {
    title: "Mechanical Sympathy",
    description: "Writing code that understands the underlying hardware—optimizing CPU cache lines, non-blocking lockless memory structures, and disk alignment.",
    icon: Code,
  },
  {
    title: "Defensive Architecture",
    description: "Designing systems assuming failures will happen. Establishing graceful degradation, rate limiting, circuit breakers, and comprehensive telemetry dashboards.",
    icon: Shield,
  },
  {
    title: "Aggressive Simplicity",
    description: "Avoiding architectural bloating. Building the simplest distributed system that satisfies compliance, load, and future engineering expansions.",
    icon: Layers,
  },
  {
    title: "Telemetry First",
    description: "If it is not observed, it does not exist. Baking tracing, structured logs, and metrics into the fabric of the code from day zero.",
    icon: Server,
  },
]

function formatYearMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function parseDateString(dateStr: string | null | undefined): number {
  if (!dateStr || dateStr === "Present" || dateStr === "current" || dateStr.toLowerCase().includes("present")) {
    return new Date().getTime()
  }
  const cleanStr = dateStr.replace(/^Expected\s+/i, "")
  const parsed = Date.parse(cleanStr)
  if (!isNaN(parsed)) return parsed

  const parts = cleanStr.split(" ")
  if (parts.length === 1) {
    const year = parseInt(parts[0])
    if (!isNaN(year)) return new Date(year, 0, 1).getTime()
  } else if (parts.length === 2) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthIndex = monthNames.findIndex(m => parts[0].toLowerCase().startsWith(m.toLowerCase()))
    const year = parseInt(parts[1])
    if (monthIndex !== -1 && !isNaN(year)) {
      return new Date(year, monthIndex, 1).getTime()
    }
  }
  return 0
}

async function getTimelineEvents(): Promise<TimelineEvent[]> {
  try {
    const experiences = await db.experience.findMany({
      orderBy: { startDate: "desc" },
    })

    let workEvents: TimelineEvent[] = []
    if (experiences.length > 0) {
      workEvents = experiences.map((exp) => ({
        id: exp.id,
        role: exp.role,
        company: exp.company,
        location: exp.location,
        startDate: formatYearMonth(exp.startDate),
        endDate: exp.endDate ? formatYearMonth(exp.endDate) : "Present",
        description: exp.description,
        type: "work",
      }))
    } else {
      workEvents = fallbackEvents.filter((ev) => ev.type === "work")
    }

    const eduEvents = fallbackEvents.filter((ev) => ev.type === "education")
    const combined = [...workEvents, ...eduEvents]
    
    // Sort combined events reverse chronologically by endDate (to keep active/future education at the top)
    combined.sort((a, b) => {
      const dateA = parseDateString(a.endDate || "Present")
      const dateB = parseDateString(b.endDate || "Present")
      if (dateB !== dateA) {
        return dateB - dateA
      }
      return parseDateString(b.startDate) - parseDateString(a.startDate)
    })
    return combined
  } catch (error) {
    console.error("Database experienced read failures; utilizing fallbacks", error)
    const combined = [...fallbackEvents]
    combined.sort((a, b) => {
      const dateA = parseDateString(a.endDate || "Present")
      const dateB = parseDateString(b.endDate || "Present")
      if (dateB !== dateA) {
        return dateB - dateA
      }
      return parseDateString(b.startDate) - parseDateString(a.startDate)
    })
    return combined
  }
}

export default async function About() {
  const timelineEvents = await getTimelineEvents()

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 flex flex-col gap-20">
      
      {/* 1. Header Objective */}
      <ScrollReveal className="flex flex-col gap-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            My Story & Objective
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Designing systems that handle massive scale quietly.
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-sans">
          I am Dhananjay Singh, a software engineer and computer science student. My focus lies at the intersection of high-availability backend systems, distributed architectures, and writing clean, reliable code that scales.
        </p>
      </ScrollReveal>

      {/* 2. Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScrollReveal>
          <Card className="h-full bg-card/25 border-border/40 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500 border border-indigo-500/20">
                <Target className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg font-bold">My Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              To strip out unnecessary abstraction and build robust, high-performance computing backends that allow product creators and developers to scale their ideas instantly, without having to fight infrastructure bottlenecks.
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal>
          <Card className="h-full bg-card/25 border-border/40 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500 border border-purple-500/20">
                <Compass className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg font-bold">My Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              A software ecosystem where system integrity, performance compliance, and security are not bolt-on checklists, but foundational guarantees built into the core language models and architecture of every developer stack.
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      {/* 3. Core Values */}
      <section className="flex flex-col gap-10">
        <ScrollReveal className="max-w-2xl flex flex-col gap-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Architectural Philosophy & Values
          </h2>
          <p className="text-muted-foreground font-sans">
            Principles that guide my code decisions, database selections, and infrastructure schemas.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((val, idx) => {
            const Icon = val.icon
            return (
              <ScrollReveal
                key={idx}
                className="flex items-start gap-4 p-6 rounded-xl border border-border/20 bg-card/15 hover:border-border/70 hover:bg-card/30 transition-all"
              >
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary border border-primary/25">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    {val.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* 4. Timeline */}
      <section className="flex flex-col gap-10">
        <ScrollReveal className="max-w-2xl flex flex-col gap-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Engineering Journey & Timeline
          </h2>
          <p className="text-muted-foreground font-sans">
            An overview of my academic background and career trajectory building systems.
          </p>
        </ScrollReveal>

        <Timeline events={timelineEvents} />
      </section>

    </div>
  )
}
