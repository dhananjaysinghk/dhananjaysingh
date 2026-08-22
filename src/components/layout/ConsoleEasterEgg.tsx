"use client"

import { useEffect } from "react"

export function ConsoleEasterEgg() {
  useEffect(() => {
    // Avoid double rendering logs in strict mode
    if (typeof window === "undefined" || (window as any).__easter_egg_logged) return
    (window as any).__easter_egg_logged = true

    console.log(
      "%c Dhananjay Singh | Systems Engineer %c",
      "background: #4f46e5; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 14px;",
      ""
    )
    console.log(
      "%cWelcome to my portfolio developer console!",
      "color: #818cf8; font-family: monospace; font-size: 12px; font-weight: bold;"
    )
    console.log(
      `%cType %cCmd+K%c or %cCtrl+K%c anywhere on the site to trigger the Command Menu.
Click the floating terminal icon in the bottom-left corner to activate the sandbox console.`,
      "color: #94a3b8; font-family: monospace; font-size: 11px;",
      "background: #1e1b4b; color: #a5b4fc; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 11px;",
      "color: #94a3b8; font-family: monospace; font-size: 11px;",
      "background: #1e1b4b; color: #a5b4fc; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 11px;",
      "color: #94a3b8; font-family: monospace; font-size: 11px;"
    )
    console.log(
      "%cInterested in hiring or collaborating? Go to /contact or email dhananjay6903@gmail.com",
      "color: #10b981; font-family: monospace; font-size: 11px; font-weight: bold;"
    )
  }, [])

  return null
}
