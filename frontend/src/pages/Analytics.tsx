import { useEffect, useState } from "react"
import { AlertTriangle, Zap, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { agentsApi } from "@/services/api"

interface Alert {
  _id: string
  patient_id: string
  alert_type: string
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  recommendations: string[]
  timestamp: string
  resolved: boolean
}

interface Recommendation {
  _id: string
  patient_id: string | null
  recommendation_type: string
  title: string
  description: string
  action: string
  priority: number
  implemented: boolean
}

interface Escalation {
  _id: string
  patient_id: string
  escalation_reason: string
  escalation_level: string
  triggered_by: string
  severity: string
  timestamp: string
  status: string
}

export function Analytics() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [agentRunning, setAgentRunning] = useState<string | null>(null)

  // Auto-load data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    setError("")
    try {
      const [alertsRes, recsRes, escalationsRes] = await Promise.allSettled([
        agentsApi.getAlerts(10),
        agentsApi.getRecommendations(10),
        agentsApi.getEscalations(),
      ])

      if (alertsRes.status === "fulfilled") {
        setAlerts(alertsRes.value.data)
      }
      if (recsRes.status === "fulfilled") {
        setRecommendations(recsRes.value.data)
      }
      if (escalationsRes.status === "fulfilled") {
        setEscalations(escalationsRes.value.data)
      }
    } catch {
      setError("Failed to load agent insights")
    } finally {
      setIsLoading(false)
    }
  }

  const runAgent = async (agentName: string, agentFunc: () => Promise<any>) => {
    setAgentRunning(agentName)
    setError("")
    try {
      await agentFunc()
      await loadAllData() // Reload data after agent runs
    } catch {
      setError(`Failed to run ${agentName} agent`)
    } finally {
      setAgentRunning(null)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      await agentsApi.resolveAlert(alertId)
      setAlerts(alerts.filter((a) => a._id !== alertId))
    } catch {
      setError("Failed to resolve alert")
    }
  }

  const implementRec = async (recId: string) => {
    try {
      await agentsApi.implementRecommendation(recId)
      setRecommendations(recommendations.filter((r) => r._id !== recId))
    } catch {
      setError("Failed to implement recommendation")
    }
  }

  const approveEscalation = async (escalationId: string) => {
    try {
      await agentsApi.approveEscalation(escalationId)
      setEscalations(escalations.map((e) =>
        e._id === escalationId ? { ...e, status: "approved" } : e
      ))
    } catch {
      setError("Failed to approve escalation")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-slate-950">
      <Navbar title="AI Analytics & Intelligence" />
      <div className="p-8 space-y-8">
        {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 rounded-lg p-4 border border-red-500/30">{error}</p>}

        {/* Agent Control Panel */}
        <Card className="border-0 shadow-lg bg-cyan-900/30 backdrop-blur border-cyan-600/30">
          <CardHeader className="border-b border-cyan-600/30">
            <CardTitle className="flex items-center gap-3 text-xl text-cyan-200">
              <Zap className="h-6 w-6 text-amber-500" />
              <span>AI Agent Control Panel</span>
            </CardTitle>
            <p className="text-sm text-cyan-200/60 mt-1">Execute intelligent agents for patient monitoring and decision support</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Button
                onClick={() => runAgent("all", agentsApi.runAll)}
                disabled={agentRunning !== null}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md"
              >
                {agentRunning === "all" ? "Running..." : "▶ Run All"}
              </Button>
              <Button
                onClick={() => runAgent("monitoring", agentsApi.runMonitoring)}
                disabled={agentRunning !== null}
                className="bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-600/30 text-cyan-200"
              >
                {agentRunning === "monitoring" ? "Running..." : "Monitoring"}
              </Button>
              <Button
                onClick={() => runAgent("clinical", agentsApi.runClinicalSupport)}
                disabled={agentRunning !== null}
                className="bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-600/30 text-cyan-200"
              >
                {agentRunning === "clinical" ? "Running..." : "Clinical Support"}
              </Button>
              <Button
                onClick={() => runAgent("resources", agentsApi.runResourceOptimization)}
                disabled={agentRunning !== null}
                className="bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-600/30 text-cyan-200"
              >
                {agentRunning === "resources" ? "Running..." : "Resource Optimization"}
              </Button>
              <Button
                onClick={() => runAgent("risk", agentsApi.runPredictiveRisk)}
                disabled={agentRunning !== null}
                variant="outline"
                className="border-cyan-600/30 text-cyan-200 hover:bg-cyan-900/20"
              >
                {agentRunning === "risk" ? "Running..." : "Predictive Risk"}
              </Button>
              <Button
                onClick={() => runAgent("escalation", agentsApi.runEscalation)}
                disabled={agentRunning !== null}
                variant="outline"
                className="border-cyan-600/30 text-cyan-200 hover:bg-cyan-900/20"
              >
                {agentRunning === "escalation" ? "Running..." : "Escalation Check"}
              </Button>
              <Button
                onClick={loadAllData}
                disabled={agentRunning !== null}
                variant="outline"
                size="sm"
                className="border-cyan-600/30 text-cyan-200 hover:bg-cyan-900/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Alerts Section */}
          <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-200">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Active Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-sm text-cyan-200/60">No active alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className={`rounded-lg border p-3 space-y-2 ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs opacity-80">{alert.message}</p>
                        </div>
                        <Badge variant={alert.severity === "critical" ? "destructive" : "default"}>
                          {alert.severity}
                        </Badge>
                      </div>
                      {alert.recommendations.length > 0 && (
                        <div className="text-xs opacity-90">
                          <p className="font-medium">Recommendations:</p>
                          <ul className="list-disc list-inside">
                            {alert.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resolveAlert(alert._id)}
                        className="text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Escalations Section */}
          <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-200">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                Escalations ({escalations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {escalations.length === 0 ? (
                  <p className="text-sm text-cyan-200/60">No pending escalations</p>
                ) : (
                  escalations.map((esc) => (
                    <div
                      key={esc._id}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm text-amber-300">{esc.escalation_reason}</p>
                          <p className="text-xs text-amber-200 opacity-75">
                            Level: {esc.escalation_level} | Triggered by: {esc.triggered_by}
                          </p>
                        </div>
                        <Badge variant={esc.status === "pending" ? "default" : "secondary"}>
                          {esc.status}
                        </Badge>
                      </div>
                      {esc.status === "pending" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveEscalation(esc._id)}
                          className="text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Approve
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Section */}
        <Card className="mt-6 bg-cyan-900/30 backdrop-blur border-cyan-600/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-200">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Priority Recommendations ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-sm text-cyan-200/60">No pending recommendations</p>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec._id}
                    className="rounded-lg border border-cyan-600/30 bg-cyan-900/20 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-cyan-300">{rec.title}</p>
                          <Badge variant="outline" className="text-xs">
                            Priority: {rec.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.recommendation_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-cyan-200/80 mt-1">{rec.description}</p>
                        <p className="text-xs text-cyan-200/60 mt-1 font-mono">Action: {rec.action}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => implementRec(rec._id)}
                      className="text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Mark as Implemented
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <Card className="w-64 bg-cyan-950/40 backdrop-blur border-cyan-600/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-cyan-200/60">Loading AI insights...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
