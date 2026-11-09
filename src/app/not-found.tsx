"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Home, FolderGit2, BookOpen, FileCode2, Activity, Mail, Search } from "lucide-react"
import { motion } from "framer-motion"
import { soundFx } from "@/lib/sound"

const QUICK_LINKS = [
  { label: "Projects", href: "/projects", icon: FolderGit2 },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Notes", href: "/notes", icon: FileCode2 },
  { label: "Telemetry", href: "/status", icon: Activity },
  { label: "Contact", href: "/contact", icon: Mail },
]

export default function NotFound() {
  return (
    <div className="flex flex-col grow items-center justify-center py-20 px-6">
      <div className="mx-auto max-w-lg w-full text-center flex flex-col items-center gap-8">
        
        {/* Terminal Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-xl border border-border/80 bg-zinc-950 p-6 text-left font-mono text-xs text-zinc-100 shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4 select-none">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-zinc-500 text-[10px]">sh --route-resolver</span>
          </div>

          <div className="space-y-2 leading-relaxed">
            <p className="text-zinc-500"># Resolving routing request...</p>
            <p className="text-red-400 font-bold">Error: STATUS_CODE_404 (OBJECT_NOT_FOUND)</p>
            <p className="text-zinc-400">The requested resource could not be found on this platform server.</p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400">
              <span>$</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Route Resolution Failed
          </h1>
          <p className="text-sm text-muted-foreground font-sans max-w-sm leading-relaxed">
            The page you are looking for has been moved, archived, or does not exist in the platform tree.
          </p>
        </div>

        {/* Back CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/"
            onClick={() => soundFx.playClick()}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            <Home className="h-3.5 w-3.5" />
            Return Home
          </Link>
          <button
            onClick={() => {
              soundFx.playClick()
              window.history.back()
            }}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-all text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </button>
        </div>

        {/* Quick Directory Directory Pills */}
        <div className="w-full border-t border-border/30 pt-6 flex flex-col items-center gap-3">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Explore Active Directories
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => soundFx.playClick()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-card/30 px-2.5 py-1 text-xs font-sans text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-card/60 transition-all"
                >
                  <Icon className="h-3 w-3" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          <p className="text-[11px] text-muted-foreground/70 font-mono mt-2 inline-flex items-center gap-1">
            <Search className="h-3 w-3" /> Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/40 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/40 text-[10px]">K</kbd> to open Command Menu
          </p>
        </div>

      </div>
    </div>
  )
}
