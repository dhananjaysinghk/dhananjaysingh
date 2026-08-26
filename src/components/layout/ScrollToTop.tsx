"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-36 z-40 hidden md:flex items-center justify-center rounded-full border border-border/80 bg-card/65 p-3 text-muted-foreground shadow-lg backdrop-blur-md hover:border-border hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-300 print:hidden"
          aria-label="Scroll to top of page"
        >
          <ChevronUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
