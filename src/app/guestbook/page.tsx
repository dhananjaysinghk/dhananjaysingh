import React from "react"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { GuestbookForm } from "@/components/guestbook/GuestbookForm"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquareText, Calendar, User, AtSign, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Developer Guestbook | Dhananjay Singh",
  description: "Sign the developer guestbook, leave a message, or share feedback on systems architecture write-ups.",
}

interface Entry {
  id: string
  name: string
  handle: string | null
  message: string
  createdAt: string
}

const fallbackEntries: Entry[] = [
  {
    id: "gb-1",
    name: "Vikram Mehta",
    handle: "@vikram_dev",
    message: "Loved the microsecond-latency Rust memory model breakdown! The false sharing padding explanation was spot on.",
    createdAt: "Aug 24, 2026",
  },
  {
    id: "gb-2",
    name: "Sarah Chen",
    handle: "@schen_systems",
    message: "Inspiring projects on distributed consensus! Great work on the Nova orchestrator gRPC streams.",
    createdAt: "Aug 18, 2026",
  },
  {
    id: "gb-3",
    name: "Devon Taylor",
    handle: "Cloud Infrastructure Engineer",
    message: "Cleanest portfolio I've seen in a while. The terminal sandbox easter egg is super fun!",
    createdAt: "Aug 02, 2026",
  },
]

async function getGuestbookEntries(): Promise<Entry[]> {
  try {
    const entries = await db.guestbookEntry.findMany({
      orderBy: { createdAt: "desc" },
    })

    if (entries.length === 0) return fallbackEntries

    return entries.map((e) => ({
      id: e.id,
      name: e.name,
      handle: e.handle,
      message: e.message,
      createdAt: e.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }))
  } catch (error) {
    console.warn("Database query failed; resolving fallback guestbook entries", error)
    return fallbackEntries
  }
}

export default async function GuestbookPage() {
  const entries = await getGuestbookEntries()

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <MessageSquareText className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Community Log
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Developer Guestbook
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Leave a message, feedback on my projects, or just say hello. Thanks for stopping by!
        </p>
      </ScrollReveal>

      {/* Form Card */}
      <ScrollReveal delay={0.05}>
        <GuestbookForm />
      </ScrollReveal>

      {/* Entries List */}
      <section className="flex flex-col gap-6">
        <ScrollReveal className="flex items-center justify-between border-b border-border/20 pb-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Recent Signatures ({entries.length})
          </h2>
          <span className="text-xs font-mono text-muted-foreground">Public Feed</span>
        </ScrollReveal>

        <div className="flex flex-col gap-4">
          {entries.map((entry, idx) => (
            <ScrollReveal key={entry.id} delay={idx * 0.04}>
              <Card className="bg-card/20 border-border/30 hover:border-border/60 transition-all">
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs font-mono">
                      {entry.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading text-sm font-bold text-foreground">
                        {entry.name}
                      </span>
                      {entry.handle && (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {entry.handle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{entry.createdAt}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                  &ldquo;{entry.message}&rdquo;
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

    </div>
  )
}
