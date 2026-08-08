"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Terminal, Github, Linkedin, Twitter, Mail } from "lucide-react"
import { FadeIn, SlideUp } from "@/components/animation/motion-wrapper"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          
          {/* Status Badge */}
          <SlideUp delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                Currently focusing on high-performance backend architectures
              </span>
            </div>
          </SlideUp>

          {/* Heading */}
          <SlideUp delay={0.2}>
            <h1 className="max-w-4xl font-heading text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-[1.1]">
              Architecting systems for <br />
              <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                maximum scale & reliability.
              </span>
            </h1>
          </SlideUp>

          {/* Intro Description */}
          <SlideUp delay={0.3}>
            <p className="max-w-3xl text-lg sm:text-xl leading-relaxed text-muted-foreground font-sans">
              I am a Software Engineer & Computer Science Student at GLA University. I focus on architecting robust backend systems, building distributed microservices, and designing low-latency application structures.
            </p>
          </SlideUp>

          {/* Social Links & CTA Buttons */}
          <SlideUp delay={0.4} className="flex flex-col sm:flex-row items-center gap-6 mt-4">
            <div className="flex w-full sm:w-auto items-center gap-4">
              <Link
                href="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Showcase Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-card/30 px-5 py-3 text-sm font-semibold hover:bg-muted transition-all"
              >
                Let&apos;s Connect
              </Link>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-5 sm:border-l sm:border-border/60 sm:pl-6 py-2">
              <a
                href="https://github.com/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/dhananjay_real"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:dhananjay6903@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </SlideUp>

        </div>
      </div>
    </section>
  )
}
