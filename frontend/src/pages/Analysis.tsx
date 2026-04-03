import { useState } from "react"
import { Play, AlertTriangle, Users, Lightbulb, FileText, Loader2 } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { analysisApi } from "@/services/api"

interface AnalysisResult {
  risk: "ICU_SHORTAGE" | "STABLE"
  reason: string
  critical_patients: string[]
  recommended_actions: string[]
}

export function Analysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setResult(null)
    setError("")
    try {
      const response = await analysisApi.run()
      setResult(response.data)
    } catch {
      setError("Analysis failed. Verify backend, Groq API key, and database connectivity.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-slate-950">
      <Navbar title="Analysis" />
      <div className="p-6">
        <Card className="mb-6 bg-cyan-900/30 backdrop-blur border-cyan-600/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-cyan-200">Decision Intelligence Analysis</CardTitle>
                <CardDescription className="text-cyan-200/60">
                  Run comprehensive analysis on current patient data and resource allocation
                </CardDescription>
              </div>
              <Button onClick={runAnalysis} disabled={isAnalyzing} size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
        {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/30">{error}</p>}

        {result && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Risk Status Card */}
            <Card className={`bg-cyan-900/30 backdrop-blur border-cyan-600/30 ${result.risk === "ICU_SHORTAGE" ? "border-red-500/50" : ""}`}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`rounded-lg p-3 ${
                  result.risk === "ICU_SHORTAGE" ? "bg-red-500/10" : "bg-emerald-500/10"
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    result.risk === "ICU_SHORTAGE" ? "text-red-500" : "text-emerald-500"
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-cyan-200">Risk Status</CardTitle>
                  <CardDescription className="text-cyan-200/60">Overall hospital risk assessment</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge
                      variant={result.risk === "ICU_SHORTAGE" ? "destructive" : "success"}
                      className="mt-2"
                    >
                      {result.risk === "ICU_SHORTAGE" ? "ICU Shortage Risk" : "Stable"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-cyan-200/60">System Assessment</p>
                    <p className="text-sm font-medium text-cyan-200">{result.risk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Patients Card */}
            <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-cyan-200">Critical Patients</CardTitle>
                  <CardDescription className="text-cyan-200/60">Patients requiring immediate attention</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.critical_patients.map((patient, index) => (
                    <div
                      key={`${patient}-${index}`}
                      className="flex items-start gap-3 rounded-lg border border-cyan-600/30 bg-cyan-900/20 p-3"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-cyan-200">{patient}</p>
                        <p className="text-sm text-cyan-200/60">Flagged as critical by AI analysis.</p>
                      </div>
                    </div>
                  ))}
                  {result.critical_patients.length === 0 && (
                    <p className="text-sm text-cyan-200/60">No critical patients identified.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Actions Card */}
            <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <Lightbulb className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-cyan-200">Recommended Actions</CardTitle>
                  <CardDescription className="text-cyan-200/60">Suggested interventions based on analysis</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.recommended_actions.map((action, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-cyan-200">Action {index + 1}</p>
                        <Badge variant="secondary">Recommended</Badge>
                      </div>
                      <p className="text-sm text-cyan-200/60">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Explanation Card */}
            <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <FileText className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-cyan-200">Analysis Explanation</CardTitle>
                  <CardDescription className="text-cyan-200/60">Detailed reasoning behind the assessment</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-cyan-200/60">
                  {result.reason}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-cyan-600/30 bg-cyan-900/10 py-16">
            <div className="rounded-full bg-cyan-900/40 p-4">
              <Play className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-cyan-200">No Analysis Results</h3>
            <p className="mt-2 text-center text-sm text-cyan-200/60">
              Click the &quot;Run Analysis&quot; button above to generate<br />
              insights based on current patient and resource data.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
