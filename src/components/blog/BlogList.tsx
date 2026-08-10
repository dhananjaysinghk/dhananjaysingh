"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Search, BookOpen, Inbox, Calendar, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

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

const categories = ["All", "Systems Engineering", "Distributed Systems", "Frontend Architecture"]

export function BlogList({ initialPosts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Filter posts
  const filteredPosts = useMemo(() => {
    let result = [...initialPosts]

    // 1. Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // 2. Filter by search query
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
  }, [initialPosts, selectedCategory, searchQuery])

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
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "border-border/40 bg-card/30 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full bg-card/25 border-border/40 group-hover:border-border/80 transition-all group-hover:bg-card/45">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono mb-2">
                  <span className="text-primary font-bold uppercase">{post.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.createdAt}
                  </span>
                </div>
                <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 grow">
                <CardDescription className="text-sm font-sans text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/20 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors flex justify-between items-center">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
                <span className="underline underline-offset-4 group-hover:text-primary transition-colors">
                  Read Article
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
