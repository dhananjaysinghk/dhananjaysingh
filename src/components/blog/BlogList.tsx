"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Search, BookOpen, Inbox, Calendar, Clock, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { soundFx } from "@/lib/sound"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  readingTime: string
  createdAt: string
}

interface BlogListProps {
  initialPosts: BlogPost[]
}

export function BlogList({ initialPosts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Dynamically extract all unique categories from posts, keeping "All" at the front
  const categories = useMemo(() => {
    const cats = new Set<string>()
    initialPosts.forEach((post) => {
      if (post.category) cats.add(post.category)
    })
    return ["All", ...Array.from(cats)]
  }, [initialPosts])

  // Get all unique tags across all posts
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    initialPosts.forEach((post) => post.tags.forEach((t) => tagsSet.add(t)))
    return Array.from(tagsSet).sort()
  }, [initialPosts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    let result = [...initialPosts]

    // 1. Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // 2. Filter by tag
    if (selectedTag) {
      result = result.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      )
    }

    // 3. Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    return result
  }, [initialPosts, selectedCategory, selectedTag, searchQuery])

  return (
    <div className="flex flex-col gap-10">
      
      {/* Search Input & Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-border/20">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search articles by title, keywords, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/20 border-border/40 focus:border-border/80"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 self-start md:self-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick()
                setSelectedCategory(cat)
                setSelectedTag(null) // Reset tag filter on category switch
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                selectedCategory === cat && !selectedTag
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "border-border/40 bg-card/30 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full flex flex-col justify-between bg-card/30 border-border/40 hover:border-primary/40 transition-all duration-300 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground font-mono mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-primary px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {post.createdAt}
                  </span>
                </div>
                <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 grow flex flex-col justify-between gap-4">
                <CardDescription className="text-sm font-sans text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt}
                </CardDescription>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-2 py-0.5 text-[10px] font-mono border border-border/20 bg-muted/40 text-foreground/80 hover:bg-muted"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/20 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {post.readingTime}
                </span>
                <span className="inline-flex items-center gap-1 font-medium group-hover:text-primary transition-colors">
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/10 p-16 text-center flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            No articles found
          </h3>
          <p className="text-sm text-muted-foreground font-sans max-w-sm">
            Try adjusting your search criteria or selecting a different category filter above.
          </p>
        </div>
      )}

    </div>
  )
}
