import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | Dhananjay Singh",
  description: "Read the privacy policy regarding data collection, contact message handling, and user privacy guarantees.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 flex flex-col gap-10">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 border-b border-border/20 pb-8">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Security Compliance
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          Privacy Policy
        </h1>
        <p className="text-sm font-mono text-muted-foreground">
          Last Updated: August 2026
        </p>
      </ScrollReveal>

      {/* Content */}
      <ScrollReveal className="flex flex-col gap-8 text-base leading-relaxed text-muted-foreground font-sans">
        
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">1. Introduction</h2>
          <p>
            Welcome to the developer portfolio platform of Dhananjay Singh. This privacy policy describes what minimal data is collected when you interact with this site and how it is processed.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">2. Data Collection</h2>
          <p>
            This website prioritizes user privacy. We do not use third-party analytics trackers or tracking cookies.
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2">
            <li>
              <strong>Contact Messages:</strong> When you voluntarily submit a message via the Contact form, we collect your Name, Email, Subject, and Message.
            </li>
            <li>
              <strong>Server Telemetry logs:</strong> Our hosting provider (Vercel) may log standard network requests (e.g. IP address, browser type, request time) to prevent DDoS attacks and ensure server performance.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">3. Data Processing & Storage</h2>
          <p>
            Any message submitted via the contact form is saved securely in our PostgreSQL database (managed via Prisma) and forwarded via the Resend API to the administrator. We do not sell, rent, or distribute this information to third-party marketing services.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground font-heading">4. Contact Information</h2>
          <p>
            If you have questions regarding this policy or want to request the deletion of your submitted contact messages, please write to: <a href="mailto:dhananjay6903@gmail.com" className="text-primary hover:underline">dhananjay6903@gmail.com</a>.
          </p>
        </div>

      </ScrollReveal>

    </div>
  )
}
