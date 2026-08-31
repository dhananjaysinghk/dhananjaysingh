"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitContactForm } from "@/app/actions/contact"
import { soundFx } from "@/lib/sound"

export function QuickContactModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Listen for Cmd+M or custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
        e.preventDefault()
        setIsOpen((prev) => {
          if (!prev) soundFx.playToggle()
          return !prev
        })
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    const handleCustomOpen = () => {
      soundFx.playToggle()
      setIsOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("open-quick-contact", handleCustomOpen)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("open-quick-contact", handleCustomOpen)
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      soundFx.playClick()
      const res = await submitContactForm({
        name,
        email,
        subject: "Quick Message via Modal (Cmd+M)",
        message,
      })

      if (res.success) {
        soundFx.playChime()
        setStatus({ success: true })
        setName("")
        setEmail("")
        setMessage("")
        setTimeout(() => {
          setIsOpen(false)
          setStatus(null)
        }, 2000)
      } else {
        setStatus({ error: res.error || "Failed to transmit message." })
      }
    } catch {
      setStatus({ error: "Network transmission error occurred." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary border border-primary/20">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Quick Message
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      Shortcut: ⌘M
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Dhananjay Singh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-card/30 border-border/40 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-card/30 border-border/40 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Message
                  </label>
                  <Textarea
                    rows={3}
                    required
                    placeholder="Briefly describe your question or opportunity..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-card/30 border-border/40 text-xs leading-relaxed"
                  />
                </div>

                {status && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-mono ${
                      status.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                    }`}
                  >
                    {status.success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Message dispatched successfully!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <span>{status.error}</span>
                      </>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex gap-2 text-xs font-mono mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Transmitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
