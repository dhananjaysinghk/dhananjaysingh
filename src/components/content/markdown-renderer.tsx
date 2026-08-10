"use client"

import React, { useMemo } from "react"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

interface MarkdownRendererProps {
  content: string
}

// Reusable custom Callout component for MDX content
export function Callout({ type = "info", children }: { type?: "info" | "warning" | "error" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-blue-500 bg-blue-500/10 text-blue-200",
    warning: "border-amber-500 bg-amber-500/10 text-amber-200",
    error: "border-red-500 bg-red-500/10 text-red-200",
    success: "border-emerald-500 bg-emerald-500/10 text-emerald-200",
  }

  const Icons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle,
  }

  const Icon = Icons[type]

  return (
    <div className={`my-6 flex gap-4 rounded-lg border-l-4 p-4 ${styles[type]}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}

// Simple regex-based syntax tokenizer for highlighting
function highlightCode(code: string, language: string): React.ReactNode {
  if (!language) return code

  const lang = language.toLowerCase()
  const lines = code.split("\n")

  return (
    <code>
      {lines.map((line, idx) => {
        // Simple token highlights
        let highlighted = line

        // Skip escaping strings if they have comments first to prevent weird highlight overlaps
        if (lang === "go" || lang === "rust" || lang === "typescript" || lang === "js" || lang === "java") {
          // Comments
          highlighted = highlighted.replace(/(\/\/.*)/g, '<span class="text-zinc-500 font-normal">$1</span>')
          // Strings
          highlighted = highlighted.replace(/(["'`])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>')
          // Keywords
          const keywords = /\b(const|let|var|function|return|import|export|default|from|package|func|import|type|struct|interface|func|fn|pub|impl|use|let|mut|match|if|else|for|range|select|case|defer|go|class|public|private|static|void|int|string|boolean)\b/g
          highlighted = highlighted.replace(keywords, '<span class="text-indigo-400 font-semibold">$1</span>')
          // Builtins / Types
          const types = /\b(string|number|boolean|any|unknown|void|error|map|slice|nil|None|Some|Result|Option)\b/g
          highlighted = highlighted.replace(types, '<span class="text-purple-400">$1</span>')
          // Numbers
          highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>')
        } else if (lang === "bash" || lang === "sh") {
          highlighted = highlighted.replace(/(#.*)/g, '<span class="text-zinc-500">$1</span>')
          highlighted = highlighted.replace(/(["'])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>')
          const commands = /\b(npm|npx|git|cd|ls|mkdir|docker|kubectl|go|cargo|rustc|prisma)\b/g
          highlighted = highlighted.replace(commands, '<span class="text-indigo-400">$1</span>')
        } else if (lang === "sql") {
          highlighted = highlighted.replace(/(--.*)/g, '<span class="text-zinc-500">$1</span>')
          highlighted = highlighted.replace(/(['])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>')
          const sqlKeywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|INNER|ON|ORDER|BY|GROUP|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DATABASE|INDEX|FOREIGN|KEY|PRIMARY|VARCHAR|INT|TEXT|BOOLEAN|TIMESTAMP)\b/gi
          highlighted = highlighted.replace(sqlKeywords, '<span class="text-indigo-400 font-semibold">$1</span>')
        }

        return (
          <span
            key={idx}
            className="block min-h-5"
            dangerouslySetInnerHTML={{ __html: highlighted || " " }}
          />
        )
      })}
    </code>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Parse markdown into static HTML structured nodes
  const parsedContent = useMemo(() => {
    if (!content) return null

    const lines = content.split("\n")
    const elements: React.ReactNode[] = []
    let inList = false
    let listItems: string[] = []
    let inCodeBlock = false
    let codeBlockLang = ""
    let codeBlockLines: string[] = []
    let inCallout = false
    let calloutType: "info" | "warning" | "error" | "success" = "info"
    let calloutLines: string[] = []

    const pushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="my-5 list-disc list-outside pl-6 space-y-2 text-muted-foreground">
            {listItems.map((li, liIdx) => (
              <li key={liIdx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(li) }} />
            ))}
          </ul>
        )
        listItems = []
        inList = false
      }
    }

    const pushCallout = (key: number) => {
      if (calloutLines.length > 0) {
        elements.push(
          <Callout key={`callout-${key}`} type={calloutType}>
            {calloutLines.map((line, lineIdx) => (
              <p
                key={lineIdx}
                className={lineIdx > 0 ? "mt-2" : ""}
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }}
              />
            ))}
          </Callout>
        )
        calloutLines = []
        inCallout = false
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // 1. Code Block Handling
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // End of code block
          const codeString = codeBlockLines.join("\n")
          elements.push(
            <div key={`code-${i}`} className="my-6 overflow-hidden rounded-lg border border-border/40 bg-zinc-950 p-4 font-mono text-xs text-zinc-100">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3 text-[10px] text-zinc-500 uppercase select-none">
                <span>{codeBlockLang || "code"}</span>
              </div>
              <pre className="overflow-x-auto scrollbar-thin py-1">
                {highlightCode(codeString, codeBlockLang)}
              </pre>
            </div>
          )
          codeBlockLines = []
          inCodeBlock = false
        } else {
          // Start of code block
          pushList(i)
          pushCallout(i)
          inCodeBlock = true
          codeBlockLang = line.trim().slice(3)
        }
        continue
      }

      if (inCodeBlock) {
        codeBlockLines.push(line)
        continue
      }

      // 2. Custom Callout handling
      // Format: :::info or :::warning
      if (line.trim().startsWith(":::")) {
        if (inCallout) {
          pushCallout(i)
        } else {
          pushList(i)
          inCallout = true
          const type = line.trim().slice(3) as any
          calloutType = ["info", "warning", "error", "success"].includes(type) ? type : "info"
        }
        continue
      }

      if (inCallout) {
        calloutLines.push(line)
        continue
      }

      // 3. Headers
      if (line.startsWith("#")) {
        pushList(i)
        const match = line.match(/^(#{1,6})\s+(.*)$/)
        if (match) {
          const level = match[1].length
          const text = match[2]
          const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
          const headingClasses = {
            1: "font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-10 mb-6",
            2: "font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-8 mb-4 border-b border-border/10 pb-2",
            3: "font-heading text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-6 mb-3",
            4: "font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight mt-5 mb-2",
            5: "font-heading text-base font-bold text-foreground tracking-tight mt-4 mb-2",
            6: "font-heading text-sm font-bold text-foreground tracking-tight mt-4 mb-2",
          }
          const HeadingTag = `h${level}` as any
          elements.push(
            <HeadingTag
              key={`h-${i}`}
              id={id}
              className={headingClasses[level as keyof typeof headingClasses]}
              dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(text) }}
            />
          )
          continue
        }
      }

      // 4. List Items
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        inList = true
        listItems.push(line.trim().slice(2))
        continue
      }

      // If we are in a list but the current line is empty or not a list item, flush it
      if (inList && line.trim() === "") {
        pushList(i)
        continue
      }

      // 5. Standard Paragraphs
      if (line.trim() !== "") {
        pushList(i)
        elements.push(
          <p
            key={`p-${i}`}
            className="my-4 text-base leading-relaxed text-muted-foreground font-sans"
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }}
          />
        )
      }
    }

    // Flush any remaining lists or callouts
    pushList(lines.length)
    pushCallout(lines.length)

    return elements
  }, [content])

  return <div className="prose prose-zinc dark:prose-invert max-w-none">{parsedContent}</div>
}

// Parse bold, italic, code, and links inline
function parseInlineMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // 1. Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')

  // 2. Italic: *text*
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

  // 3. Inline Code: `code`
  html = html.replace(/`(.*?)`/g, '<code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground/90 border border-border/10">$1</code>')

  // 4. Links: [label](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">$1</a>')

  return html
}
