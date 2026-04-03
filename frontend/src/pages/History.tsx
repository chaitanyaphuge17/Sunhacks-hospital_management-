import { useEffect, useState } from "react"
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { historyApi } from "@/services/api"

interface HistoryEntry {
  id: string
  date: string
  time: string
  riskLevel: "High" | "Medium" | "Low"
  riskScore: number
  trend: "up" | "down" | "stable"
  criticalCount: number
  actionsCount: number
  summary: string
}

interface ApiHistoryEntry {
  id: string
  timestamp: string
  result: {
    risk?: "ICU_SHORTAGE" | "STABLE"
    reason?: string
    critical_patients?: string[]
    recommended_actions?: string[]
  }
}

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-400" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-emerald-400" />
  return <Minus className="h-4 w-4 text-cyan-200/60" />
}

export function History() {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await historyApi.list(100)
        const mapped: HistoryEntry[] = (response.data as ApiHistoryEntry[]).map((item, index) => {
          const timestamp = new Date(item.timestamp)
          const result = item.result ?? {}
          const risk = result.risk === "ICU_SHORTAGE" ? "High" : "Low"
          const criticalCount = Array.isArray(result.critical_patients)
            ? result.critical_patients.length
            : 0
          const actionsCount = Array.isArray(result.recommended_actions)
            ? result.recommended_actions.length
            : 0
          return {
            id: item.id ?? String(index),
            date: timestamp.toLocaleDateString(),
            time: timestamp.toLocaleTimeString(),
            riskLevel: risk,
            riskScore: risk === "High" ? 80 : 30,
            trend: "stable",
            criticalCount,
            actionsCount,
            summary: result.reason ?? "No summary available.",
          }
        })
        setHistoryData(mapped)
      } catch {
        setError("Failed to load analysis history.")
      } finally {
        setIsLoading(false)
      }
    }
    void loadHistory()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-slate-950">
      <Navbar title="History" />
      <div className="p-6">
        <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
          <CardHeader>
            <CardTitle className="text-cyan-200">Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/30">{error}</p>}
            {isLoading && <p className="mb-4 text-sm text-cyan-200/60">Loading history...</p>}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-0 h-full w-px bg-cyan-600/30" />

              <div className="space-y-6">
                {historyData.map((entry, index) => (
                  <div key={entry.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                      entry.riskLevel === "High"
                        ? "border-red-500 bg-red-500/20"
                        : entry.riskLevel === "Medium"
                        ? "border-amber-500 bg-amber-500/20"
                        : "border-emerald-500 bg-emerald-500/20"
                    }`}>
                      <Clock className={`h-4 w-4 ${
                        entry.riskLevel === "High"
                          ? "text-red-400"
                          : entry.riskLevel === "Medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`} />
                    </div>

                    {/* Content card */}
                    <div className={`flex-1 rounded-lg border bg-cyan-900/20 p-4 ${
                      index === 0 ? "border-cyan-500/50" : "border-cyan-600/30"
                    }`}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-cyan-200">{entry.date}</span>
                            <span className="text-sm text-cyan-200/60">{entry.time}</span>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">Latest</Badge>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-cyan-200/60">{entry.summary}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 rounded-md bg-cyan-900/30 px-2.5 py-1.5 border border-cyan-600/20">
                            <span className="text-xs text-cyan-200/60">Score</span>
                            <span className="font-semibold text-cyan-200">{entry.riskScore}</span>
                            <TrendIcon trend={entry.trend} />
                          </div>

                          <Badge
                            variant={
                              entry.riskLevel === "High"
                                ? "destructive"
                                : entry.riskLevel === "Medium"
                                ? "warning"
                                : "success"
                            }
                          >
                            {entry.riskLevel}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-200/60">Critical Patients:</span>
                          <span className="font-medium text-cyan-200">{entry.criticalCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-200/60">Actions Recommended:</span>
                          <span className="font-medium text-cyan-200">{entry.actionsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!isLoading && historyData.length === 0 && (
                  <p className="text-sm text-cyan-200/60">
                    No analysis history yet. Run analysis to generate records.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
