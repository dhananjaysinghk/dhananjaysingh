"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sun, Moon, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { soundFx } from "@/lib/sound"

const navItems = [
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Notes", href: "/notes" },
  { name: "Resume", href: "/resume" },
  { name: "Contact", href: "/contact" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Avoid Hydration Mismatch
  useEffect(() => {
    setMounted(true)
    setSoundEnabled(soundFx.getSoundEnabled())
  }, [])

  const handleSoundToggle = () => {
    const newState = soundFx.toggleSound()
    setSoundEnabled(newState)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex">
            <Link
              href="/"
              onClick={() => soundFx.playClick()}
              className="group flex items-center space-x-2"
            >
              <span className="font-mono text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                DS<span className="text-muted-foreground group-hover:text-primary transition-colors">.dev</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => soundFx.playClick()}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-foreground/90",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-5.25 left-0 right-0 h-0.5 bg-foreground"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions: Sound Switcher, Theme Switcher & Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sound FX Toggle Button */}
            {mounted && (
              <button
                onClick={handleSoundToggle}
                className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none transition-all"
                title={soundEnabled ? "Mute interactive audio" : "Enable interactive sound effects"}
                aria-label="Toggle interactive audio"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 opacity-70" />
                )}
              </button>
            )}

            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={() => {
                  soundFx.playToggle()
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }}
                className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none transition-all"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                soundFx.playClick()
                setIsOpen(!isOpen)
              }}
              className="flex rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-border/40 bg-background/95 md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted",
                      isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
