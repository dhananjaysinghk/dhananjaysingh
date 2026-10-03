"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Layers,
  RotateCcw,
  Cpu,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Trash2,
  Split,
  Database,
  Radio,
  FileCode,
  Sparkles,
  ArrowRight,
  Share2,
  Sliders,
  Server,
  Activity,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFx } from "@/lib/sound"

type NodeRole = "LEADER" | "CANDIDATE" | "FOLLOWER" | "CRASHED"
type PartitionGroup = "A" | "B" | "NONE"

interface LogEntry {
  index: number
  term: number
  command: string
  key: string
  val: string
  committed: boolean
}

interface RaftNode {
  id: string
  name: string
  role: NodeRole
  term: number
  votedFor: string | null
  votesReceived: number
  log: LogEntry[]
  commitIndex: number
  lastApplied: number
  partition: PartitionGroup
  stateMachine: Record<string, string>
  heartbeatTicks: number
  snapshotIndex: number
}

interface RpcEvent {
  id: string
  from: string
  to: string
  type: "RequestVote" | "RequestVoteReply" | "AppendEntries" | "AppendEntriesReply" | "InstallSnapshot"
  term: number
  details: string
  status: "OK" | "REJECTED" | "COMMITTED"
  timestamp: string
}

export function RaftConsensusVisualizer() {
  const [activeTab, setActiveTab] = useState<"CLUSTER" | "LOGS" | "STATEMACHINE" | "NETWORK">("CLUSTER")
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [tickSpeed] = useState<number>(1000)
  
  // Custom Command Input
  const [inputKey, setInputKey] = useState<string>("cluster_state")
  const [inputVal, setInputVal] = useState<string>("ACTIVE")
  
  // Partition Simulation state
  const [isPartitioned, setIsPartitioned] = useState<boolean>(false)

  // 5-Node Raft Cluster Initial State
  const [nodes, setNodes] = useState<RaftNode[]>([
    {
      id: "N1",
      name: "Node 1 (Leader)",
      role: "LEADER",
      term: 1,
      votedFor: "N1",
      votesReceived: 3,
      log: [
        { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
        { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
      ],
      commitIndex: 2,
      lastApplied: 2,
      partition: "NONE",
      stateMachine: { cluster: "PROD", region: "us-east-1" },
      heartbeatTicks: 0,
      snapshotIndex: 0,
    },
    {
      id: "N2",
      name: "Node 2 (Follower)",
      role: "FOLLOWER",
      term: 1,
      votedFor: "N1",
      votesReceived: 0,
      log: [
        { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
        { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
      ],
      commitIndex: 2,
      lastApplied: 2,
      partition: "NONE",
      stateMachine: { cluster: "PROD", region: "us-east-1" },
      heartbeatTicks: 3,
      snapshotIndex: 0,
    },
    {
      id: "N3",
      name: "Node 3 (Follower)",
      role: "FOLLOWER",
      term: 1,
      votedFor: "N1",
      votesReceived: 0,
      log: [
        { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
        { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
      ],
      commitIndex: 2,
      lastApplied: 2,
      partition: "NONE",
      stateMachine: { cluster: "PROD", region: "us-east-1" },
      heartbeatTicks: 2,
      snapshotIndex: 0,
    },
    {
      id: "N4",
      name: "Node 4 (Follower)",
      role: "FOLLOWER",
      term: 1,
      votedFor: "N1",
      votesReceived: 0,
      log: [
        { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
        { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
      ],
      commitIndex: 2,
      lastApplied: 2,
      partition: "NONE",
      stateMachine: { cluster: "PROD", region: "us-east-1" },
      heartbeatTicks: 1,
      snapshotIndex: 0,
    },
    {
      id: "N5",
      name: "Node 5 (Follower)",
      role: "FOLLOWER",
      term: 1,
      votedFor: "N1",
      votesReceived: 0,
      log: [
        { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
        { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
      ],
      commitIndex: 2,
      lastApplied: 2,
      partition: "NONE",
      stateMachine: { cluster: "PROD", region: "us-east-1" },
      heartbeatTicks: 4,
      snapshotIndex: 0,
    },
  ])

  const [rpcEvents, setRpcEvents] = useState<RpcEvent[]>([
    {
      id: "rpc-0",
      from: "N1",
      to: "BROADCAST",
      type: "AppendEntries",
      term: 1,
      details: "Heartbeat broadcast [commitIndex: 2, prevLogIndex: 2]",
      status: "OK",
      timestamp: "00:01.120",
    },
  ])

  const [activityLogs, setActivityLogs] = useState<string[]>([
    "Cluster initialized with 5 nodes in Term 1. N1 elected as initial Leader.",
    "Quorum threshold Q = floor(5/2) + 1 = 3 nodes required for commit.",
  ])

  // Get current active leader
  const leaderNode = nodes.find((n) => n.role === "LEADER")

  // Log an RPC Event helper
  const addRpc = (
    from: string,
    to: string,
    type: RpcEvent["type"],
    term: number,
    details: string,
    status: RpcEvent["status"]
  ) => {
    const newRpc: RpcEvent = {
      id: "rpc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      from,
      to,
      type,
      term,
      details,
      status,
      timestamp: new Date().toISOString().substring(14, 23),
    }
    setRpcEvents((prev) => [newRpc, ...prev.slice(0, 19)])
  }

  // Helper log message
  const logMsg = (msg: string) => {
    setActivityLogs((prev) => [msg, ...prev.slice(0, 24)])
  }

  // ================= ACTION 1: PROPOSE CLIENT WRITE =================
  const proposeCommand = () => {
    soundFx.playClick()
    if (!leaderNode) {
      logMsg("❌ Write Rejected: No active Leader in cluster. Client must wait for Leader election.")
      return
    }

    if (inputKey.trim() === "") return

    const newIndex = leaderNode.log.length + 1
    const newEntry: LogEntry = {
      index: newIndex,
      term: leaderNode.term,
      command: `SET ${inputKey} = '${inputVal}'`,
      key: inputKey,
      val: inputVal,
      committed: false,
    }

    // Append to leader first
    let accessibleFollowers = nodes.filter(
      (n) =>
        n.id !== leaderNode.id &&
        n.role !== "CRASHED" &&
        (!isPartitioned || n.partition === leaderNode.partition)
    )

    // Leader + reachable followers count towards quorum
    const reachedCount = 1 + accessibleFollowers.length
    const hasQuorum = reachedCount >= 3 // Majority of 5 is 3

    logMsg(`📝 Client proposed: ${newEntry.command} to Leader ${leaderNode.id} in Term ${leaderNode.term}.`)

    addRpc(
      "CLIENT",
      leaderNode.id,
      "AppendEntries",
      leaderNode.term,
      `Client proposal: ${newEntry.command}`,
      "OK"
    )

    // Replicate to followers
    setNodes((prevNodes) => {
      return prevNodes.map((n) => {
        if (n.role === "CRASHED") return n

        // Check if partitioned away from leader
        if (isPartitioned && n.partition !== leaderNode.partition && n.id !== leaderNode.id) {
          return n
        }

        if (n.id === leaderNode.id) {
          const updatedLog = [...n.log, { ...newEntry, committed: hasQuorum }]
          const updatedStateMachine = hasQuorum
            ? { ...n.stateMachine, [newEntry.key]: newEntry.val }
            : n.stateMachine
          return {
            ...n,
            log: updatedLog,
            commitIndex: hasQuorum ? newIndex : n.commitIndex,
            lastApplied: hasQuorum ? newIndex : n.lastApplied,
            stateMachine: updatedStateMachine,
          }
        } else if (accessibleFollowers.some((af) => af.id === n.id)) {
          const updatedLog = [...n.log, { ...newEntry, committed: hasQuorum }]
          const updatedStateMachine = hasQuorum
            ? { ...n.stateMachine, [newEntry.key]: newEntry.val }
            : n.stateMachine
          return {
            ...n,
            log: updatedLog,
            commitIndex: hasQuorum ? newIndex : n.commitIndex,
            lastApplied: hasQuorum ? newIndex : n.lastApplied,
            stateMachine: updatedStateMachine,
          }
        }
        return n
      })
    })

    if (hasQuorum) {
      addRpc(
        leaderNode.id,
        "FOLLOWERS",
        "AppendEntries",
        leaderNode.term,
        `Replicated entry [Index: ${newIndex}, Term: ${leaderNode.term}]. Quorum reached (3/5). Committed!`,
        "COMMITTED"
      )
      logMsg(`✅ Log Entry ${newIndex} replicated across quorum (${reachedCount}/5 nodes). Committed and applied to State Machine!`)
    } else {
      addRpc(
        leaderNode.id,
        "PARTITION",
        "AppendEntries",
        leaderNode.term,
        `Replicated to ${reachedCount}/5 nodes. Quorum failed (need >= 3). Entry uncommitted!`,
        "REJECTED"
      )
      logMsg(`⚠️ Quorum NOT reached (${reachedCount}/5 nodes). Entry appended as UNCOMMITTED on Leader ${leaderNode.id}.`)
    }
  }

  // ================= ACTION 2: TRIGGER LEADER ELECTION =================
  const triggerElection = (candidateId: string) => {
    soundFx.playClick()
    const candidate = nodes.find((n) => n.id === candidateId)
    if (!candidate || candidate.role === "CRASHED") return

    const newTerm = candidate.term + 1
    logMsg(`⚡ Election Timer Timeout on ${candidateId}! Transitioning to CANDIDATE. Incrementing Term to ${newTerm}.`)

    // Eligible voters: non-crashed and in same partition
    const eligibleVoters = nodes.filter(
      (n) =>
        n.role !== "CRASHED" &&
        (!isPartitioned || n.partition === candidate.partition)
    )

    const votes = eligibleVoters.length
    const wonElection = votes >= 3 // Majority of 5

    addRpc(
      candidateId,
      "BROADCAST",
      "RequestVote",
      newTerm,
      `RequestVote [candidateId: ${candidateId}, lastLogIndex: ${candidate.log.length}, lastLogTerm: ${candidate.log[candidate.log.length - 1]?.term || 0}]`,
      "OK"
    )

    setNodes((prevNodes) => {
      return prevNodes.map((n) => {
        if (n.role === "CRASHED") return n

        // If partitioned and not in same group, ignore
        if (isPartitioned && n.partition !== candidate.partition) {
          return n
        }

        if (n.id === candidateId) {
          return {
            ...n,
            role: wonElection ? "LEADER" : "CANDIDATE",
            term: newTerm,
            votedFor: candidateId,
            votesReceived: votes,
            heartbeatTicks: 0,
          }
        } else {
          // Grant vote to candidate if eligible
          return {
            ...n,
            role: "FOLLOWER",
            term: newTerm,
            votedFor: candidateId,
          }
        }
      })
    })

    if (wonElection) {
      logMsg(`👑 ${candidateId} received ${votes}/5 votes (Quorum achieved!). Transitioned to LEADER for Term ${newTerm}.`)
      addRpc(
        candidateId,
        "BROADCAST",
        "AppendEntries",
        newTerm,
        `Leader Heartbeat broadcast [Term: ${newTerm}]. Authority established.`,
        "COMMITTED"
      )
    } else {
      logMsg(`⚠️ ${candidateId} received ${votes}/5 votes. Split vote or partition prevented quorum. Remains Candidate.`)
    }
  }

  // ================= ACTION 3: TOGGLE CRASH / RECOVER =================
  const toggleNodeCrash = (nodeId: string) => {
    soundFx.playClick()
    setNodes((prevNodes) => {
      return prevNodes.map((n) => {
        if (n.id !== nodeId) return n
        const isCrashing = n.role !== "CRASHED"
        if (isCrashing) {
          logMsg(`💥 Node ${nodeId} CRASHED! Removed from active cluster.`)
          return { ...n, role: "CRASHED" }
        } else {
          logMsg(`♻️ Node ${nodeId} RECOVERED! Rejoined as Follower. Syncing log state...`)
          return { ...n, role: "FOLLOWER" }
        }
      })
    })
  }

  // ================= ACTION 4: NETWORK PARTITION SIMULATOR =================
  const togglePartition = () => {
    soundFx.playClick()
    if (!isPartitioned) {
      // Create Partition: {N1, N2} in Group A (Minority 2), {N3, N4, N5} in Group B (Majority 3)
      setIsPartitioned(true)
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.id === "N1" || n.id === "N2") {
            return { ...n, partition: "A" }
          } else {
            return { ...n, partition: "B" }
          }
        })
      )
      logMsg("🚧 Network Partition Created: Group A [N1, N2] (2 nodes) vs Group B [N3, N4, N5] (3 nodes).")
      logMsg("ℹ️ Group A cannot commit new writes (2 < 3). Group B has majority quorum and can elect a new leader!")
    } else {
      // Heal Partition & Reconcile Logs
      setIsPartitioned(false)
      // Find highest term leader in Group B or elsewhere
      const maxTermNode = [...nodes].sort((a, b) => b.term - a.term || b.log.length - a.log.length)[0]

      setNodes((prevNodes) => {
        return prevNodes.map((n) => {
          return {
            ...n,
            partition: "NONE",
            term: Math.max(n.term, maxTermNode.term),
            role: n.id === maxTermNode.id && maxTermNode.role === "LEADER" ? "LEADER" : "FOLLOWER",
            // Sync log with leader
            log: maxTermNode.log.map((entry) => ({ ...entry, committed: true })),
            commitIndex: maxTermNode.log.length,
            lastApplied: maxTermNode.log.length,
            stateMachine: { ...maxTermNode.stateMachine },
          }
        })
      })
      logMsg(`🩹 Network Partition HEALED! Split-brain resolved. Nodes stepped down to Follower and synced with Leader (${maxTermNode.id}) in Term ${maxTermNode.term}.`)
      addRpc("NETWORK", "ALL", "AppendEntries", maxTermNode.term, "Partition healed: Log reconciliation complete.", "COMMITTED")
    }
  }

  // ================= ACTION 5: LOG COMPACTION (SNAPSHOT) =================
  const createSnapshot = () => {
    soundFx.playClick()
    if (!leaderNode || leaderNode.log.length === 0) return

    const snapshotIdx = leaderNode.commitIndex
    if (snapshotIdx === 0) {
      logMsg("⚠️ Cannot snapshot: No committed entries in log.")
      return
    }

    logMsg(`📦 Creating Snapshot up to CommitIndex ${snapshotIdx}. Discarding log entries 1..${snapshotIdx} to free memory.`)

    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.role === "CRASHED") return n
        const remainingLog = n.log.filter((entry) => entry.index > snapshotIdx)
        return {
          ...n,
          snapshotIndex: snapshotIdx,
          log: remainingLog,
        }
      })
    )

    addRpc(
      leaderNode.id,
      "STORAGE",
      "InstallSnapshot",
      leaderNode.term,
      `State snapshot persisted at Index ${snapshotIdx}. Discarded log prefix.`,
      "OK"
    )
  }

  // Reset Cluster
  const resetCluster = () => {
    soundFx.playClick()
    setIsPartitioned(false)
    setNodes([
      {
        id: "N1",
        name: "Node 1 (Leader)",
        role: "LEADER",
        term: 1,
        votedFor: "N1",
        votesReceived: 3,
        log: [
          { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
          { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
        ],
        commitIndex: 2,
        lastApplied: 2,
        partition: "NONE",
        stateMachine: { cluster: "PROD", region: "us-east-1" },
        heartbeatTicks: 0,
        snapshotIndex: 0,
      },
      {
        id: "N2",
        name: "Node 2 (Follower)",
        role: "FOLLOWER",
        term: 1,
        votedFor: "N1",
        votesReceived: 0,
        log: [
          { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
          { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
        ],
        commitIndex: 2,
        lastApplied: 2,
        partition: "NONE",
        stateMachine: { cluster: "PROD", region: "us-east-1" },
        heartbeatTicks: 3,
        snapshotIndex: 0,
      },
      {
        id: "N3",
        name: "Node 3 (Follower)",
        role: "FOLLOWER",
        term: 1,
        votedFor: "N1",
        votesReceived: 0,
        log: [
          { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
          { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
        ],
        commitIndex: 2,
        lastApplied: 2,
        partition: "NONE",
        stateMachine: { cluster: "PROD", region: "us-east-1" },
        heartbeatTicks: 2,
        snapshotIndex: 0,
      },
      {
        id: "N4",
        name: "Node 4 (Follower)",
        role: "FOLLOWER",
        term: 1,
        votedFor: "N1",
        votesReceived: 0,
        log: [
          { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
          { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
        ],
        commitIndex: 2,
        lastApplied: 2,
        partition: "NONE",
        stateMachine: { cluster: "PROD", region: "us-east-1" },
        heartbeatTicks: 1,
        snapshotIndex: 0,
      },
      {
        id: "N5",
        name: "Node 5 (Follower)",
        role: "FOLLOWER",
        term: 1,
        votedFor: "N1",
        votesReceived: 0,
        log: [
          { index: 1, term: 1, command: "SET cluster = 'PROD'", key: "cluster", val: "PROD", committed: true },
          { index: 2, term: 1, command: "SET region = 'us-east-1'", key: "region", val: "us-east-1", committed: true },
        ],
        commitIndex: 2,
        lastApplied: 2,
        partition: "NONE",
        stateMachine: { cluster: "PROD", region: "us-east-1" },
        heartbeatTicks: 4,
        snapshotIndex: 0,
      },
    ])
    setRpcEvents([])
    setActivityLogs(["Cluster reset to default state."])
  }

  // Auto Tick simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setNodes((prev) =>
          prev.map((n) => {
            if (n.role === "CRASHED") return n
            return {
              ...n,
              heartbeatTicks: (n.heartbeatTicks + 1) % 5,
            }
          })
        )
      }, tickSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, tickSpeed])

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-background p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Raft Consensus & Log Replication Engine
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed">
              Interactive distributed consensus simulator modeled after <span className="text-cyan-400 font-mono">etcd</span>, <span className="text-indigo-400 font-mono">Kubernetes</span>, and <span className="text-purple-400 font-mono">Kafka KRaft</span>. Simulates leader election timers, quorum state transitions, log replication, network partitions, and snapshot compaction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-mono text-xs">
              Quorum Q = 3 / 5
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-mono text-xs">
              Term: {leaderNode?.term || 1}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetCluster}
              className="gap-2 border-border/60 hover:bg-accent/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Cluster
            </Button>
          </div>
        </div>
      </div>

      {/* Control Bar & Actions */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Propose Command Box */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-mono text-muted-foreground uppercase">SET</span>
                <Input
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="key"
                  className="font-mono text-xs h-9 bg-background/50 border-border/60"
                />
                <span className="text-xs font-mono text-muted-foreground">=</span>
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="value"
                  className="font-mono text-xs h-9 bg-background/50 border-border/60"
                />
              </div>
              <Button
                onClick={proposeCommand}
                className="gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs h-9 shadow-lg shadow-cyan-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Propose Write
              </Button>
            </div>

            {/* Quick Action Buttons */}
            <div className="lg:col-span-6 flex flex-wrap items-center justify-start lg:justify-end gap-2">
              <Button
                variant={isPartitioned ? "destructive" : "outline"}
                size="sm"
                onClick={togglePartition}
                className={`gap-1.5 text-xs font-mono ${
                  isPartitioned
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                    : "border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                }`}
              >
                <Split className="h-3.5 w-3.5" />
                {isPartitioned ? "Heal Partition (Reconcile)" : "Simulate 2:3 Partition"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={createSnapshot}
                className="gap-1.5 text-xs font-mono border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
              >
                <Database className="h-3.5 w-3.5" />
                Snapshot Compaction
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-1.5 text-xs font-mono border-border/60"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? "Pause Ticks" : "Auto Heartbeats"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab("CLUSTER")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "CLUSTER"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Server className="h-4 w-4" />
          Cluster Node Mesh
        </button>
        <button
          onClick={() => setActiveTab("LOGS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "LOGS"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Layers className="h-4 w-4" />
          Replicated Log Matrix
        </button>
        <button
          onClick={() => setActiveTab("STATEMACHINE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "STATEMACHINE"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Database className="h-4 w-4" />
          State Machine (KV Store)
        </button>
        <button
          onClick={() => setActiveTab("NETWORK")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "NETWORK"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Radio className="h-4 w-4" />
          Live RPC Inspector
        </button>
      </div>

      {/* VIEW 1: CLUSTER MESH */}
      {activeTab === "CLUSTER" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => {
            const isLeader = node.role === "LEADER"
            const isCandidate = node.role === "CANDIDATE"
            const isCrashed = node.role === "CRASHED"
            const inPartitionA = node.partition === "A"

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-xl border p-5 transition-all shadow-lg ${
                  isCrashed
                    ? "border-rose-500/30 bg-rose-950/10 opacity-70"
                    : isLeader
                    ? "border-cyan-500/50 bg-gradient-to-b from-cyan-950/20 to-card/60 shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                    : isCandidate
                    ? "border-amber-500/50 bg-amber-950/15 shadow-amber-500/10"
                    : "border-border/60 bg-card/40"
                }`}
              >
                {/* Node Partition Tag */}
                {isPartitioned && (
                  <div
                    className={`absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded border ${
                      inPartitionA
                        ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                        : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                    }`}
                  >
                    Partition {node.partition}
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border font-mono font-bold text-sm ${
                        isCrashed
                          ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                          : isLeader
                          ? "border-cyan-500/50 text-cyan-300 bg-cyan-500/20 shadow-inner"
                          : isCandidate
                          ? "border-amber-500/50 text-amber-300 bg-amber-500/20"
                          : "border-border/60 text-muted-foreground bg-muted/30"
                      }`}
                    >
                      {node.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{node.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono uppercase px-1.5 py-0 ${
                            isCrashed
                              ? "border-rose-500/30 text-rose-400"
                              : isLeader
                              ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                              : isCandidate
                              ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                              : "border-slate-500/40 text-slate-300"
                          }`}
                        >
                          {node.role}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Term {node.term}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Metrics */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-background/50 border border-border/40 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">COMMIT INDEX</span>
                    <span className="text-foreground font-semibold">
                      {node.commitIndex}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">LOG ENTRIES</span>
                    <span className="text-foreground font-semibold">
                      {node.log.length} {node.snapshotIndex > 0 ? `(+${node.snapshotIndex} snap)` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">VOTED FOR</span>
                    <span className="text-cyan-400">{node.votedFor || "null"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">APPLIED INDEX</span>
                    <span className="text-emerald-400">{node.lastApplied}</span>
                  </div>
                </div>

                {/* Heartbeat Ticker Bar */}
                {!isCrashed && (
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                      <span>{isLeader ? "Heartbeat Broadcast" : "Election Timeout Timer"}</span>
                      <span>{isLeader ? "Active" : `${node.heartbeatTicks * 25}%`}</span>
                    </div>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/40">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isLeader
                            ? "bg-cyan-400 w-full animate-pulse"
                            : "bg-amber-400"
                        }`}
                        style={{ width: isLeader ? "100%" : `${(node.heartbeatTicks + 1) * 20}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons for Node */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isCrashed || isLeader}
                    onClick={() => triggerElection(node.id)}
                    className="flex-1 text-[11px] h-7 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-mono"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    Force Elect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleNodeCrash(node.id)}
                    className={`text-[11px] h-7 font-mono ${
                      isCrashed
                        ? "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                        : "border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                    }`}
                  >
                    {isCrashed ? <RefreshCw className="h-3 w-3 mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                    {isCrashed ? "Recover" : "Crash"}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* VIEW 2: REPLICATED LOG MATRIX */}
      {activeTab === "LOGS" && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                Cluster Replicated Log Array
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Matches by (Index, Term)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="p-3 rounded-lg border border-border/40 bg-background/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{node.id}</span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {node.role}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    CommitIndex: <span className="text-cyan-400">{node.commitIndex}</span> | Applied:{" "}
                    <span className="text-emerald-400">{node.lastApplied}</span>
                  </div>
                </div>

                {/* Log entries horizontal strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {node.snapshotIndex > 0 && (
                    <div className="px-2.5 py-1.5 rounded bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-300 flex-shrink-0">
                      📦 Snapshot (1..{node.snapshotIndex})
                    </div>
                  )}

                  {node.log.length === 0 && node.snapshotIndex === 0 && (
                    <div className="text-xs text-muted-foreground font-mono italic">
                      Empty Log
                    </div>
                  )}

                  {node.log.map((entry) => (
                    <div
                      key={entry.index}
                      className={`px-3 py-1.5 rounded border text-xs font-mono flex-shrink-0 transition-all ${
                        entry.committed
                          ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-200"
                          : "bg-amber-950/20 border-amber-500/30 text-amber-200 border-dashed"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground border-b border-border/40 pb-0.5 mb-1">
                        <span>Idx {entry.index}</span>
                        <span>Term {entry.term}</span>
                      </div>
                      <div className="font-semibold text-[11px]">{entry.command}</div>
                      <div className="text-[9px] mt-0.5 text-right">
                        {entry.committed ? (
                          <span className="text-cyan-400 font-bold">✓ Committed</span>
                        ) : (
                          <span className="text-amber-400">⏳ Uncommitted</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* VIEW 3: STATE MACHINE KV STORE */}
      {activeTab === "STATEMACHINE" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {nodes.map((node) => (
            <Card key={node.id} className="border-border/50 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-sm">{node.name} State Machine</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    Last Applied: {node.lastApplied}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/40 bg-background/50 p-3 font-mono text-xs space-y-1.5">
                  {Object.entries(node.stateMachine).length === 0 ? (
                    <div className="text-muted-foreground italic">No state applied yet.</div>
                  ) : (
                    Object.entries(node.stateMachine).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between py-1 border-b border-border/20 last:border-0"
                      >
                        <span className="text-indigo-300 font-medium">"{k}"</span>
                        <span className="text-emerald-400 font-bold">"{v}"</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* VIEW 4: LIVE RPC INSPECTOR */}
      {activeTab === "NETWORK" && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400" />
                Network RPC Packet Trace
              </span>
              <Badge variant="outline" className="text-xs font-mono">
                {rpcEvents.length} Captured Packets
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {rpcEvents.length === 0 ? (
                <div className="text-xs text-muted-foreground font-mono text-center py-8">
                  No RPC traffic captured yet. Perform actions above to trigger Raft protocol RPCs.
                </div>
              ) : (
                rpcEvents.map((rpc) => (
                  <div
                    key={rpc.id}
                    className="p-2.5 rounded-lg border border-border/40 bg-background/40 flex items-start justify-between text-xs font-mono gap-4"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-muted-foreground text-[10px]">{rpc.timestamp}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          rpc.type === "RequestVote"
                            ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                            : rpc.type === "AppendEntries"
                            ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                            : "border-purple-500/40 text-purple-300 bg-purple-500/10"
                        }`}
                      >
                        {rpc.type}
                      </Badge>
                      <span className="text-foreground font-semibold">
                        {rpc.from} → {rpc.to}
                      </span>
                    </div>

                    <div className="flex-1 text-muted-foreground truncate">{rpc.details}</div>

                    <div className="flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          rpc.status === "COMMITTED"
                            ? "border-cyan-500/30 text-cyan-400"
                            : rpc.status === "OK"
                            ? "border-emerald-500/30 text-emerald-400"
                            : "border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {rpc.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log Terminal */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              Consensus Event Audit Log
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Live Stream
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/40 bg-background/80 p-3 font-mono text-xs text-muted-foreground space-y-1 max-h-48 overflow-y-auto">
            {activityLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold select-none">&gt;</span>
                <span className="text-foreground/90">{log}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deep Dive Theory & Invariants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              Election Safety Invariant
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              At most one leader can be elected in a given term. A candidate must collect votes from a strict majority of nodes ($Q = \lfloor N/2 \rfloor + 1$).
            </p>
            <p className="font-mono text-[11px] text-cyan-400">
              Each node votes at most once per term on a first-come, first-served basis.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              Log Matching Property
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              If two logs contain an entry with the same index and term, they store the same command and their logs are identical in all preceding entries.
            </p>
            <p className="font-mono text-[11px] text-indigo-400">
              Enforced via (prevLogIndex, prevLogTerm) in AppendEntries RPC.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" />
              State Machine Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              If a server has applied a log entry at a given index to its state machine, no other server will ever apply a different log entry for the same index.
            </p>
            <p className="font-mono text-[11px] text-purple-400">
              Guarantees linearizability and deterministic state replication.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
