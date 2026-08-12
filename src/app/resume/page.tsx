"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { FileText, Download, Briefcase, GraduationCap, Trophy, Globe, Mail, Phone, MapPin } from "lucide-react"

const skills = {
  languages: ["Go", "TypeScript", "Rust", "Java", "Python", "SQL", "C++"],
  frameworks: ["React", "Next.js (App Router)", "Node.js", "Express", "Hono", "Tailwind CSS"],
  infrastructure: ["Docker", "Kubernetes", "PostgreSQL", "Redis", "Prisma ORM", "AWS", "Git"],
}

const experience = [
  {
    role: "Software Engineer Intern",
    company: "InnovateTech Cloud",
    duration: "May 2025 — Present",
    bullets: [
      "Worked on implementing real-time event-streaming messaging brokers using Go and Raft consensus.",
      "Optimized cold start times of container schedulers by 35% through profiling and code refactoring.",
      "Collaborated with core infrastructure engineers to configure service mesh networks.",
    ],
  },
  {
    role: "Backend Developer Intern",
    company: "Nexus Finance",
    duration: "May 2024 — Jul 2024",
    bullets: [
      "Developed high-throughput transaction ledger interfaces using Rust and PostgreSQL.",
      "Assisted in configuring active-active database replicas to improve failover latency.",
    ],
  },
]

const education = [
  {
    degree: "Bachelor of Technology in Computer Science & Engineering",
    school: "GLA University",
    duration: "2023 — 2027",
    details: "GPA: 8.8/10. Specializing in systems engineering and distributed computing architectures.",
  },
]

const achievements = [
  {
    title: "1st Place - University Hackathon",
    issuer: "GLA Computing Club",
    description: "Built a decentralized file distribution tool using Go and WebRTC under 24 hours.",
  },
  {
    title: "Top 5% Solver",
    issuer: "Global Algorithms Platform",
    description: "Successfully solved 400+ complex data structure and algorithm challenges.",
  },
]

export default function ResumePage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-10">
      
      {/* Action Header - Hidden during print */}
      <ScrollReveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary border border-primary/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground">
              Interactive Resume
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Print or download a dynamically generated PDF copy of my resume.
            </p>
          </div>
        </div>

        <Button onClick={handlePrint} className="inline-flex gap-2 self-start sm:self-auto">
          <Download className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </ScrollReveal>

      {/* Resume Card Frame */}
      <ScrollReveal delay={0.1}>
        <div className="bg-card/20 border border-border/40 rounded-2xl p-8 sm:p-12 backdrop-blur-sm shadow-sm print:border-none print:bg-white print:text-black print:p-0 print:shadow-none">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-border/20 print:border-zinc-300">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground print:text-black">
                Dhananjay Singh
              </h2>
              <span className="text-sm font-semibold tracking-wider uppercase text-primary print:text-zinc-600">
                Software Engineer
              </span>
            </div>

            {/* Direct Contact links */}
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground font-mono print:text-zinc-700">
              <a href="mailto:dhananjay6903@gmail.com" className="flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary print:text-zinc-600" />
                <span>dhananjay6903@gmail.com</span>
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary print:text-zinc-600" />
                <span>Mathura, India</span>
              </span>
              <a href="https://github.com/dhananjaysinghk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground">
                <Globe className="h-4 w-4 shrink-0 text-primary print:text-zinc-600" />
                <span>github.com/dhananjaysinghk</span>
              </a>
            </div>
          </div>

          {/* Body Section Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            
            {/* Left Column: Skills / Education */}
            <div className="md:col-span-1 flex flex-col gap-8">
              
              {/* Technical skills */}
              <div className="flex flex-col gap-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-800 border-b border-border/25 pb-2">
                  Technical Stack
                </h3>
                
                <div className="flex flex-col gap-3 font-sans text-sm">
                  <div>
                    <span className="font-semibold block mb-1 text-xs text-foreground/80 print:text-zinc-700">Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {skills.languages.map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0 print:border print:border-zinc-300 print:bg-white print:text-black">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-semibold block mb-1 text-xs text-foreground/80 print:text-zinc-700">Frameworks</span>
                    <div className="flex flex-wrap gap-1">
                      {skills.frameworks.map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0 print:border print:border-zinc-300 print:bg-white print:text-black">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold block mb-1 text-xs text-foreground/80 print:text-zinc-700">Infrastructure</span>
                    <div className="flex flex-wrap gap-1">
                      {skills.infrastructure.map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0 print:border print:border-zinc-300 print:bg-white print:text-black">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="flex flex-col gap-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-800 border-b border-border/25 pb-2">
                  Education
                </h3>
                {education.map((edu, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-foreground print:text-black leading-snug">{edu.degree}</span>
                    <span className="text-muted-foreground print:text-zinc-700 font-medium">{edu.school}</span>
                    <span className="font-mono text-[10px] text-muted-foreground print:text-zinc-600">{edu.duration}</span>
                    <p className="mt-1 text-muted-foreground print:text-zinc-600 leading-relaxed font-sans">{edu.details}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: Work experience / Achievements */}
            <div className="md:col-span-2 flex flex-col gap-8">
              
              {/* Experience */}
              <div className="flex flex-col gap-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-800 border-b border-border/25 pb-2">
                  Experience History
                </h3>
                <div className="flex flex-col gap-6">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-foreground print:text-black text-sm">{exp.role}</span>
                        <span className="font-mono text-[10px] text-muted-foreground print:text-zinc-600">{exp.duration}</span>
                      </div>
                      <span className="text-muted-foreground print:text-zinc-700 font-medium">{exp.company}</span>
                      <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-muted-foreground print:text-zinc-600 leading-relaxed font-sans">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="flex flex-col gap-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-800 border-b border-border/25 pb-2">
                  Honors & Achievements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-xs">
                      <span className="font-bold text-foreground print:text-black">{ach.title}</span>
                      <span className="text-muted-foreground print:text-zinc-700 font-medium">{ach.issuer}</span>
                      <p className="mt-0.5 text-muted-foreground print:text-zinc-600 leading-relaxed font-sans">{ach.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </ScrollReveal>

    </div>
  )
}
