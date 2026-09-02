"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Send, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { submitGuestbookEntry } from "@/app/actions/guestbook"
import { soundFx } from "@/lib/sound"

export function GuestbookForm() {
  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      soundFx.playClick()
      const res = await submitGuestbookEntry({
        name,
        handle,
        message,
      })

      if (res.success) {
        soundFx.playChime()
        setStatus({ success: true })
        setName("")
        setHandle("")
        setMessage("")
      } else {
        setStatus({ error: res.error || "Failed to sign guestbook." })
      }
    } catch {
      setStatus({ error: "Network connection error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4 border-b border-border/20">
        <div className="flex items-center gap-2 text-primary font-heading text-base font-bold">
          <Sparkles className="h-4 w-4" />
          <span>Leave a Message or Greeting</span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-muted-foreground">
                Your Name *
              </label>
              <Input
                type="text"
                required
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="bg-card/30 border-border/40 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-muted-foreground">
                Handle (Optional)
              </label>
              <Input
                type="text"
                placeholder="@alex_dev or alex@company.com"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                disabled={isSubmitting}
                className="bg-card/30 border-border/40 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-muted-foreground">
              Message *
            </label>
            <Textarea
              rows={3}
              required
              placeholder="Leave a message, feedback on my systems writeups, or say hi..."
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
                  <span>Your entry has been signed and added to the guestbook!</span>
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
            className="w-full sm:w-auto self-start inline-flex gap-2 text-xs font-mono mt-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Sign Guestbook
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
