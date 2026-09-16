"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu,
  Shield,
  Zap,
  Activity,
  Radio,
  Terminal,
  RefreshCw,
  Play,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sliders,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

type EbpfProgramType = "xdp_firewall" | "syscall_execve" | "tcp_latency"

interface ProgramConfig {
  id: EbpfProgramType
  name: string
  hook: string
  layer: "NIC Driver (L1/L2)" | "Syscall Boundary" | "Kernel Socket (L4)"
  description: string
  code: string
  mapType: string
}

const PROGRAMS: Record<EbpfProgramType, ProgramConfig> = {
  xdp_firewall: {
    id: "xdp_firewall",
    name: "XDP High-Speed DDoS Packet Filter",
    hook: "SEC(\"xdp\")",
    layer: "NIC Driver (L1/L2)",
    description: "Evaluates raw packet headers before sk_buff memory allocation, dropping malicious traffic directly at the network card driver layer with sub-microsecond latency.",
    code: `SEC("xdp")
int xdp_drop_ddos(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;
    struct ethhdr *eth = data;

    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;

    if (eth->h_proto == bpf_htons(ETH_P_IP)) {
        struct iphdr *iph = (void *)(eth + 1);
        if ((void *)(iph + 1) > data_end)
            return XDP_PASS;

        // Check BPF_MAP_TYPE_HASH blocklist
        __u32 src_ip = iph->saddr;
        __u64 *blocked = bpf_map_lookup_elem(&blocked_ips, &src_ip);
        if (blocked) {
            bpf_ringbuf_output(&events, &src_ip, sizeof(src_ip), 0);
            return XDP_DROP; // Drop packet at NIC driver!
        }
    }
    return XDP_PASS;
}`,
    mapType: "BPF_MAP_TYPE_HASH (Blocked IPs) + BPF_MAP_TYPE_RINGBUF",
  },
  syscall_execve: {
    id: "syscall_execve",
    name: "Process Execution & Security Audit",
    hook: "SEC(\"tracepoint/syscalls/sys_enter_execve\")",
    layer: "Syscall Boundary",
    description: "Instruments system call entry points to capture executable pathnames and argv pointers, detecting privilege escalations and unauthorized shell invocations.",
    code: `SEC("tracepoint/syscalls/sys_enter_execve")
int trace_execve(struct trace_event_raw_sys_enter *ctx) {
    struct exec_event event = {};
    event.pid = bpf_get_current_pid_tgid() >> 32;
    event.uid = bpf_get_current_uid_gid();

    const char *filename = (const char *)ctx->args[0];
    bpf_probe_read_user_str(&event.filename, sizeof(event.filename), filename);

    // Stream telemetry to userspace collector
    bpf_ringbuf_output(&exec_events, &event, sizeof(event), 0);
    return 0;
}`,
    mapType: "BPF_MAP_TYPE_RINGBUF (Zero-Copy Circular Buffer)",
  },
  tcp_latency: {
    id: "tcp_latency",
    name: "TCP Handshake & RTT Profiler",
    hook: "SEC(\"kprobe/tcp_v4_connect\")",
    layer: "Kernel Socket (L4)",
    description: "Tracks TCP state transitions and SYN-to-ACK round-trip timings inside the Linux network stack without modifying application binaries.",
    code: `SEC("kprobe/tcp_v4_connect")
int BPF_KPROBE(trace_tcp_connect, struct sock *sk) {
    __u64 pid_tgid = bpf_get_current_pid_tgid();
    __u64 ts = bpf_ktime_get_ns();

    bpf_map_update_elem(&start_times, &sk, &ts, BPF_ANY);
    return 0;
}

SEC("kretprobe/tcp_v4_connect")
int BPF_KRETPROBE(trace_tcp_connect_ret, int ret) {
    // Measure socket handshake delta & emit
    return 0;
}`,
    mapType: "BPF_MAP_TYPE_LRU_HASH (Socket Timestamp Map)",
  },
}

export function EbpfSandbox() {
  const [selectedProgram, setSelectedProgram] = useState<EbpfProgramType>("xdp_firewall")
  const [events, setEvents] = useState<Array<{ id: number; text: string; type: "pass" | "drop" | "audit" | "info"; latency: string }>>([
    { id: 1, text: "XDP Ingress: 192.168.1.45:443 (TCP ACK) -> XDP_PASS", type: "pass", latency: "38 ns" },
    { id: 2, text: "XDP Ingress: 10.0.99.12:80 (SYN Flood) -> XDP_DROP (Rule: Hash Blocklist)", type: "drop", latency: "14 ns" },
  ])
  const [stats, setStats] = useState({
    processed: 1420,
    dropped: 382,
    cyclesSaved: "1.84M",
    ringbufEvents: 89,
  })

  const program = PROGRAMS[selectedProgram]

  const handleSelectProgram = (p: EbpfProgramType) => {
    soundFx.playToggle()
    setSelectedProgram(p)
  }

  // Simulate traffic action
  const simulatePacket = (actionType: "legit" | "attack" | "syscall") => {
    soundFx.playClick()
    const id = Date.now()

    if (actionType === "legit") {
      const newEvent = {
        id,
        text: `TCP Ingress: 198.51.100.8:${Math.floor(1000 + Math.random() * 9000)} -> XDP_PASS (Accepted)`,
        type: "pass" as const,
        latency: `${Math.floor(25 + Math.random() * 20)} ns`,
      }
      setEvents((prev) => [newEvent, ...prev.slice(0, 11)])
      setStats((s) => ({ ...s, processed: s.processed + 1 }))
    } else if (actionType === "attack") {
      soundFx.playToggle()
      const newEvent = {
        id,
        text: `⚠️ Malicious Ingress: 203.0.113.77:53 (UDP Reflection) -> XDP_DROP (NIC Driver Zero-Copy)`,
        type: "drop" as const,
        latency: "12 ns",
      }
      setEvents((prev) => [newEvent, ...prev.slice(0, 11)])
      setStats((s) => ({
        ...s,
        processed: s.processed + 1,
        dropped: s.dropped + 1,
        ringbufEvents: s.ringbufEvents + 1,
      }))
    } else {
      soundFx.playChime()
      const bins = ["/usr/bin/python3 app.py", "/usr/bin/curl -s https://api", "/bin/bash -c deploy.sh", "/usr/bin/git commit"]
      const chosen = bins[Math.floor(Math.random() * bins.length)]
      const newEvent = {
        id,
        text: `⚡ Syscall Execve: PID ${Math.floor(10000 + Math.random() * 50000)} (UID 1000) executed "${chosen}"`,
        type: "audit" as const,
        latency: "1.2 µs",
      }
      setEvents((prev) => [newEvent, ...prev.slice(0, 11)])
      setStats((s) => ({ ...s, ringbufEvents: s.ringbufEvents + 1 }))
    }
  }

  const handleReset = () => {
    soundFx.playChime()
    setEvents([
      { id: 1, text: "Kernel Verifier: Safety verified. 41 instructions approved. JIT compiled.", type: "info", latency: "0 ns" },
    ])
    setStats({ processed: 0, dropped: 0, cyclesSaved: "0", ringbufEvents: 0 })
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-xs">
      <Card className="bg-card/25 border-border/40 backdrop-blur-sm shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                eBPF In-Kernel Packet & Tracing Sandbox
              </CardTitle>
              <span className="text-xs text-muted-foreground font-sans">
                Simulates programmable Linux kernel bytecode execution, XDP driver-level packet filtering, and zero-copy BPF ring buffers.
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="text-xs font-mono gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset State
          </Button>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-8 font-mono">
          {/* Program Hook Switcher Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border/20 pb-4">
            {(Object.keys(PROGRAMS) as EbpfProgramType[]).map((pKey) => {
              const p = PROGRAMS[pKey]
              const isSelected = selectedProgram === pKey
              return (
                <button
                  key={pKey}
                  onClick={() => handleSelectProgram(pKey)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono transition-all border ${
                    isSelected
                      ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10"
                      : "bg-card/30 text-muted-foreground border-border/30 hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <Radio className={`h-3.5 w-3.5 ${isSelected ? "text-cyan-400 animate-pulse" : "text-zinc-500"}`} />
                  <span className="font-semibold">{p.name}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono text-zinc-400">
                    {p.layer}
                  </Badge>
                </button>
              )
            })}
          </div>

          {/* Interactive Simulation Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => simulatePacket("legit")}
              className="font-mono text-xs gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/20"
            >
              <Play className="h-3.5 w-3.5 text-emerald-400" />
              Send Valid Packet (TCP:443)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => simulatePacket("attack")}
              className="font-mono text-xs gap-2 border-red-500/30 text-red-300 hover:bg-red-950/20"
            >
              <Flame className="h-3.5 w-3.5 text-red-400" />
              Simulate DDoS Flood (XDP_DROP)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => simulatePacket("syscall")}
              className="font-mono text-xs gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/20"
            >
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              Trigger Syscall (sys_enter_execve)
            </Button>
          </div>

          {/* Architecture Split: C Bytecode & Kernel Verifier vs RingBuffer Event Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: C Code Preview & Verifier Safety Proof */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <FileCode className="h-4 w-4" />
                  In-Kernel C Bytecode ({program.hook})
                </span>
                <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30 bg-emerald-950/20">
                  Verifier: 100% PASS (JIT)
                </Badge>
              </div>

              <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto shadow-inner leading-relaxed">
                <pre>
                  <code>{program.code}</code>
                </pre>
              </div>

              {/* BPF Map Info */}
              <div className="rounded-xl border border-border/30 bg-card/20 p-3 flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-foreground text-[11px]">Active Kernel Map:</span>
                  <p className="text-[10px] text-muted-foreground">{program.mapType}</p>
                </div>
              </div>
            </div>

            {/* Right Col: Live Kernel Ring Buffer Output */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  Kernel Ring Buffer Telemetry (`bpf_ringbuf`)
                </span>
                <span className="text-[10px] text-zinc-500">Zero-Copy Stream</span>
              </div>

              <div className="rounded-xl border border-border/40 bg-zinc-950 p-4 flex flex-col gap-2 min-h-80 max-h-95 overflow-y-auto shadow-inner">
                <AnimatePresence initial={false}>
                  {events.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 font-mono ${
                        evt.type === "drop"
                          ? "bg-red-950/25 border-red-500/40 text-red-300"
                          : evt.type === "pass"
                          ? "bg-emerald-950/25 border-emerald-500/40 text-emerald-300"
                          : evt.type === "audit"
                          ? "bg-indigo-950/25 border-indigo-500/40 text-indigo-300"
                          : "bg-zinc-900 border-border/40 text-zinc-400"
                      }`}
                    >
                      <span className="truncate">{evt.text}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono shrink-0">
                        {evt.latency}
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-300">
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Packets Evaluated</span>
              <span className="text-xl font-bold text-cyan-400">{stats.processed}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">XDP Dropped (Zero-Copy)</span>
              <span className="text-xl font-bold text-red-400">{stats.dropped}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Kernel Cycles Saved</span>
              <span className="text-xl font-bold text-emerald-400">{stats.cyclesSaved}</span>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/20 p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">RingBuffer Events</span>
              <span className="text-xl font-bold text-indigo-400">{stats.ringbufEvents}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
