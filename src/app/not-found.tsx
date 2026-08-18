"use client"

import React from "react"
import Link from "next/link"
import { Terminal, ArrowLeft, Home } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="flex flex-col grow items-center justify-center py-20 px-6">
      <div className="mx-auto max-w-md w-full text-center flex flex-col items-center gap-8">
        
        {/* Terminal Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-xl border border-border/80 bg-zinc-950 p-6 text-left font-mono text-xs text-zinc-100 shadow-xl"
        >
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
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Route Resolution Failed
          </h1>
          <p className="text-sm text-muted-foreground font-sans max-w-xs leading-relaxed">
            The page you are looking for has been moved, archived, or does not exist in the routing tree.
          </p>
        </div>

        {/* Back CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <Link
            href="/"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            <Home className="h-3.5 w-3.5" />
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </button>
        </div>

      </div>
    </div>
  )
}
