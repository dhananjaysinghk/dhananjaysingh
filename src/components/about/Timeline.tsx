"use client"

import React from "react"
import { Briefcase, GraduationCap } from "lucide-react"
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animation/motion-wrapper"

export interface TimelineEvent {
  id: string
  role: string
  company: string
  location?: string | null
  startDate: string
  endDate?: string | null // Null if present
  description: string[]
  type: "work" | "education"
}

interface TimelineProps {
  events: TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative border-l-2 border-border/60 ml-4 md:ml-6 space-y-12 py-4">
      <StaggerContainer>
        {events.map((event) => {
          const isCurrent = !event.endDate || event.endDate.toLowerCase().includes("present")
          const isWork = event.type === "work"

          return (
            <StaggerItem key={event.id} className="relative pl-8 md:pl-10 group">
              {/* Timeline Dot Indicator */}
              <div
                className={`absolute -left-4.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all duration-300 ${
                  isCurrent
                    ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/20"
                    : "border-border bg-card text-muted-foreground group-hover:border-primary/60 group-hover:text-primary"
                }`}
              >
                {isWork ? (
                  <Briefcase className="h-4 w-4" />
                ) : (
                  <GraduationCap className="h-4 w-4" />
                )}
                {isCurrent && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              {/* Event Content Card */}
              <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full border border-border/30 bg-muted/40 text-foreground/80">
                    {event.startDate} — {event.endDate || "Present"}
                  </span>
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                      isWork
                        ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    }`}
                  >
                    {isWork ? "Work Experience" : "Education"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {event.role}
                  </h4>
                  <span className="text-sm font-medium text-muted-foreground">
                    {event.company} {event.location ? `• ${event.location}` : ""}
                  </span>
                </div>

                <ul className="list-disc list-outside ml-4 mt-1 space-y-1.5 text-sm text-muted-foreground/90 leading-relaxed">
                  {event.description.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          )
        })}
      </StaggerContainer>
    </div>
  )
}
