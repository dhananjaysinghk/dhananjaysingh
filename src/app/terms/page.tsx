import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Scale } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | Dhananjay Singh",
  description: "Read the terms of service regarding opensource code use, sandbox terminal usage, and liability limits.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 flex flex-col gap-10">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 border-b border-border/20 pb-8">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Scale className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Legal Compliance
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          Terms of Service
        </h1>
        <p className="text-sm font-mono text-muted-foreground">
          Last Updated: August 2026
        </p>
      </ScrollReveal>

      {/* Content */}
      <ScrollReveal className="flex flex-col gap-8 text-base leading-relaxed text-muted-foreground font-sans">
        
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">1. Acceptance of Terms</h2>
          <p>
            By accessing this portfolio and sandbox website (dhananjay.dev), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, you are prohibited from using or accessing this site.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">2. Open Source License & Intellectual Property</h2>
          <p>
            The custom styling layouts, markdown compilation engine, and portfolio code are open source under the MIT License, except where specified (e.g. specific project code repositories which carry their own license parameters).
          </p>
          <p>
            Any written blog articles, design graphics, and personal stories are the intellectual property of Dhananjay Singh and may not be reproduced without attribution or written permission.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">3. Terminal Sandbox Usage</h2>
          <p>
            The terminal console is a browser-only simulation. You agree not to attempt to execute exploits, cross-site scripting (XSS), or injection payloads against the input parameters of the command prompt interface.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">4. Disclaimer of Liability</h2>
          <p>
            The materials and code reference notes on this website are provided on an &apos;as is&apos; basis. Dhananjay Singh makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties of merchantability or fitness for a particular purpose.
          </p>
        </div>

      </ScrollReveal>

    </div>
  )
}
