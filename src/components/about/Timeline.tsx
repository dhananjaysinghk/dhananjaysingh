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
    <div className="relative border-l border-border/60 ml-4 md:ml-6 space-y-12 py-4">
      <StaggerContainer>
        {events.map((event) => (
          <StaggerItem key={event.id} className="relative pl-8 md:pl-10 group">
            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[17px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:border-primary group-hover:text-primary">
              {event.type === "work" ? (
                <Briefcase className="h-4 w-4" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
            </div>

            {/* Event Content */}
            <div className="flex flex-col gap-2 rounded-xl border border-border/20 bg-card/25 p-6 backdrop-blur-sm transition-all hover:border-border/80 hover:bg-card/45">
              <span className="font-mono text-xs text-muted-foreground font-semibold">
                {event.startDate} — {event.endDate || "Present"}
              </span>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="font-heading text-lg font-bold text-foreground">
                  {event.role}
                </h4>
                <span className="text-sm font-medium text-muted-foreground">
                  {event.company} {event.location ? `• ${event.location}` : ""}
                </span>
              </div>

              <ul className="list-disc list-outside ml-4 mt-2 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
                {event.description.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}
