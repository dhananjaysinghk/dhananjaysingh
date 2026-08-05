"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { GitCommit, Info } from "lucide-react"
import { ScrollReveal } from "@/components/animation/motion-wrapper"

export function ContributionGraph() {
  // Generate mock contribution grid data (53 weeks * 7 days)
  const gridData = useMemo(() => {
    const data: number[] = []
    // 0 = no commits, 1 = low, 2 = medium, 3 = high, 4 = very high
    // Custom probability distribution to look like a realistic commit graph
    for (let i = 0; i < 371; i++) {
      const rand = Math.random()
      if (rand < 0.3) data.push(0)
      else if (rand < 0.6) data.push(1)
      else if (rand < 0.85) data.push(2)
      else if (rand < 0.95) data.push(3)
      else data.push(4)
    }
    return data
  }, [])

  // Color mappings based on contribution level
  const getColorClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50"
      case 1:
        return "bg-emerald-200 dark:bg-emerald-950 border border-emerald-300/30 dark:border-emerald-900/30"
      case 2:
        return "bg-emerald-300 dark:bg-emerald-800 border border-emerald-400/30 dark:border-emerald-700/30"
      case 3:
        return "bg-emerald-400 dark:bg-emerald-600"
      case 4:
        return "bg-emerald-500 dark:bg-emerald-400"
      default:
        return "bg-zinc-100 dark:bg-zinc-900"
    }
  }

  // Split into columns of 7 days
  const columns = useMemo(() => {
    const cols = []
    for (let i = 0; i < gridData.length; i += 7) {
      cols.push(gridData.slice(i, i + 7))
    }
    return cols
  }, [gridData])

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-2xl border border-border/40 bg-card/30 p-8 backdrop-blur-sm">
            <div className="flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500 border border-emerald-500/20">
                    <GitCommit className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Continuous Integration & Activity
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans">
                      Simulated compilation and code activity tracking across internal platforms
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <Info className="h-3.5 w-3.5" />
                  <span>3,412 commits in the last year</span>
                </div>
              </div>

              {/* Grid Scroll Wrapper */}
              <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="flex gap-[3px] min-w-[700px] select-none justify-between">
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-[3px]">
                      {col.map((level, dayIdx) => (
                        <motion.div
                          key={dayIdx}
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          className={`h-[10px] w-[10px] rounded-[1.5px] transition-colors duration-300 ${getColorClass(
                            level
                          )}`}
                          title={`Level ${level} activity`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono border-t border-border/20 pt-4 mt-2">
                <span>Jan</span>
                <span>Apr</span>
                <span>Jul</span>
                <span>Oct</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span>Less</span>
                  <div className="h-2.5 w-2.5 rounded-[1px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50" />
                  <div className="h-2.5 w-2.5 rounded-[1px] bg-emerald-200 dark:bg-emerald-950" />
                  <div className="h-2.5 w-2.5 rounded-[1px] bg-emerald-300 dark:bg-emerald-800" />
                  <div className="h-2.5 w-2.5 rounded-[1px] bg-emerald-400 dark:bg-emerald-600" />
                  <div className="h-2.5 w-2.5 rounded-[1px] bg-emerald-500 dark:bg-emerald-400" />
                  <span>More</span>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
