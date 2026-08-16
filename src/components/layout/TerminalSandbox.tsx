"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, X, Minimize2, Maximize2, RefreshCw } from "lucide-react"

interface CommandHistory {
  input: string
  output: React.ReactNode
}

export function TerminalSandbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputVal, setInputVal] = useState("")
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      input: "system-init",
      output: (
        <div className="font-mono text-zinc-400 space-y-1">
          <p className="text-emerald-400">Dhananjay OS v1.0.0 (x86_64-pc-linux-gnu)</p>
          <p>Welcome to the interactive developer terminal sandbox.</p>
          <p>Type <span className="text-purple-400">help</span> to view available system commands.</p>
        </div>
      ),
    },
  ])

  const consoleEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll console to bottom on update
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history, isMinimized])

  // Focus console input on click
  const focusInput = () => {
    inputRef.current?.focus()
  }

  // Focus input automatically on open/maximize
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim().toLowerCase()
    let output: React.ReactNode = ""

    switch (trimmed) {
      case "help":
        output = (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 font-mono text-zinc-300">
            <div><span className="text-emerald-400">help</span> - List system commands</div>
            <div><span className="text-emerald-400">about</span> - Summary profile schema</div>
            <div><span className="text-emerald-400">projects</span> - Showcase code structures</div>
            <div><span className="text-emerald-400">skills</span> - Neofetch-style technology stats</div>
            <div><span className="text-emerald-400">clear</span> - Flush terminal outputs</div>
            <div><span className="text-emerald-400">close</span> - Deactivate terminal drawer</div>
          </div>
        )
        break

      case "about":
        output = (
          <pre className="text-indigo-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
{`{
  "name": "Dhananjay Singh",
  "role": "Software Engineer & Student",
  "location": "Mathura, India",
  "education": {
    "degree": "B.Tech Computer Science & Engineering",
    "institution": "GLA University",
    "graduation": "Expected May 2027"
  },
  "focus": ["Backend Infrastructures", "Distributed Consensus Routing"],
  "status": "Seeking summer software internship roles"
}`}
          </pre>
        )
        break

      case "projects":
        output = (
          <div className="flex flex-col gap-2 font-mono text-zinc-300">
            <p>• <span className="text-indigo-400 font-bold">Nova Orchestrator</span> (Go, gRPC) - Sub-10ms cloud job scheduler</p>
            <p>• <span className="text-indigo-400 font-bold">Aura Ledger</span> (Rust, PostgreSQL) - Distributed transactional balance log</p>
            <p>• <span className="text-indigo-400 font-bold">Vortex CDN</span> (Rust, Wasmtime) - Pre-initialized memory isolate edge cache</p>
          </div>
        )
        break

      case "skills":
        output = (
          <div className="flex flex-col sm:flex-row gap-6 font-mono text-xs text-zinc-300">
            {/* Left ASCII Logo */}
            <div className="text-emerald-400 font-bold leading-tight select-none">
              <pre>
{`   /\\_/\\
  ( o.o )
   > ^ <
 DhananjayOS`}
              </pre>
            </div>
            
            {/* Stats list */}
            <div className="space-y-1">
              <p><span className="text-emerald-400">OS</span>: GLA Linux x86_64</p>
              <p><span className="text-emerald-400">Host</span>: GlaUniversity-BTechCS</p>
              <p><span className="text-emerald-400">Kernel</span>: Go-Raft-Client-16</p>
              <p><span className="text-emerald-400">Uptime</span>: 342,112 compiles</p>
              <p><span className="text-emerald-400">Shell</span>: pwsh / Honodb</p>
              <p><span className="text-emerald-400">Stack</span>: Go, Rust, TypeScript, SQL, Docker</p>
            </div>
          </div>
        )
        break

      case "clear":
        setHistory([])
        setInputVal("")
        return

      case "close":
      case "exit":
        setIsOpen(false)
        setInputVal("")
        return

      case "":
        output = ""
        break

      default:
        output = (
          <span className="text-red-400 font-mono">
            sh: command not found: {cmdText}. Type &apos;help&apos; for list.
          </span>
        )
    }

    setHistory((prev) => [...prev, { input: cmdText, output }])
    setInputVal("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(inputVal)
    }
  }

  return (
    <>
      {/* Toggle button - Bottom Left floating */}
      <div className="fixed bottom-6 left-6 z-40 print:hidden">
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="flex items-center gap-2 rounded-full border border-border/80 bg-card/65 p-3 text-muted-foreground shadow-lg backdrop-blur-md hover:border-border hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Toggle terminal sandbox"
        >
          <Terminal className="h-5 w-5 text-emerald-400" />
        </button>
      </div>

      {/* Terminal panel */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed bottom-20 left-6 right-6 md:right-auto md:w-150 h-90 rounded-xl border border-border bg-zinc-950 text-zinc-100 shadow-2xl flex flex-col z-50 overflow-hidden font-mono text-xs"
            onClick={focusInput}
          >
            {/* Header / Title bar */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-zinc-300">dhananjay@sandbox:~</span>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMinimized(true)
                  }}
                  className="text-zinc-500 hover:text-zinc-300"
                  title="Minimize"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  className="text-zinc-500 hover:text-red-400"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Console Screen */}
            <div className="grow overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin select-text">
              {history.map((hist, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">dhananjay@sandbox:~$</span>
                    <span className="text-zinc-100 font-semibold">{hist.input}</span>
                  </div>
                  {hist.output && <div>{hist.output}</div>}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-zinc-900/60 border-t border-zinc-900/90 p-3 flex items-center gap-2 select-none">
              <span className="text-emerald-500 shrink-0">dhananjay@sandbox:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none text-zinc-100 focus:outline-none placeholder:text-zinc-700"
                placeholder="Type command here..."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Indicator */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-20 z-40 bg-zinc-900 border border-border px-4 py-2 rounded-full flex items-center gap-3 shadow-lg select-none print:hidden cursor-pointer"
            onClick={() => setIsMinimized(false)}
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-medium text-zinc-300">sandbox running</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              className="text-zinc-500 hover:text-red-400 pl-2 border-l border-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
