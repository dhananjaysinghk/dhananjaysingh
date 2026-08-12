import React from "react"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, ExternalLink, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Professional Certificates | Dhananjay Singh",
  description: "Browse academic and technical certifications, credentials, and verification references acquired by Dhananjay Singh.",
}

interface CertificateData {
  id: string
  title: string
  issuer: string
  issueDate: string
  credentialId?: string | null
  credentialUrl?: string | null
}

const fallbackCertificates: CertificateData[] = [
  {
    id: "cert-1",
    title: "Distributed Systems Architecture Certificate",
    issuer: "Cloud Computing Alliance",
    issueDate: "Dec 2025",
    credentialId: "CCA-DSAC-928",
    credentialUrl: "https://example.com",
  },
  {
    id: "cert-2",
    title: "Advanced Go Programming Certificate",
    issuer: "Go Developers Guild",
    issueDate: "Mar 2024",
    credentialId: "GDG-ADVGO-412",
    credentialUrl: "https://example.com",
  },
]

async function getCertificates(): Promise<CertificateData[]> {
  try {
    const certs = await db.certificate.findMany({
      orderBy: { issueDate: "desc" },
    })

    if (certs.length === 0) return fallbackCertificates

    return certs.map((c) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issueDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      credentialId: c.credentialId,
      credentialUrl: c.credentialUrl,
    }))
  } catch (error) {
    console.error("Database query failed; resolving fallback certificates", error)
    return fallbackCertificates
  }
}

export default async function CertificatesPage() {
  const certificates = await getCertificates()

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 flex flex-col gap-12">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Award className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Credentials
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Licenses & Certifications
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-sans">
          Technical accreditations, systems certification references, and qualifications validating my backend and infrastructure competency.
        </p>
      </ScrollReveal>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {certificates.map((cert) => (
          <ScrollReveal key={cert.id}>
            <Card className="h-full bg-card/25 border-border/40 hover:border-border/80 transition-all hover:bg-card/45 group">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Issued {cert.issueDate}</span>
                  </div>
                  <CardTitle className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {cert.title}
                  </CardTitle>
                </div>
                <div className="rounded-lg bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                  <Award className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col gap-1 text-sm font-sans text-muted-foreground">
                  <span>Authorized Issuer: <strong className="text-foreground/90">{cert.issuer}</strong></span>
                  {cert.credentialId && (
                    <span className="font-mono text-xs mt-1">Credential ID: {cert.credentialId}</span>
                  )}
                </div>
              </CardContent>
              {cert.credentialUrl && (
                <CardFooter className="pt-3 border-t border-border/20">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Verify Credential Authority
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardFooter>
              )}
            </Card>
          </ScrollReveal>
        ))}
      </div>

    </div>
  )
}
