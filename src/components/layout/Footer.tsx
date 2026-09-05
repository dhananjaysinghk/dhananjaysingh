import React from "react"
import Link from "next/link"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-background/50 py-12 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              © {currentYear} Dhananjay Singh. All rights reserved.
            </span>
            {/* Status dot */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono tracking-tight text-muted-foreground">
                Available for contract & remote roles
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex space-x-6">
            <a
              href="https://github.com/dhananjaysinghk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub Profile"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com/in/dhananjaysinghk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/dhananjay_real"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter Profile"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="mailto:dhananjay6903@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Send Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>

          {/* Utility links */}
          <div className="flex space-x-6 text-xs font-medium text-muted-foreground">
            <Link href="/roadmap" className="hover:text-foreground transition-colors">
              Roadmap
            </Link>
            <Link href="/adr" className="hover:text-foreground transition-colors">
              Architecture ADRs
            </Link>
            <Link href="/tools" className="hover:text-foreground transition-colors">
              Systems Lab
            </Link>
            <Link href="/status" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              System Status
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>

        </div>
      </div>
    </footer>
  )
}
