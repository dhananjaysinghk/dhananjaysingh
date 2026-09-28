"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Radio,
  Zap,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Layers,
  ArrowRight,
  Send,
  Wifi,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

type TcpState = "CLOSED" | "SYN_SENT" | "ESTABLISHED" | "FIN_WAIT_1" | "TIME_WAIT"
type CongestionAlgo = "Reno (AIMD)" | "Cubic" | "BBR"

interface Packet {
  id: number
  seq: number
  length: number
  ack: number
  flags: string
  status: "in-flight" | "delivered" | "dropped" | "retransmitted"
  progress: number // 0 to 100
}

export function TcpFlowVisualizer() {
  const MSS = 1460 // Maximum Segment Size in bytes
  const [tcpState, setTcpState] = useState<TcpState>("ESTABLISHED")
  const [algo, setAlgo] = useState<CongestionAlgo>("Reno (AIMD)")
  
  // Window parameters
  const [cwnd, setCwnd] = useState<number>(4) // in MSS units
  const [ssthresh, setSsthresh] = useState<number>(16) // in MSS units
  const [rwnd, setRwnd] = useState<number>(32) // Advertised Receive Window
  const [inFlight, setInFlight] = useState<number>(0)
  
  // Sequence and Ack pointers
  const [clientSeq, setClientSeq] = useState<number>(1000)
  const [serverAck, setServerAck] = useState<number>(1000)
  const [rtt, setRtt] = useState<number>(24) // ms
  
  // Packets and Cwnd history for graph
  const [packets, setPackets] = useState<Packet[]>([])
  const [cwndHistory, setCwndHistory] = useState<number[]>([1, 2, 4, 8, 16, 17, 18, 19, 10, 11, 12, 13, 14])
  const [eventLogs, setEventLogs] = useState<string[]>([
    "TCP connection ESTABLISHED (3-Way Handshake completed, Initial cwnd=4 MSS, ssthresh=16 MSS).",
  ])

  const appendLog = (msg: string) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 14)])
  }

  // 1. Send Normal Data Segment
  const handleSendSegment = () => {
    if (tcpState !== "ESTABLISHED") {
      soundFx.playToggle()
      appendLog(`⚠️ Cannot send data in ${tcpState} state. Establish connection first.`)
      return
    }

    soundFx.playClick()
    const nextSeq = clientSeq
    const newSeq = clientSeq + MSS

    const newPacket: Packet = {
      id: Date.now() + Math.random(),
      seq: nextSeq,
      length: MSS,
      ack: serverAck,
      flags: "[P.] (PSH, ACK)",
      status: "in-flight",
      progress: 0,
    }

    setPackets((prev) => [...prev, newPacket])
    setClientSeq(newSeq)
    setInFlight((prev) => prev + 1)

    appendLog(
      `📤 TX: Client sent segment Seq=${nextSeq}:${newSeq} (${MSS}B) -> Flags=[P.] cwnd=${cwnd}MSS inFlight=${inFlight + 1}`
    )

    // Simulate Network Transit
    setTimeout(() => {
      setPackets((prev) =>
        prev.map((p) => (p.id === newPacket.id ? { ...p, status: "delivered", progress: 100 } : p))
      )
      setServerAck(newSeq)
      setInFlight((prev) => Math.max(0, prev - 1))
      soundFx.playChime()

      // Congestion Window Adjustment on successful ACK
      setCwnd((prevCwnd) => {
        let nextCwnd = prevCwnd
        if (prevCwnd < ssthresh) {
          // Slow Start: Exponential (+1 MSS per ACK)
          nextCwnd = Math.min(rwnd, prevCwnd + 1)
          appendLog(`📈 SLOW START: ACK received for Seq=${newSeq} -> cwnd increased exponentially to ${nextCwnd} MSS.`)
        } else {
          // Congestion Avoidance: Linear (+1/cwnd per ACK)
          nextCwnd = Math.min(rwnd, Number((prevCwnd + 1 / prevCwnd).toFixed(2)))
          appendLog(`📊 CONGESTION AVOIDANCE (AIMD): cwnd increased linearly to ${nextCwnd} MSS.`)
        }
        setCwndHistory((h) => [...h.slice(-24), nextCwnd])
        return nextCwnd
      })
    }, 600)
  }

  // 2. Send Burst (Simulates multiple concurrent streams)
  const handleSendBurst = () => {
    soundFx.playClick()
    for (let i = 0; i < 3; i++) {
      setTimeout(() => handleSendSegment(), i * 150)
    }
  }

  // 3. Packet Loss Injection (Triple Duplicate ACK & Fast Retransmit)
  const handleInjectLoss = () => {
    soundFx.playToggle()
    const lostSeq = clientSeq
    const newSsthresh = Math.max(2, Math.floor(cwnd / 2))
    const newCwnd = newSsthresh + 3

    appendLog(`🚨 PACKET LOSS DETECTED: 3x Duplicate ACKs received for Seq=${lostSeq}!`)
    appendLog(`⚡ FAST RETRANSMIT & FAST RECOVERY: ssthresh set to ${newSsthresh} MSS (cwnd/2), cwnd set to ${newCwnd} MSS.`)

    setSsthresh(newSsthresh)
    setCwnd(newCwnd)
    setCwndHistory((h) => [...h.slice(-24), newCwnd])
  }

  // 4. Timeout / RTO (Retransmission Timeout)
  const handleTimeout = () => {
    soundFx.playToggle()
    const newSsthresh = Math.max(2, Math.floor(cwnd / 2))
    appendLog(`⏰ RTO TIMEOUT EXPIRED: Network link dead or severe packet stall.`)
    appendLog(`📉 MULTIPLICATIVE DECREASE: ssthresh set to ${newSsthresh} MSS, cwnd collapsed to 1 MSS (Slow Start restarted).`)

    setSsthresh(newSsthresh)
    setCwnd(1)
    setCwndHistory((h) => [...h.slice(-24), 1])
  }

  // 5. 3-Way Handshake Connection Toggle
  const handleToggleConnection = () => {
    soundFx.playChime()
    if (tcpState === "ESTABLISHED") {
      setTcpState("FIN_WAIT_1")
      appendLog("🔌 TEARDOWN: Client sent FIN packet -> Entering FIN_WAIT_1 (4-Way Handshake initiated).")
      setTimeout(() => {
        setTcpState("TIME_WAIT")
        appendLog("⏳ TIME_WAIT: Waiting 2*MSL (Maximum Segment Lifetime) before closing socket.")
        setTimeout(() => {
          setTcpState("CLOSED")
          appendLog("🛑 CLOSED: Socket resources fully released.")
        }, 800)
      }, 600)
    } else {
      setTcpState("SYN_SENT")
      appendLog("🤝 HANDSHAKE: Client sent SYN (seq=1000) -> Entering SYN_SENT.")
      setTimeout(() => {
        setTcpState("ESTABLISHED")
        setClientSeq(1001)
        setServerAck(1001)
        setCwnd(4)
        setSsthresh(16)
        appendLog("✅ ESTABLISHED: Received SYN-ACK (seq=5000, ack=1001) -> Sent ACK (seq=1001, ack=5001).")
      }, 700)
    }
  }

  // Reset
  const handleReset = () => {
    soundFx.playChime()
    setTcpState("ESTABLISHED")
    setCwnd(4)
    setSsthresh(16)
    setRwnd(32)
    setInFlight(0)
    setClientSeq(1000)
    setServerAck(1000)
    setPackets([])
    setCwndHistory([1, 2, 4, 8, 16, 17, 18, 19, 10, 11, 12, 13, 14])
    setEventLogs(["TCP connection reset to initial baseline state."])
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Wifi className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                TCP/IP Sliding Window & Congestion Control Simulator
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Interactive transport-layer mechanics: Slow Start, AIMD Congestion Avoidance, Fast Retransmit, and Flow Control (rwnd/cwnd).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="text-xs font-mono gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset State
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-8 font-mono">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Packet Transmit Actions */}
            <div className="lg:col-span-7 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-cyan-400" />
                  Traffic Injection & Flow Control
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    tcpState === "ESTABLISHED"
                      ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/20"
                      : "border-amber-500/40 text-amber-300 bg-amber-950/20"
                  }`}
                >
                  STATE: {tcpState}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={handleSendSegment}
                  disabled={tcpState !== "ESTABLISHED"}
                  className="text-xs font-mono gap-1 bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send 1 MSS ({MSS}B)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendBurst}
                  disabled={tcpState !== "ESTABLISHED"}
                  className="text-xs font-mono gap-1 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/20"
                >
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  Send Burst (3 Segments)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleConnection}
                  className="text-xs font-mono gap-1 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/20"
                >
                  <Radio className="h-3.5 w-3.5 text-indigo-400" />
                  {tcpState === "ESTABLISHED" ? "Teardown (FIN)" : "Handshake (SYN)"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleInjectLoss}
                  className="text-[10px] font-mono gap-1 border-amber-500/40 text-amber-300 hover:bg-amber-950/20"
                >
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  Inject Loss (3x DupACK)
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleTimeout}
                  className="text-[10px] font-mono gap-1 border-rose-500/40 text-rose-300 hover:bg-rose-950/20"
                >
                  <TrendingUp className="h-3 w-3 text-rose-400" />
                  Trigger RTO Timeout
                </Button>
              </div>
            </div>

            {/* Algorithm Selector */}
            <div className="lg:col-span-5 rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                Congestion Control Algorithm
              </span>

              <div className="flex flex-wrap gap-1.5">
                {(["Reno (AIMD)", "Cubic", "BBR"] as CongestionAlgo[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      soundFx.playClick()
                      setAlgo(m)
                      appendLog(`Switched congestion control algorithm to ${m}.`)
                    }}
                    className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                      algo === m
                        ? "bg-cyan-500 text-cyan-950 font-bold shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/30"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                {algo === "Reno (AIMD)" && "Additive Increase Multiplicative Decrease: doubles cwnd in Slow Start, +1 MSS/RTT in Avoidance, halves on loss."}
                {algo === "Cubic" && "Cubic polynomial growth curve optimized for high-bandwidth delay product (BDP) long-fat networks."}
                {algo === "BBR" && "Bottleneck Bandwidth & RTT model: paces packet delivery to prevent bufferbloat queuing delays."}
              </p>
            </div>
          </div>

          {/* Sliding Window Visualization Diagram */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-6 flex flex-col gap-6 shadow-inner">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                Sender Byte Stream Buffer & Sliding Window
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-cyan-300 font-bold">cwnd: {cwnd} MSS ({cwnd * MSS}B)</span>
                <span className="text-amber-300 font-bold">ssthresh: {ssthresh} MSS</span>
                <span className="text-emerald-300 font-bold">rwnd: {rwnd} MSS</span>
              </div>
            </div>

            {/* Visual Sliding Window Segments */}
            <div className="space-y-3">
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const isSentAcked = idx < 4
                  const isInFlight = idx >= 4 && idx < 4 + inFlight
                  const isWithinCwnd = idx >= 4 + inFlight && idx < 4 + Math.min(12, Math.floor(cwnd))
                  const isBlocked = idx >= 4 + Math.min(12, Math.floor(cwnd))

                  return (
                    <div
                      key={idx}
                      className={`h-12 rounded border flex flex-col items-center justify-center p-1 text-[9px] transition-all ${
                        isInFlight
                          ? "border-amber-500 bg-amber-950/40 text-amber-300 animate-pulse"
                          : isSentAcked
                          ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400"
                          : isWithinCwnd
                          ? "border-cyan-500/60 bg-cyan-950/30 text-cyan-300"
                          : "border-border/30 bg-card/20 text-zinc-600"
                      }`}
                    >
                      <span className="font-mono font-bold">S{idx + 1}</span>
                      <span className="text-[7px]">
                        {isInFlight ? "FLYING" : isSentAcked ? "ACKED" : isWithinCwnd ? "USABLE" : "BLOCKED"}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Sliding Window Bounds Indicator */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
                <span className="text-emerald-400">◄ Sent & Acknowledged</span>
                <span className="text-cyan-300 font-bold">
                  [ Effective Window Size = min(cwnd={cwnd}, rwnd={rwnd}) = {Math.min(cwnd, rwnd)} MSS ]
                </span>
                <span className="text-zinc-600">Unsent (Outside Window) ►</span>
              </div>
            </div>

            {/* Real-Time CWND Sawtooth Graph */}
            <div className="rounded-lg border border-border/30 bg-zinc-900/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-bold uppercase">Congestion Window (CWND) Evolution Graph</span>
                <span className="text-cyan-300 font-mono">Current: {cwnd} MSS</span>
              </div>

              <div className="h-20 w-full flex items-end gap-1.5 pt-2">
                {cwndHistory.map((val, idx) => {
                  const heightPercent = Math.min(100, (val / 32) * 100)
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t bg-cyan-400/80 group-hover:bg-cyan-300 transition-all"
                      />
                      {idx === cwndHistory.length - 1 && (
                        <span className="absolute -top-4 text-[8px] font-bold text-cyan-300">
                          {val}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Telemetry HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">RTT (Round Trip Time)</span>
              <span className="text-xl font-bold text-cyan-400">{rtt} ms</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Bandwidth-Delay Product</span>
              <span className="text-xl font-bold text-emerald-400">
                {((cwnd * MSS * 8) / (rtt / 1000) / 1000000).toFixed(2)} Mbps
              </span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">In-Flight Segments</span>
              <span className="text-xl font-bold text-amber-400">{inFlight} MSS</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">MSS (Segment Size)</span>
              <span className="text-xl font-bold text-indigo-400">{MSS} Bytes</span>
            </div>
          </div>

          {/* TCP Header Event Stream Log */}
          <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                TCP Packet Header Inspection Log:
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">tcpdump format</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {eventLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 ? "text-cyan-300 font-bold" : "text-zinc-400 opacity-85"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
