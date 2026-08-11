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
    value: "Mathura / Mathura, India",
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
          <div className="flex flex-col gap-6">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon
              return (
                <Card key={idx} className="bg-card/25 border-border/40 backdrop-blur-sm">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary border border-primary/20 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {info.label}
                      </span>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
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
          <Card className="bg-card/20 border-border/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Developer Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4 text-sm font-semibold">
              <a
                href="https://github.com/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>github.com/dhananjaysinghk</span>
              </a>
              <a
                href="https://linkedin.com/in/dhananjaysinghk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>linkedin.com/in/dhananjaysinghk</span>
              </a>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Right Column: Contact Form */}
        <ScrollReveal delay={0.1} className="lg:col-span-2">
          <Card className="bg-card/25 border-border/40 backdrop-blur-sm p-6 sm:p-8">
            <ContactForm />
          </Card>
        </ScrollReveal>

      </div>

    </div>
  )
}
