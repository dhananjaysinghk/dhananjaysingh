"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Search, FolderOpen, Inbox, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setSelectedTag(null) // Reset tag filter on category switch
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold text-left whitespace-nowrap transition-all ${
                selectedCategory === cat && !selectedTag
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {cat}
            </button>
          ))}
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
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-mono border transition-all ${
                  isSelected
                    ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                    : "border-border/20 bg-card/10 text-muted-foreground hover:text-foreground hover:border-border/40"
                }`}
              >
                #{tag}
              </button>
            )
          })}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
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
              <Card className="h-full bg-card/25 border-border/40 group-hover:border-border/80 transition-all group-hover:bg-card/45">
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-purple-500 uppercase">
                      {note.category}
                    </span>
                    <CardTitle className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {note.title}
                    </CardTitle>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500 border border-purple-500/20 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border/10 text-muted-foreground"
                      >
                        #{tag}
                      </span>
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
