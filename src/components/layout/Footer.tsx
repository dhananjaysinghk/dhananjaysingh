import React from "react"
import Link from "next/link"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand & Status Column */}
          <div className="flex flex-col space-y-4 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold tracking-tight text-foreground">
                DS<span className="text-muted-foreground">.dev</span>
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                v2.0
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Software Engineer & Computer Science Student at GLA University. Focused on distributed systems, low-latency backends, and high-performance infrastructure.
            </p>

            {/* Status Pill Badge */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-medium">Available for Software Engineering Roles</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/in/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/dhananjay_real"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="Twitter/X Profile"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="mailto:dhananjay6903@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                aria-label="Send Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column: Work & Writing */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Work & Writing
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/projects" className="transition-colors hover:text-foreground">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-foreground">
                  Technical Blog
                </Link>
              </li>
              <li>
                <Link href="/notes" className="transition-colors hover:text-foreground">
                  Knowledge Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Navigation */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  About Me
                </Link>
              </li>
              <li>
                <Link href="/resume" className="transition-colors hover:text-foreground">
                  Resume / CV
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-foreground">
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Resources & Info */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/uses" className="transition-colors hover:text-foreground">
                  Hardware & Setup
                </Link>
              </li>
              <li>
                <Link href="/guestbook" className="transition-colors hover:text-foreground">
                  Guestbook
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Dhananjay Singh. Built with Next.js, TypeScript & Tailwind CSS.
          </p>

          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/feed.xml" className="hover:text-foreground transition-colors">
              RSS Feed
            </Link>
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
