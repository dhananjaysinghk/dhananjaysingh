import React from "react"
import { Metadata } from "next"
import { ContactForm } from "@/components/contact/ContactForm"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Mail, Clock, MapPin, Github, Linkedin, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Dhananjay Singh | Systems Engineer",
  description: "Connect with Dhananjay Singh for software engineering, system architecture queries, or internship opportunities.",
}

const contactInfo = [
  {
    icon: Mail,
    label: "Direct Email",
    value: "dhananjay6903@gmail.com",
    href: "mailto:dhananjay6903@gmail.com",
  },
  {
    icon: Clock,
    label: "Response Target",
    value: "Within 24 Hours",
  },
  {
    icon: MapPin,
    label: "Current Base",
    value: "Mathura, Uttar Pradesh, India",
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 flex flex-col gap-12">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Connect
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Let&apos;s build something resilient
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-sans">
          Have an architecture query, distributed systems design challenge, or want to discuss internships? Submit the form or reach out directly via email.
        </p>
      </ScrollReveal>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Left Column: Direct Info */}
        <ScrollReveal className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon
              return (
                <Card
                  key={idx}
                  className="bg-card/30 border-border/40 hover:border-primary/40 hover:bg-card/50 transition-all duration-300 backdrop-blur-sm group relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {info.label}
                      </span>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-foreground truncate">
                          {info.value}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Social Profiles Card */}
          <Card className="bg-card/30 border-border/40 hover:border-border/70 backdrop-blur-sm transition-all">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Developer Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3 text-sm font-medium">
              <a
                href="https://github.com/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg border border-border/20 bg-muted/20 text-muted-foreground hover:text-foreground hover:border-border/50 hover:bg-muted/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Github className="h-4 w-4 text-foreground/80 group-hover:text-primary transition-colors" />
                  <span className="font-mono text-xs">github.com/dhananjaysinghk</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Follow</span>
              </a>
              <a
                href="https://linkedin.com/in/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg border border-border/20 bg-muted/20 text-muted-foreground hover:text-foreground hover:border-border/50 hover:bg-muted/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Linkedin className="h-4 w-4 text-foreground/80 group-hover:text-primary transition-colors" />
                  <span className="font-mono text-xs">linkedin.com/in/dhananjaysinghk</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Connect</span>
              </a>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Right Column: Contact Form */}
        <ScrollReveal delay={0.1} className="lg:col-span-2">
          <Card className="bg-card/30 border-border/40 hover:border-primary/30 backdrop-blur-md p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/10 via-primary to-primary/10" />
            <ContactForm />
          </Card>
        </ScrollReveal>

      </div>

    </div>
  )
}
