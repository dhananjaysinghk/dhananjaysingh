"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { submitContactForm } from "@/app/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react"

// Sync schema with server-side validation rules
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus(null)
    try {
      const response = await submitContactForm(data)
      if (response.success) {
        setSubmitStatus({ success: true, message: "Thank you! Your message has been sent successfully." })
        reset()
      } else {
        setSubmitStatus({ success: false, message: response.error || "An error occurred during submission." })
      }
    } catch (err) {
      setSubmitStatus({ success: false, message: "A network error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Dhananjay Singh"
          {...register("name")}
          disabled={isSubmitting}
          className="bg-card/25 border-border/40 focus:border-border/80"
        />
        {errors.name && (
          <p className="text-xs text-red-500 font-mono mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="contact@dhananjay.dev"
          {...register("email")}
          disabled={isSubmitting}
          className="bg-card/25 border-border/40 focus:border-border/80"
        />
        {errors.email && (
          <p className="text-xs text-red-500 font-mono mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Subject Input */}
      <div className="space-y-2">
        <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Subject
        </label>
        <Input
          id="subject"
          type="text"
          placeholder="System Architecture Consult / Internship Opportunities"
          {...register("subject")}
          disabled={isSubmitting}
          className="bg-card/25 border-border/40 focus:border-border/80"
        />
        {errors.subject && (
          <p className="text-xs text-red-500 font-mono mt-1">{errors.subject.message}</p>
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Message Detail
        </label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Tell me about your systems, databases, workload details, or role requirements..."
          {...register("message")}
          disabled={isSubmitting}
          className="bg-card/25 border-border/40 focus:border-border/80 leading-relaxed"
        />
        {errors.message && (
          <p className="text-xs text-red-500 font-mono mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto inline-flex gap-2">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Transmitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </Button>

      {/* Status Alerts */}
      {submitStatus && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border text-sm leading-relaxed ${
            submitStatus.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
              : "bg-red-500/10 border-red-500/30 text-red-200"
          }`}
        >
          {submitStatus.success ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          )}
          <p>{submitStatus.message}</p>
        </div>
      )}

    </form>
  )
}
