"use client"

import React from "react"
import { ScrollReveal } from "@/components/animation/motion-wrapper"

const stats = [
  { label: "Years of Engineering", value: "8+" },
  { label: "Systems Architecture Uptime", value: "99.999%" },
  { label: "Production Containers", value: "2,500+" },
  { label: "Open Source Commits", value: "1,200+" },
]

export function Stats() {
  return (
    <section className="border-y border-border/40 bg-card/10 py-12 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col gap-2">
                <dd className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </dd>
                <dt className="text-xs sm:text-sm font-medium tracking-tight text-muted-foreground uppercase">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </ScrollReveal>
      </div>
    </section>
  )
}
