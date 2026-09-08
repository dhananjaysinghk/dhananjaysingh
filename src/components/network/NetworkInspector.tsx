"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Globe, Zap, Server, Shield, Radio, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface EdgeNode {
  city: string
  code: string
  region: string
  latency: number
  status: "Optimal" | "Operational"
  tls: string
  httpVersion: string
}

const edgeNodes: EdgeNode[] = [
  { city: "San Jose (US-West)", code: "SJC-1", region: "North America", latency: 18, status: "Optimal", tls: "TLS 1.3", httpVersion: "HTTP/3 (QUIC)" },
  { city: "Frankfurt (EU-Central)", code: "FRA-1", region: "Europe", latency: 34, status: "Optimal", tls: "TLS 1.3", httpVersion: "HTTP/3 (QUIC)" },
  { city: "Singapore (AP-Southeast)", code: "SIN-1", region: "Asia Pacific", latency: 42, status: "Optimal", tls: "TLS 1.3", httpVersion: "HTTP/3 (QUIC)" },
  { city: "Mumbai (AP-South)", code: "BOM-1", region: "South Asia", latency: 12, status: "Optimal", tls: "TLS 1.3", httpVersion: "HTTP/3 (QUIC)" },
  { city: "London (EU-West)", code: "LHR-1", region: "Europe", latency: 29, status: "Optimal", tls: "TLS 1.3", httpVersion: "HTTP/3 (QUIC)" },
  { city: "Tokyo (AP-Northeast)", code: "NRT-1", region: "East Asia", latency: 38, status: "Optimal", tls: "TLS 1.3", httpVersion: "HTTP/3 (QUIC)" },
]

export function NetworkInspector() {
  const [selectedNode, setSelectedNode] = useState<EdgeNode>(edgeNodes[3]) // Default BOM-1
  const [isTracing, setIsTracing] = useState(false)
  const [traceLogs, setTraceLogs] = useState<string[]>([
    "Client SYN -> SYN-ACK -> ACK (0-RTT TLS Resumption)",
    "QUIC Connection ID: 0x8F9A42C1 established",
    "BGP Anycast routing resolved to closest PoP: BOM-1",
  ])

  const runTraceroute = () => {
    soundFx.playClick()
    setIsTracing(true)
    setTraceLogs(["Initiating BGP Anycast DNS lookup...", "Probing edge CDN ingress nodes..."])

    setTimeout(() => {
      soundFx.playChime()
      setIsTracing(false)
      setTraceLogs([
        `Target PoP: ${selectedNode.city} (${selectedNode.code})`,
        `Protocol: ${selectedNode.httpVersion} over ${selectedNode.tls} (0-RTT Handshake)`,
        `RTT Edge Transit Time: ~${selectedNode.latency}ms`,
        "Cache-Control: public, s-maxage=31536000, immutable (HIT)",
        "Zero packet loss across 10 sample ICMP pings",
      ])
    }, 900)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Edge Map Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {edgeNodes.map((node) => {
          const isSelected = selectedNode.code === node.code
          return (
            <motion.div
              key={node.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                soundFx.playClick()
                setSelectedNode(node)
              }}
              className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col gap-3 ${
                isSelected
                  ? "border-primary/60 bg-primary/10 shadow-lg ring-1 ring-primary/30"
                  : "border-border/30 bg-card/25 hover:border-border/60 hover:bg-card/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className={`h-4 w-4 ${isSelected ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                  <span className="font-mono text-xs font-bold text-foreground">
                    {node.code}
                  </span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                  {node.latency} ms
                </Badge>
              </div>

              <div className="flex flex-col">
                <span className="font-heading text-sm font-bold text-foreground">
                  {node.city}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {node.region}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border/15 pt-2 text-[10px] font-mono text-muted-foreground">
                <span>{node.httpVersion.split(" ")[0]}</span>
                <span>{node.tls}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Node Details & Live Trace Engine */}
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Edge PoP Inspector: {selectedNode.city} ({selectedNode.code})
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates real-time BGP routing, TLS 1.3 handshakes, and HTTP/3 QUIC connection negotiation.
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={runTraceroute}
            disabled={isTracing}
            className="text-xs font-mono gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTracing ? "animate-spin" : ""}`} />
            {isTracing ? "Tracing..." : "Run Trace Probe"}
          </Button>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-6 font-mono text-xs">
          {/* Telemetry metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Latency RTT</span>
              <span className="text-xl font-bold text-emerald-400">{selectedNode.latency} ms</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Transport</span>
              <span className="text-xl font-bold text-indigo-400">QUIC (UDP)</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Encryption</span>
              <span className="text-xl font-bold text-purple-400">{selectedNode.tls}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Availability</span>
              <span className="text-xl font-bold text-foreground">99.99% SLA</span>
            </div>
          </div>

          {/* Trace Output Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] text-zinc-500 uppercase">
              <span>BGP Anycast Routing & Telemetry Probe</span>
              <span>Zero-RTT Stream</span>
            </div>
            <div className="space-y-1">
              {traceLogs.map((log, idx) => (
                <p key={idx} className={idx === 0 ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                  {`> ${log}`}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
