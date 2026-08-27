"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Share2, Check, Copy, Twitter, Linkedin, Heart } from "lucide-react"

interface PostInteractionsProps {
  title: string
  slug: string
  type?: "blog" | "project"
}

interface Reaction {
  emoji: string
  label: string
  count: number
}

const DEFAULT_REACTIONS: Reaction[] = [
  { emoji: "🚀", label: "Shipped", count: 12 },
  { emoji: "💡", label: "Insightful", count: 8 },
  { emoji: "🔥", label: "Mindblown", count: 15 },
  { emoji: "⚡", label: "Super Fast", count: 6 },
]

export function PostInteractions({ title, slug, type = "blog" }: PostInteractionsProps) {
  const [copied, setCopied] = useState(false)
  const [reactions, setReactions] = useState<Reaction[]>(DEFAULT_REACTIONS)
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({})

  const storageKey = `ds_reactions_${type}_${slug}`

  // Load reactions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserReacted(parsed.userReacted || {})
        if (parsed.reactions) {
          setReactions(parsed.reactions)
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey])

  const handleReaction = (index: number) => {
    const reaction = reactions[index]
    const alreadyReacted = userReacted[reaction.emoji]

    const updatedReactions = reactions.map((r, i) => {
      if (i === index) {
        return { ...r, count: alreadyReacted ? r.count - 1 : r.count + 1 }
      }
      return r
    })

    const updatedUserReacted = {
      ...userReacted,
      [reaction.emoji]: !alreadyReacted,
    }

    setReactions(updatedReactions)
    setUserReacted(updatedUserReacted)

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          reactions: updatedReactions,
          userReacted: updatedUserReacted,
        })
      )
    } catch {
      // Ignore storage errors
    }
  }

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://dhananjay.dev/${type}/${slug}`
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${title}" by @dhananjaysinghk`)}&url=${encodeURIComponent(shareUrl)}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-y border-border/20 py-6 my-10 font-sans">
      {/* Reactions */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Was this helpful?
        </span>
        <div className="flex flex-wrap gap-2">
          {reactions.map((r, i) => {
            const hasReacted = !!userReacted[r.emoji]
            return (
              <motion.button
                key={r.emoji}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleReaction(i)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono border transition-all ${
                  hasReacted
                    ? "bg-primary/20 text-primary border-primary/50 shadow-xs"
                    : "border-border/30 bg-card/25 text-muted-foreground hover:text-foreground hover:border-border/60"
                }`}
                title={r.label}
              >
                <span>{r.emoji}</span>
                <span className="font-semibold">{r.count}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Share actions */}
      <div className="flex flex-col gap-2 self-start sm:self-auto">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Share
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/25 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
            title="Copy link to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy link</span>
              </>
            )}
          </button>

          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border/30 bg-card/25 p-2 text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
            title="Share on X"
          >
            <Twitter className="h-3.5 w-3.5" />
          </a>

          <a
            href={linkedinShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border/30 bg-card/25 p-2 text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
            title="Share on LinkedIn"
          >
            <Linkedin className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
