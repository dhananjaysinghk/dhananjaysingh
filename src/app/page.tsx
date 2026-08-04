import React from "react"
import Link from "next/link"
import { ArrowRight, Terminal } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col flex-grow items-center justify-center py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center sm:text-left flex flex-col gap-8">
        
        {/* Terminal/Status Badge */}
        <div className="inline-flex items-center gap-2 self-center sm:self-start rounded-full border border-border bg-card/50 px-4 py-1.5 backdrop-blur-sm">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">
            systems initialized • dev environment active
          </span>
        </div>

        {/* Hero title */}
        <h1 className="max-w-4xl font-heading text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/75 bg-clip-text text-transparent">
          Architecting & Building scalable software platforms.
        </h1>

        {/* Hero desc */}
        <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed">
          I am a Staff Software Engineer & Solution Architect. This is my digital home, personal archive, and sandbox for projects and technical ideas.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link
            href="/projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-all"
          >
            Explore Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
          
          <Link
            href="/about"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-card/40 px-5 py-3 text-sm font-medium hover:bg-muted hover:text-foreground transition-all"
          >
            Read My Story
          </Link>
        </div>

      </div>
    </div>
  )
}
