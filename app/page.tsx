"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Globe, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{
    status: "up" | "down" | null
    responseTime?: number
    statusCode?: number
  }>({ status: null })
  const { toast } = useToast()

  const checkWebsite = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      })
      return
    }

    // Add protocol if missing
    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`
    }

    setIsChecking(true)
    setResult({ status: null })

    try {
      const response = await fetch("/api/check-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          status: data.isUp ? "up" : "down",
          responseTime: data.responseTime,
          statusCode: data.statusCode,
        })

        toast({
          title: data.isUp ? "Website is Up!" : "Website is Down",
          description: data.isUp ? `Response time: ${data.responseTime}ms` : "The website is not responding",
          variant: data.isUp ? "default" : "destructive",
        })
      } else {
        throw new Error(data.error || "Failed to check website")
      }
    } catch (error) {
      console.error("Error checking website:", error)
      setResult({ status: "down" })
      toast({
        title: "Error",
        description: "Failed to check website status",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    checkWebsite()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Globe className="h-8 w-8 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Is It Up?</h1>
          <p className="text-muted-foreground">Check if any website is up and running</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Website Status Checker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isChecking}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isChecking}>
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Check Status
                  </>
                )}
              </Button>
            </form>

            {result.status && (
              <div className="space-y-2">
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    result.status === "up"
                      ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {result.status === "up" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        result.status === "up" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {result.status === "up" ? "Website is Up" : "Website is Down"}
                    </p>
                    {result.responseTime && (
                      <p className="text-sm text-muted-foreground">
                        Response time: {result.responseTime}ms
                        {result.statusCode && ` • Status: ${result.statusCode}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Enter any website URL to check its availability</p>
        </div>
      </div>
    </div>
  )
}
