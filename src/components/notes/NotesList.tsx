"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Inbox, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface Note {
  id: string
  title: string
  slug: string
  category: string
  tags: string[]
}

interface NotesListProps {
  initialNotes: Note[]
}

const categories = [
  "All",
  "DSA",
  "System Design",
  "Go",
  "DevOps",
  "React",
  "Next.js",
  "Backend",
  "Cloud",
]

export function NotesList({ initialNotes }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all unique tags across all notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    initialNotes.forEach((note) => note.tags.forEach((t) => tagsSet.add(t)))
    return Array.from(tagsSet).sort()
  }, [initialNotes])

  // Filter notes
  const filteredNotes = useMemo(() => {
    let result = [...initialNotes]

    // 1. Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(
        (n) => n.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // 2. Filter by tag
    if (selectedTag) {
      result = result.filter((n) =>
        n.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      )
    }

    // 3. Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query) ||
          n.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    return result
  }, [initialNotes, selectedCategory, selectedTag, searchQuery])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Category Sidebar */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground pl-3">
          Categories
        </h3>
        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat && !selectedTag
            return (
              <button
                key={cat}
                onClick={() => {
                  soundFx.playClick()
                  setSelectedCategory(cat)
                  setSelectedTag(null) // Reset tag filter on category switch
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-left whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
              >
                {cat}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search notes by keyword, tags, or system names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/20 border-border/40 focus:border-border/80"
          />
        </div>

        {/* Tech Tags Filter */}
        <div className="flex flex-wrap gap-1.5 items-center border-t border-border/10 pt-4">
          <span className="text-[10px] font-mono text-muted-foreground uppercase mr-2">
            Filter by Tag:
          </span>
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag
            return (
              <button
                key={tag}
                onClick={() => {
                  soundFx.playClick()
                  setSelectedTag(isSelected ? null : tag)
                }}
                className={`rounded-md px-2.5 py-1 text-[10px] font-mono border transition-all ${
                  isSelected
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/40 font-semibold"
                    : "border-border/20 bg-card/10 text-muted-foreground hover:text-foreground hover:border-border/40"
                }`}
              >
                #{tag}
              </button>
            )
          })}
          {selectedTag && (
            <button
              onClick={() => {
                soundFx.playClick()
                setSelectedTag(null)
              }}
              className="text-[10px] font-mono text-red-400 hover:text-red-300 underline underline-offset-2 ml-2"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.category.toLowerCase().replace(/\s+/g, "-")}/${note.slug}`}
              className="group"
            >
              <Card className="h-full flex flex-col justify-between bg-card/30 border-border/40 hover:border-purple-500/40 hover:bg-card/60 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full self-start uppercase">
                      {note.category}
                    </span>
                    <CardTitle className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {note.title}
                    </CardTitle>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {note.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-2 py-0.5 text-[10px] font-mono border border-border/20 bg-muted/40 text-foreground/80 hover:bg-muted"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/10 p-16 text-center flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              No notes found
            </h3>
            <p className="text-sm text-muted-foreground font-sans max-w-sm">
              Try adjusting your search criteria or selecting a different category sidebar option.
            </p>
          </div>
        )}

      </div>

    </div>
  )
}
