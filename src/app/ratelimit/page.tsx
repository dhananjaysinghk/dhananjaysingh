import React from "react"
import { Metadata } from "next"
import { ScrollReveal } from "@/components/animation/motion-wrapper"
import { RateLimiterSimulator } from "@/components/ratelimit/RateLimiterSimulator"
import { ShieldAlert, Droplets } from "lucide-react"

export const metadata: Metadata = {
  title: "Distributed Rate Limiter & Token Bucket Simulator | Dhananjay Singh",
  description: "Interactive distributed token bucket rate limiter simulating traffic burst regulation, token replenishment, and HTTP 429 backpressure handling.",
}

export default function RateLimitPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 flex flex-col gap-12 font-sans">
      
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-1.5 backdrop-blur-sm">
          <Droplets className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
            Traffic Control
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Token Bucket Rate Limiter
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Simulate real-time inbound API burst traffic, token replenishment intervals, and HTTP 429 Too Many Requests backpressure mechanisms used across distributed gateways.
        </p>
      </ScrollReveal>

      {/* Main Simulator */}
      <ScrollReveal delay={0.05}>
        <RateLimiterSimulator />
      </ScrollReveal>

    </div>
  )
}
