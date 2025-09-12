import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const startTime = Date.now()

    try {
      // Use fetch with a timeout to check if the website is up
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(validUrl.toString(), {
        method: "HEAD", // Use HEAD to avoid downloading the full page
        signal: controller.signal,
        headers: {
          "User-Agent": "IsItUp-Checker/1.0",
        },
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      return NextResponse.json({
        isUp: response.ok,
        responseTime,
        statusCode: response.status,
        url: validUrl.toString(),
      })
    } catch (error) {
      const responseTime = Date.now() - startTime

      // Check if it's a timeout or network error
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json({
          isUp: false,
          responseTime,
          error: "Request timeout",
          url: validUrl.toString(),
        })
      }

      return NextResponse.json({
        isUp: false,
        responseTime,
        error: "Network error or website unreachable",
        url: validUrl.toString(),
      })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
