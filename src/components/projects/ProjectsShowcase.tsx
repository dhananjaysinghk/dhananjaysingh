"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, ArrowRight, Github, ExternalLink, Inbox } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  title: string
  slug: string
  description: string
  techStack: string[]
  category: string
  github?: string | null
  demo?: string | null
}

interface ProjectsShowcaseProps {
  initialProjects: Project[]
}

const categories = ["All", "Backend & Systems", "Distributed Systems", "Cloud Infrastructure", "Fullstack"]

export function ProjectsShowcase({ initialProjects }: ProjectsShowcaseProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, alphabetical

  // Get all unique tech tags across all projects
  const allTechs = useMemo(() => {
    const techs = new Set<string>()
    initialProjects.forEach((p) => p.techStack.forEach((t) => techs.add(t)))
    return Array.from(techs).sort()
  }, [initialProjects])

  // Filter & Sort logic
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...initialProjects]

    // 1. Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // 2. Filter by tech tag
    if (selectedTech) {
      result = result.filter((p) =>
        p.techStack.some((t) => t.toLowerCase() === selectedTech.toLowerCase())
      )
    }

    // 3. Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.techStack.some((t) => t.toLowerCase().includes(query))
      )
    }

    // 4. Sort
    if (sortBy === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === "oldest") {
      result.reverse()
    }

    return result
  }, [initialProjects, selectedCategory, selectedTech, searchQuery, sortBy])

  return (
    <div className="flex flex-col gap-8">
      
      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b border-border/20">
        
        {/* Search */}
        <div className="relative grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search projects by title, stack, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/20 border-border/40 focus:border-border/80 focus:ring-1 focus:ring-ring focus:ring-offset-0"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border/40 bg-card/30 px-3 py-1.5 text-sm text-foreground focus:border-border/80 focus:outline-none focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="alphabetical">Sort: A-Z</option>
          </select>
        </div>

      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat)
              setSelectedTech(null) // Reset tech filter on category switch
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide border transition-all ${
              selectedCategory === cat && !selectedTech
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "border-border/40 bg-card/30 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tech Stack Pills Filter */}
      <div className="flex flex-wrap gap-1.5 items-center border-t border-border/10 pt-4">
        <span className="text-[10px] font-mono text-muted-foreground uppercase mr-2">
          Filter by Stack:
        </span>
        {allTechs.map((tech) => {
          const isSelected = selectedTech === tech
          return (
            <button
              key={tech}
              onClick={() => setSelectedTech(isSelected ? null : tech)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-mono border transition-all ${
                isSelected
                  ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                  : "border-border/20 bg-card/10 text-muted-foreground hover:text-foreground hover:border-border/40"
              }`}
            >
              {tech}
            </button>
          )
        })}
        {selectedTech && (
          <button
            onClick={() => setSelectedTech(null)}
            className="text-[10px] font-mono text-red-400 hover:text-red-300 underline underline-offset-2 ml-2"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Grid Showcase */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedProjects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="flex flex-col h-full bg-card/25 backdrop-blur-sm border-border/40 hover:border-border/80 transition-all hover:bg-card/45 group">
                <CardHeader className="pb-4">
                  <span className="text-xs font-mono tracking-tight text-muted-foreground uppercase mb-2 block">
                    {project.category}
                  </span>
                  <CardTitle className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
                    <Link href={`/projects/${project.slug}`}>
                      {project.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grow">
                  <CardDescription className="text-sm font-sans text-muted-foreground leading-relaxed">
                    {project.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {project.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="px-2 py-0.5 text-[10px] font-mono border-border/30 text-muted-foreground"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/20 flex gap-4 text-xs font-medium">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View Case Study
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="flex gap-3 ml-auto text-muted-foreground">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                        aria-label="GitHub Repository"
                      >
                        <Github className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                        aria-label="Live Demo"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredAndSortedProjects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/10 p-16 text-center flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            No projects match your criteria
          </h3>
          <p className="text-sm text-muted-foreground font-sans max-w-sm">
            Try adjusting your search terms or selecting a different category filter above.
          </p>
        </div>
      )}

    </div>
  )
}
