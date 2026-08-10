"use client"

import React, { useState, useEffect, useMemo } from "react"

interface HeadingItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  // Parse markdown content to find H2 and H3 headings
  const headings = useMemo(() => {
    const lines = content.split("\n")
    const items: HeadingItem[] = []

    lines.forEach((line) => {
      // Find H2 and H3 headings
      const match = line.match(/^(#{2,3})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const text = match[2]
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")

        items.push({ id, text, level })
      }
    })

    return items
  }, [content])

  // Track active heading in view using IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    )

    // Observe each heading element
    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id)
        if (el) observer.unobserve(el)
      })
    }
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="flex flex-col gap-3 font-sans">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        On this page
      </h4>
      <nav className="flex flex-col gap-2 text-xs">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(heading.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
              setActiveId(heading.id)
            }}
            className={`transition-colors leading-relaxed hover:text-foreground ${
              heading.level === 3 ? "pl-4" : ""
            } ${
              activeId === heading.id
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
