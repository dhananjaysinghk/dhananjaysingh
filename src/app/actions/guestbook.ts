"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

const guestbookSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  handle: z.string().max(50).optional(),
  message: z.string().min(3, "Message must be at least 3 characters.").max(500, "Message cannot exceed 500 characters."),
})

type GuestbookInput = z.infer<typeof guestbookSchema>

export async function submitGuestbookEntry(data: GuestbookInput) {
  try {
    const validated = guestbookSchema.parse(data)

    await db.guestbookEntry.create({
      data: {
        name: validated.name.trim(),
        handle: validated.handle?.trim() || null,
        message: validated.message.trim(),
      },
    })

    revalidatePath("/guestbook")
    return { success: true }
  } catch (error) {
    console.error("Guestbook submission error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation error." }
    }
    return { success: false, error: "Database transaction failed. Please try again." }
  }
}
