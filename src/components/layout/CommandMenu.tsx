"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, Bookmark, Sparkles, Terminal, Sun, Moon, Laptop, ArrowRight, Activity } from "lucide-react"

interface SearchItem {
  title: string
  category: string
  href: string
  type: "project" | "blog" | "note" | "action"
  icon: React.ComponentType<{ className?: string }>
}

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Actions and Navigation Targets
  const items: SearchItem[] = [
    { title: "View Projects Showcase", category: "Navigation", href: "/projects", type: "action", icon: Terminal },
    { title: "Read Engineering Blog", category: "Navigation", href: "/blog", type: "action", icon: FileText },
    { title: "Knowledge Notes Archives", category: "Navigation", href: "/notes", type: "action", icon: Bookmark },
    { title: "Read Dhananjay's Story", category: "Navigation", href: "/about", type: "action", icon: Sparkles },
    { title: "System Telemetry & Status", category: "Navigation", href: "/status", type: "action", icon: Activity },
    { title: "Nova Orchestrator Case Study", category: "Projects", href: "/projects/nova-orchestrator", type: "project", icon: Terminal },
    { title: "Aura Ledger Case Study", category: "Projects", href: "/projects/aura-ledger", type: "project", icon: Terminal },
    { title: "Vortex CDN Case Study", category: "Projects", href: "/projects/vortex-cdn", type: "project", icon: Terminal },
    { title: "Microsecond-Latency Rust Article", category: "Blog", href: "/blog/architecting-microsecond-latency-rust", type: "blog", icon: FileText },
    { title: "Custom Raft Consensus Protocol Go", category: "Blog", href: "/blog/designing-custom-raft-go", type: "blog", icon: FileText },
    { title: "Switch to Dark Mode", category: "Theme", href: "dark", type: "action", icon: Moon },
    { title: "Switch to Light Mode", category: "Theme", href: "light", type: "action", icon: Sun },
  ]

  // Filter items
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  )

  // Listen for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleSelect = (item: SearchItem) => {
    if (item.category === "Theme") {
      setTheme(item.href)
    } else {
      router.push(item.href)
    }
    setIsOpen(false)
  }

  // Handle keyboard selections
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filtered.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex])
      }
    }
  }

  return (
    <>
      {/* Trigger Hint - Floating in bottom corner (hidden on mobile, print) */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block print:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border border-border/80 bg-card/65 px-4 py-2 text-xs font-mono text-muted-foreground shadow-lg backdrop-blur-md hover:border-border hover:text-foreground transition-all duration-300"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] border border-border/40 font-sans shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Modal Dialog overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/40 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl backdrop-blur-lg flex flex-col"
            >
              {/* Search input field */}
              <div className="relative border-b border-border/40 p-4 flex items-center gap-3">
                <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search index..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded px-1.5 py-0.5 border border-border/40 text-[10px] font-sans text-muted-foreground hover:bg-muted"
                >
                  ESC
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
                {filtered.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {filtered.map((item, idx) => {
                      const Icon = item.icon
                      const isSelected = idx === selectedIndex

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-left transition-all ${
                            isSelected
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="grow font-medium truncate">{item.title}</span>
                          <span className="font-mono text-[10px] opacity-75 uppercase tracking-wider text-muted-foreground">
                            {item.category}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No results matching query.
                  </div>
                )}
              </div>

              {/* Footer Helper */}
              <div className="border-t border-border/40 bg-muted/30 px-4 py-2.5 text-[10px] text-muted-foreground font-mono flex gap-4 select-none">
                <span className="flex items-center gap-1">
                  <span className="font-sans">↑↓</span> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-sans">↵</span> Select
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
