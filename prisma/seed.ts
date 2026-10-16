import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting database seeding...")

  // 1. Clean existing records (optional)
  await prisma.experience.deleteMany()
  await prisma.project.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.note.deleteMany()
  await prisma.certificate.deleteMany()

  // 2. Seed Experience History
  console.log("Seeding Experience history...")
  await prisma.experience.createMany({
    data: [
      {
        role: "Software Engineer Intern",
        company: "InnovateTech Cloud",
        location: "Remote",
        startDate: new Date("2025-05-01"),
        endDate: null, // Current role
        description: [
          "Worked on implementing real-time event-streaming messaging brokers using Go and Raft consensus.",
          "Optimized cold start times of container schedulers by 35% through profiling and code refactoring.",
          "Collaborated with core infrastructure engineers to configure service mesh networks."
        ],
        technologies: ["Go", "Raft", "gRPC", "Docker", "Linux"],
        achievements: ["Reduced scheduler latency by 35%"]
      },
      {
        role: "Backend Developer Intern",
        company: "Nexus Finance",
        location: "Bengaluru, India",
        startDate: new Date("2024-05-01"),
        endDate: new Date("2024-07-31"),
        description: [
          "Developed high-throughput transaction ledger interfaces using Rust and PostgreSQL.",
          "Assisted in configuring active-active database replicas to improve failover latency."
        ],
        technologies: ["Rust", "PostgreSQL", "Tokio", "Git"],
        achievements: ["Configured database failover modules"]
      }
    ]
  })

  // 3. Seed Projects Showcase
  console.log("Seeding Projects Showcase...")
  await prisma.project.create({
    data: {
      title: "Nova Orchestrator",
      slug: "nova-orchestrator",
      description: "A high-performance cloud container scheduler and mesh network orchestrator written in Go, featuring a sub-10ms scheduling latency and custom raft consensus model.",
      problem: "Traditional schedulers had latency overheads and did not support distributed low-latency consensus, causing significant scheduling delays (up to 800ms) when orchestrating thousands of active nodes on lossy mesh networks.",
      solution: "Implemented a custom lightweight scheduler in Go, using bidirectional gRPC stream channels for real-time node polling and a custom Raft consensus state machine for partition-tolerant database synchronization.",
      architecture: "A central orchestrator cluster running a three-node Raft consensus group communicating via protobuf messages over HTTP/2, with workers running lightweight local agents that execute scheduling tasks and report state telemetry.",
      techStack: ["Go", "Raft", "gRPC", "Protobuf", "Docker", "Prometheus", "Linux"],
      features: ["Sub-10ms scheduling latency", "Automatic node partition recovery", "Cryptographic task integrity validation", "gRPC streaming server telemetry"],
      challenges: "Tuning Raft heartbeat intervals on lossy mesh networks without inducing cluster-wide election loops during packet loss spikes.",
      lessons: "Decoupling the transaction write-ahead-log (WAL) routing pipelines from primary network routing threads is vital to preventing scheduling head-of-line blocking.",
      github: "https://github.com/dhananjaysinghk",
      roadmap: [
        "Support multi-region cluster federation",
        "Build custom WebAssembly sandbox container runtime",
        "Add automatic GPU-acceleration node scheduling pipelines"
      ],
      category: "Backend & Systems",
      featured: true,
      images: []
    }
  })

  await prisma.project.create({
    data: {
      title: "Aura Ledger",
      slug: "aura-ledger",
      description: "Distributed transactional ledger and financial clearance backend designed for microsecond settlement with complete ACID compliance and cryptographic audit logs.",
      problem: "High-frequency financial clears required microsecond persistence and cryptographically verifiable audits. Standard relational database transactional structures caused resource locks under concurrent account loads.",
      solution: "Developed a distributed in-memory state clearing engine in Rust, utilizing a write-ahead log (WAL) and memory-mapped files (mmap) for ultra-fast persistent transaction logging.",
      architecture: "Rust Tokio async engine acting as an execution pipeline, Redis for session cache, and PostgreSQL for archival storage and secondary auditing index queries.",
      techStack: ["Rust", "PostgreSQL", "Tokio", "Redis", "Docker", "Grafana"],
      features: ["ACID-compliant in-memory ledger state", "Microsecond transaction logging via mmap", "Cryptographically signed audit logs", "Prometheus performance metrics"],
      challenges: "Handling thread contention on atomic balance updates without causing deadlocks on high-frequency account clearings.",
      lessons: "Lock-free ring buffers (disruptor pattern) offer orders of magnitude higher throughput than standard Mutex locking primitives in high-concurrency Rust environments.",
      github: "https://github.com/dhananjaysinghk",
      roadmap: [
        "Implement zero-knowledge privacy audit proofs",
        "Create automatic currency-hedging routing nodes",
        "Introduce gRPC financial reporting streams"
      ],
      category: "Distributed Systems",
      featured: true,
      images: []
    }
  })

  await prisma.project.create({
    data: {
      title: "Vortex CDN",
      slug: "vortex-cdn",
      description: "Edge server caching platform built on WebAssembly and Rust, reducing cold-start latency for serverless edge workers by 70%.",
      problem: "Serverless edge functions had heavy cold start overheads, degrading user response latency by up to 800ms during scale-out events.",
      solution: "Created an edge server caching system running lightweight WebAssembly sandboxes, utilizing shared V8 isolate memory rings for immediate worker boot-ups.",
      architecture: "Rust proxy server acting as the gateway traffic load balancer, compiling edge handlers to Wasm modules executed via Wasmtime engine instances.",
      techStack: ["Rust", "Wasm", "TypeScript", "Next.js", "Vercel", "Wasmtime"],
      features: ["Sub-10 microsecond worker boot-ups", "V8 isolate memory pooling", "Global Geo-DNS route optimization", "Dynamic cache eviction algorithms"],
      challenges: "Designing strict memory boundaries to prevent shared memory corruption across untrusted worker isolates.",
      lessons: "WebAssembly modules loaded in pre-initialized memory states cut activation latencies down to sub-10 microseconds.",
      github: "https://github.com/dhananjaysinghk",
      demo: "https://github.com/dhananjaysinghk",
      roadmap: [
        "Integrate edge-native vector index caching",
        "Add global Geo-DNS route optimization routing",
        "Support automated HTTP/3 QUIC connection pooling"
      ],
      category: "Cloud Infrastructure",
      featured: true,
      images: []
    }
  })

  await prisma.project.create({
    data: {
      title: "Apex Rate Limiter",
      slug: "apex-ratelimiter",
      description: "Distributed Token Bucket & Leaky Bucket traffic shaper with sub-millisecond synchronized Redis state, enforcing multi-tier backpressure on inbound API gateway bursts.",
      problem: "Sudden traffic spikes overloaded downstream databases and caused cascading gateway timeouts across microservices.",
      solution: "Engineered a low-latency distributed rate limiter in Go, utilizing Lua scripts executed atomically inside Redis clusters and sliding window counters.",
      architecture: "Reverse proxy ingress gateway intercepting HTTP requests, computing token replenishment, and emitting HTTP 429 Too Many Requests responses when burst thresholds are breached.",
      techStack: ["Go", "Redis", "Lua", "Docker", "Prometheus"],
      features: ["Token Bucket algorithm", "Atomic Redis Lua script execution", "Sub-millisecond latency check", "Per-client sliding window tracking"],
      challenges: "Preventing race conditions and split-brain token allowances across distributed Redis read replicas.",
      lessons: "Atomic server-side Lua scripts eliminate round-trip overhead and guarantee thread-safe token decrements.",
      github: "https://github.com/dhananjaysinghk",
      demo: "/ratelimit",
      roadmap: ["Add distributed Leaky Bucket shaping", "Implement dynamic quota adjustments based on CPU load"],
      category: "Backend & Systems",
      featured: true,
      images: []
    }
  })

  await prisma.project.create({
    data: {
      title: "Hyperion eBPF Filter",
      slug: "hyperion-ebpf",
      description: "Programmable kernel packet filter and volumetric DDoS mitigation pipeline executing verified XDP bytecode directly inside the Linux network driver.",
      problem: "Traditional iptables and userspace firewall proxies incurred excessive CPU context-switching overhead, degrading throughput at 10Gbps+ packet ingestion rates.",
      solution: "Built an eBPF program hooked into the eXpress Data Path (XDP) driver layer, inspecting Ethernet and IP headers before sk_buff socket allocation.",
      architecture: "C/eBPF kernel bytecode attached to NIC network drivers communicating via BPF_MAP_TYPE_HASH maps with a Rust userspace daemon.",
      techStack: ["C", "eBPF", "XDP", "Linux Kernel", "Rust"],
      features: ["Zero-copy NIC driver packet inspection", "Sub-microsecond XDP_DROP mitigation", "Lockless ring buffer event streaming"],
      challenges: "Passing the Linux kernel in-kernel eBPF verifier while performing complex header boundary and packet length calculations.",
      lessons: "Validating pointer arithmetic bounds against data_end is mandatory before dereferencing raw packet buffers in XDP programs.",
      github: "https://github.com/dhananjaysinghk",
      demo: "/ebpf",
      roadmap: ["Implement stateful SYN-cookie challenge generation", "Integrate automated BGP blackholing"],
      category: "Backend & Systems",
      featured: true,
      images: []
    }
  })

  await prisma.project.create({
    data: {
      title: "Chronos Tracing Mesh",
      slug: "chronos-tracing",
      description: "High-throughput distributed tracing collector and critical-path latency visualizer implementing W3C TraceContext standards and OpenTelemetry instrumentation.",
      problem: "Debugging microsecond latency anomalies across microservices was difficult due to fragmented application logs lacking correlated parent-child request contexts.",
      solution: "Constructed an OpenTelemetry-compatible tracing collector that ingests span telemetry into ClickHouse and renders live Gantt waterfall graphs.",
      architecture: "gRPC OpenTelemetry collector pipeline streaming spans into ClickHouse columnar storage with a Next.js visualization front-end.",
      techStack: ["TypeScript", "OpenTelemetry", "ClickHouse", "Next.js", "gRPC"],
      features: ["W3C TraceContext header propagation", "Critical path bottleneck analysis", "Interactive Gantt span timeline waterfall"],
      challenges: "Aggregating millions of concurrent span events without backpressuring the tracing collector ingest pipelines.",
      lessons: "Batching spans into memory buffers before performing columnar database flushes increases ingestion throughput by 10x.",
      github: "https://github.com/dhananjaysinghk",
      demo: "/tracing",
      roadmap: ["Add automated anomaly detection on span durations", "Support distributed profiling integration"],
      category: "Cloud Infrastructure",
      featured: true,
      images: []
    }
  })

  // 4. Seed Blog Posts
  console.log("Seeding Blog Posts...")
  await prisma.blogPost.create({
    data: {
      title: "Architecting Microsecond-Latency Systems in Rust",
      slug: "architecting-microsecond-latency-rust",
      excerpt: "Exploring memory models, thread pinning, non-blocking I/O queues, and custom lock-free structures for building ultra-high-throughput financial trading networks.",
      category: "Systems Engineering",
      readingTime: "8 min read",
      tags: ["rust", "latency", "concurrency"],
      featured: true,
      published: true,
      coverImage: "",
      content: `# Architecting Microsecond-Latency Systems in Rust\n\nIn systems engineering, optimizing transaction clearance speed from milliseconds to microseconds demands a fundamental shift in programming habits. This article explores memory models, thread pinning, non-blocking queues, and lock-free concurrency patterns in Rust.\n\n## Core Latency Bottlenecks\n\nTraditional backend designs operate under the assumption that network delays dominate latency tables. While this is true for consumer web interfaces, financial cleared networks or distributed database nodes face critical CPU and cache scheduling delays:\n\n1. **Garbage Collection (GC)**: Languages like Go or Java introduce unpredictable Stop-The-World (STW) sweeps.\n2. **Context Switching**: Scheduling threads via the OS kernel induces overheads (1-3 microseconds per switch).\n3. **Cache Misses**: Accessing system RAM is orders of magnitude slower than reading local L1/L2 CPU caches.\n\n:::info\nBy using Rust, we eliminate GC pauses completely due to compile-time memory ownership and lifetime validation patterns.\n:::\n\n## CPU Thread Pinning\n\nTo prevent the OS scheduler from shifting our execution threads across different physical CPU cores (which destroys CPU cache registers), we can pin threads to specific cores.\n\nIn Rust, this can be achieved using the \`core_affinity\` crate:\n\n\`\`\`rust\nuse std::thread;\n\nfn main() {\n    let core_ids = core_affinity::get_core_ids().unwrap();\n    \n    // Pin this thread to the first available CPU core\n    thread::spawn(move || {\n        if let Some(core_id) = core_ids.first() {\n            core_affinity::set_for_current(*core_id);\n            println!("Thread pinned to core {:?}", core_id);\n        }\n        // Perform latency-critical loop here\n    });\n}\n\`\`\`\n\n## Memory Pre-allocation & Ring Buffers\n\nTo prevent page-fault interrupts during critical operations, avoid calling \`malloc\` or dynamically expanding vectors at runtime. Instead, instantiate memory-mapped buffers or ring queues at bootstrap.\n\nHere is a typical layout structure using cache-line alignment in Rust to prevent **false sharing**:\n\n\`\`\`rust\n#[repr(align(64))]\nstruct CacheAlignedValue {\n    sequence: u64,\n}\n\`\`\`\n\n## Lock-Free Single-Producer Single-Consumer (SPSC) Queues\n\nUsing Mutex locks introduces threads to kernel lock wait-queues. Instead, utilize atomic ring buffers to pass events between core threads.\n\n:::warning\nWhen building lock-free structures, always use appropriate memory orderings. Relaxed memory bounds can lead to read-write reorderings on CPU registers.\n:::\n\n\`\`\`rust\nuse std::sync::atomic::{AtomicUsize, Ordering};\n\npub struct SpscQueue<T> {\n    buffer: Vec<Option<T>>,\n    write_cursor: AtomicUsize,\n    read_cursor: AtomicUsize,\n}\n\`\`\`\n\nBy bypassing OS thread schedulers, optimizing CPU cache layouts, and opting for atomic instructions over mutex guards, we can reliably drop application latencies down into sub-microsecond levels.`
    }
  })

  await prisma.blogPost.create({
    data: {
      title: "Designing a Custom Raft Consensus Protocol in Go",
      slug: "designing-custom-raft-go",
      excerpt: "A deep dive into distributed systems engineering: heartbeats, election timeouts, log compaction, and partition recovery strategies implemented from scratch.",
      category: "Distributed Systems",
      readingTime: "12 min read",
      tags: ["go", "distributed-systems", "raft"],
      featured: true,
      published: true,
      coverImage: "",
      content: `# Custom Raft Consensus in Go\n\nDistributed consensus is the bedrock of partition-tolerant databases and cloud container schedules. This writeup unpacks the implementation of the Raft consensus model in Go from scratch.\n\n## Raft Core States\n\nRaft divides node roles into three states:\n- **Follower**: Passive state; responds to heartbeats and election queries.\n- **Candidate**: Active election state; gathers votes to establish a new term.\n- **Leader**: Central coordinator state; handles client writes and replicates log entries.\n\n:::info\nNode terms act as a logical clock in distributed systems, allowing nodes to detect and ignore outdated leaders.\n:::\n\n## The Election Loop\n\nRaft uses randomized election timeouts (e.g. 150ms to 300ms) to prevent split-vote scenarios where multiple followers attempt to run elections simultaneously.\n\nHere is a simplified Go implementation of the Candidate election trigger:\n\n\`\`\`go\npackage consensus\n\nimport (\n\t"math/rand"\n\t"time"\n)\n\ntype RaftNode struct {\n\tstate       string\n\tcurrentTerm int\n\tvotedFor    string\n\tpeers       []string\n}\n\nfunc (r *RaftNode) startElection() {\n\tr.state = "Candidate"\n\tr.currentTerm++\n\tr.votedFor = "Self"\n\t\n	votesReceived := 1\n	for _, peer := range r.peers {\n		go func(p string) {\n			if r.requestVoteFromPeer(p) {\n				votesReceived++\n			}\n		}(peer)\n	}\n}\n\`\`\`\n\n## Log Replication & Safety\n\nLeaders must append entries to their local log and broadcast AppendEntries messages to all follower nodes. An entry is considered **committed** once it is successfully written to a majority of node logs.\n\n:::warning\nRaft guarantees that a committed log entry is present in all future leader terms, ensuring database durability.\n:::\n\nImplementing Raft highlights the necessity of thorough state tracking and network boundary controls when writing distributed code.`
    }
  })

  await prisma.blogPost.create({
    data: {
      title: "Why We Switched from Tailwind to OKLCH CSS Variables",
      slug: "why-switched-oklch-css",
      excerpt: "How modern color spaces and inline CSS themes dramatically simplify design consistency, accessibility compliance, and dynamic dark mode scaling.",
      category: "Frontend Architecture",
      readingTime: "6 min read",
      tags: ["css", "oklch", "design-system"],
      featured: false,
      published: true,
      coverImage: "",
      content: `# Switched to OKLCH CSS Variables\n\nDesign systems have traditionally relied on RGB or HSL color representations. While serviceable, these color models do not reflect perceptual brightness. This writeup explains why we restructured our styling around OKLCH variables.\n\n## Perceptual Uniformity\n\nThe primary problem with HSL: **yellow and blue at the same lightness level (e.g. 50%) look completely different to the human eye**. Yellow looks bright; blue looks extremely dark.\n\nOKLCH solves this by modeling:\n- **Lightness (L)**: Perceptual brightness (0 to 1).\n- **Chroma (C)**: Purity or saturation of the color.\n- **Hue (H)**: Color angle (0 to 360 degrees).\n\n:::success\nOKLCH colors look uniform across varying hues, ensuring predictable text contrast ratios.\n:::\n\n## Tailwind CSS v4 & OKLCH\n\nWith Tailwind CSS v4, custom theme parameters map straight into native CSS variables. We define variables once in our root styles:\n\n\`\`\`css\n:root {\n  --background: oklch(0.99 0.002 240);\n  --foreground: oklch(0.145 0 0);\n  --primary: oklch(0.205 0 0);\n}\n\n.dark {\n  --background: oklch(0.09 0.002 286);\n  --foreground: oklch(0.985 0 0);\n}\n\`\`\`\n\nThis setup enables us to perform dynamic theme mapping and contrast calculations inline without reloading scripts.`
    }
  })

  await prisma.blogPost.create({
    data: {
      title: "Zero-Copy Linux I/O: sendfile(), splice(), and io_uring",
      slug: "zero-copy-linux-io-uring",
      excerpt: "Eliminating CPU buffer copying, minimizing kernel context switches, and utilizing DMA scatter-gather rings for 100Gbps network throughput.",
      category: "Kernel & OS",
      readingTime: "10 min read",
      tags: ["linux", "kernel", "zero-copy", "io-uring"],
      featured: true,
      published: true,
      coverImage: "",
      content: `# Zero-Copy Linux I/O: sendfile(), splice(), and io_uring\n\nWhen serving static assets, streaming video chunks, or routing high-volume event streams, the conventional \`read()\` and \`write()\` system call workflow consumes massive CPU cycles solely copying bytes between kernel and userspace memory buffers.\n\n## The Traditional 4-Copy Penalty\n\nIn a traditional \`read()\` + \`write()\` pipeline:\n1. **DMA Copy**: Disk controller copies file data into Kernel PageCache.\n2. **CPU Copy**: Kernel copies data into application Userspace Buffer.\n3. **CPU Copy**: Application writes data back into Kernel Socket Buffer.\n4. **DMA Copy**: Socket buffer data is transferred to the Network Interface Card (NIC).\n\nThis incurs **4 Context Switches** and **2 CPU Buffer Copies**.\n\n## The Zero-Copy Solution: sendfile() with Gather DMA\n\nWith NIC hardware supporting Scatter-Gather DMA, no CPU data copying occurs at all. Only file descriptors and pointer offsets are copied into the socket queue, dropping CPU utilization to near zero.\n\n## Next-Generation Asynchronous I/O: io_uring\n\nJens Axboe's io_uring interface eliminates syscall overhead entirely by establishing two lockless ring buffers shared between userspace and the Linux kernel: Submission Queue (SQ) and Completion Queue (CQ).`
    }
  })

  await prisma.blogPost.create({
    data: {
      title: "Preventing Distributed Deadlocks in 2PC & Saga Workflows",
      slug: "distributed-deadlocks-2pc-saga",
      excerpt: "Analyzing distributed transaction isolation anomalies, write-ahead log coordination, and building backward compensating rollback workflows.",
      category: "Distributed Systems",
      readingTime: "11 min read",
      tags: ["consensus", "2pc", "saga", "transactions"],
      featured: true,
      published: true,
      coverImage: "",
      content: `# Preventing Distributed Deadlocks in 2PC & Saga Workflows\n\nCoordinating transactions across distributed microservices requires balancing strict ACID guarantees against availability and latency.\n\n## Two-Phase Commit (2PC): The Blocking Bottleneck\n\nTwo-Phase Commit provides strict serializability across multiple database nodes with Prepare and Commit phases. However, 2PC is synchronous and blocking.\n\n## Saga Orchestration: Eventual Consistency & Compensations\n\nThe Saga pattern replaces synchronous distributed locks with a sequence of local transactions with backward compensating rollbacks if any step fails.`
    }
  })

  await prisma.blogPost.create({
    data: {
      title: "Mechanical Sympathy: Cache Line False Sharing & Ring Buffers",
      slug: "cache-line-false-sharing-disruptor",
      excerpt: "Understanding 64-byte L1 cache lines, MESI cache coherence protocols, and atomic CAS sequence barriers in high-frequency messaging.",
      category: "Systems Engineering",
      readingTime: "9 min read",
      tags: ["concurrency", "lmax-disruptor", "hardware"],
      featured: false,
      published: true,
      coverImage: "",
      content: `# Mechanical Sympathy: Cache Line False Sharing & Ring Buffers\n\nMechanical sympathy means designing software to work in harmony with the underlying hardware.\n\n## The 64-Byte Cache Line & False Sharing\n\nWhen two independent variables reside in the same 64-byte cache line and are modified by different CPU cores, hardware MESI cache coherence invalidates the line repeatedly, degrading throughput.\n\n## Cache Line Padding in Practice\n\nPadding atomic sequence counters ensures they occupy distinct 64-byte boundaries, eliminating false sharing completely.`
    }
  })

  // 5. Seed Notes
  console.log("Seeding Knowledge Notes...")
  await prisma.note.create({
    data: {
      title: "System Design: Consistent Hashing Ring Algorithms",
      slug: "consistent-hashing-ring-algorithms",
      category: "System Design",
      tags: ["consistent-hashing", "scaling", "caching"],
      published: true,
      content: `# Consistent Hashing Rings\n\nConsistent hashing is a crucial algorithm for scaling distributed database caching clusters. It solves the key remapping problem when servers are added or removed using virtual nodes on a circular hash ring.`
    }
  })

  await prisma.note.create({
    data: {
      title: "DSA: Designing Lock-free Ring Buffer Queues",
      slug: "dsa-lock-free-ring-buffers",
      category: "DSA",
      tags: ["queues", "concurrency", "lock-free"],
      published: true,
      content: `# Lock-free Ring Buffers\n\nA high-throughput queue utilizing atomic sequence pointers instead of locks (Mutexes), matching LMAX Disruptor performance.`
    }
  })

  await prisma.note.create({
    data: {
      title: "Backend: Goroutine Scheduling & Thread-Pinning",
      slug: "goroutine-scheduling-thread-pinning",
      category: "Backend",
      tags: ["go", "concurrency", "scheduler"],
      published: true,
      content: `# Goroutine Scheduling & Thread-Pinning\n\nDeep dive into the Go runtime M:N scheduler (GOMAXPROCS, P, M, G states), work-stealing algorithms, and runtime.LockOSThread() for hardware cache locality.`
    }
  })

  await prisma.note.create({
    data: {
      title: "DevOps: Multi-region DNS Failover Architecture",
      slug: "multi-region-dns-failover",
      category: "DevOps",
      tags: ["dns", "route53", "failover"],
      published: true,
      content: `# Multi-region DNS Failover Architecture\n\nConfiguring Anycast BGP routing, Route53 health checks, TTL caching trade-offs, and multi-region active-active disaster recovery setups.`
    }
  })

  await prisma.note.create({
    data: {
      title: "Storage: LSM-Tree Leveled Compaction Mechanics",
      slug: "lsm-tree-compaction-mechanics",
      category: "Storage",
      tags: ["lsm-tree", "rocksdb", "compaction", "sstable"],
      published: true,
      content: `# LSM-Tree Leveled Compaction Mechanics\n\nHow Log-Structured Merge-Trees write to MemTable and Write-Ahead Logs before flushing immutable SSTables to disk across leveled compaction tiers.`
    }
  })

  await prisma.note.create({
    data: {
      title: "Networking: TCP BBR Congestion Control & Math",
      slug: "bbr-congestion-control-math",
      category: "Networking",
      tags: ["tcp", "bbr", "congestion-control", "networking"],
      published: true,
      content: `# TCP BBR Congestion Control & Math\n\nGoogle's Bottleneck Bandwidth and RTT (BBR) congestion control algorithm vs loss-based Cubic, preventing bufferbloat over lossy WAN links.`
    }
  })

  // 6. Seed Certificates
  console.log("Seeding Certificates...")
  await prisma.certificate.createMany({
    data: [
      {
        title: "Distributed Systems Architecture Specialist",
        issuer: "Cloud & Systems Computing Institute",
        issueDate: new Date("2025-12-01"),
        credentialId: "CSCI-DSAS-9281",
        credentialUrl: "https://github.com/dhananjaysinghk"
      },
      {
        title: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services (AWS)",
        issueDate: new Date("2025-09-01"),
        credentialId: "AWS-SAA-88402",
        credentialUrl: "https://github.com/dhananjaysinghk"
      },
      {
        title: "Advanced Go Concurrency & Microservices",
        issuer: "Go Software Engineering Guild",
        issueDate: new Date("2025-05-01"),
        credentialId: "GSEG-CONCUR-519",
        credentialUrl: "https://github.com/dhananjaysinghk"
      },
      {
        title: "Linux Foundation Systems Engineering (LFCS)",
        issuer: "The Linux Foundation",
        issueDate: new Date("2025-01-01"),
        credentialId: "LFCS-SYS-10492",
        credentialUrl: "https://github.com/dhananjaysinghk"
      },
      {
        title: "PostgreSQL High-Performance Indexing & Tuning",
        issuer: "Database Professionals Consortium",
        issueDate: new Date("2024-08-01"),
        credentialId: "DPC-PG-PERF-338",
        credentialUrl: "https://github.com/dhananjaysinghk"
      },
      {
        title: "Rust Systems Programming & Memory Safety",
        issuer: "Rust Systems Institute",
        issueDate: new Date("2024-03-01"),
        credentialId: "RSI-MEMSAFE-772",
        credentialUrl: "https://github.com/dhananjaysinghk"
      }
    ]
  })

  console.log("Database successfully seeded with default portfolio values!")
}

main()
  .catch((e) => {
    console.error("Database seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
