import { MetadataRoute } from "next"
import { db } from "@/lib/db"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://dhananjaysinghk.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/about", "/projects", "/blog", "/notes", "/guestbook", "/tools", "/adr", "/contact", "/resume", "/certificates", "/status", "/privacy", "/terms"]
  
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }))

  try {
    // 1. Fetch dynamic projects
    const projects = await db.project.findMany({ select: { slug: true, updatedAt: true } })
    const projectEntries = projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    // 2. Fetch dynamic blogs
    const blogs = await db.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })
    const blogEntries = blogs.map((b) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    // 3. Fetch dynamic notes
    const notes = await db.note.findMany({
      where: { published: true },
      select: { slug: true, category: true, updatedAt: true },
    })
    const noteEntries = notes.map((n) => ({
      url: `${BASE_URL}/notes/${n.category.toLowerCase().replace(/\s+/g, "-")}/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

    return [...staticEntries, ...projectEntries, ...blogEntries, ...noteEntries]
  } catch (error) {
    console.warn("Prisma dynamic sitemap generation failed; returning static route mapping only.", error)
    
    // Minimal mock entries during build offline states
    const mockSlugs = [
      "/projects/nova-orchestrator",
      "/projects/aura-ledger",
      "/projects/vortex-cdn",
      "/blog/architecting-microsecond-latency-rust",
      "/blog/designing-custom-raft-go",
      "/blog/why-switched-oklch-css",
    ]
    const mockEntries = mockSlugs.map((slug) => ({
      url: `${BASE_URL}${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    return [...staticEntries, ...mockEntries]
  }
}
