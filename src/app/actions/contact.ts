"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { Resend } from "resend"

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
})

type ContactInput = z.infer<typeof contactSchema>

export async function submitContactForm(data: ContactInput) {
  try {
    // 1. Validate inputs server-side
    const validated = contactSchema.parse(data)

    // 2. Save record to PostgreSQL database via Prisma
    const messageRecord = await db.contactMessage.create({
      data: {
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
      },
    })

    // 3. Dispatch email using Resend API
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not defined in environment variables; email notification skipped.")
      return {
        success: false,
        error: "Message saved to database, but email failed to send: RESEND_API_KEY is missing in your .env file.",
      }
    }

    const resend = new Resend(resendApiKey)
    const { error: resendError } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "dhananjay6903@gmail.com",
      subject: `DS.dev Contact: ${validated.subject}`,
      html: `
        <h3>New Message from Dhananjay's Portfolio</h3>
        <p><strong>Name:</strong> ${validated.name}</p>
        <p><strong>Email:</strong> ${validated.email}</p>
        <p><strong>Subject:</strong> ${validated.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${validated.message.replace(/\n/g, "<br/>")}</p>
      `,
    })

    if (resendError) {
      console.error("Resend API error dispatching email:", resendError)
      return {
        success: false,
        error: `Message saved to database, but email failed: ${resendError.message}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Form action submission failed:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed. Please verify form inputs." }
    }
    return { success: false, error: "An unexpected database or transmission error occurred." }
  }
}
