import { useEffect, useMemo, useState } from "react"
import { Users, AlertTriangle, BedDouble, Bell, Plus, Minus } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resourceApi, patientApi } from "@/services/api"

interface Patient {
  _id: string
  name: string
  disease: string
  severity: "low" | "medium" | "high"
  icu_required: boolean
  status: "admitted" | "discharged"
}

interface Resource {
  _id?: string
  icu_beds: number
  doctors_available: number
}

export function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [resources, setResources] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ icu_beds: "0", doctors_available: "0" })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError("")
      try {
        const [patientsResponse, resourcesResponse] = await Promise.allSettled([
          patientApi.getAll(),
          resourceApi.get(),
        ])

        if (patientsResponse.status === "fulfilled") {
          setPatients(patientsResponse.value.data)
        }
        if (resourcesResponse.status === "fulfilled") {
          setResources(resourcesResponse.value.data)
          setForm({
            icu_beds: String(resourcesResponse.value.data.icu_beds ?? 0),
            doctors_available: String(resourcesResponse.value.data.doctors_available ?? 0),
          })
        }
        if (patientsResponse.status === "rejected") {
          setError("Failed to load patient data.")
        }
      } catch {
        setError("Unable to load dashboard data.")
      } finally {
        setIsLoading(false)
      }
    }
    void loadData()
  }, [])

  const admitted = patients.filter((p) => p.status === "admitted")
  const critical = admitted.filter((p) => p.severity === "high" || p.icu_required)
  const icuNeed = admitted.filter((p) => p.icu_required).length
  const stats = useMemo(
    () => [
      {
        title: "Total Patients",
        value: String(patients.length),
        change: `${admitted.length} currently admitted`,
        icon: Users,
        iconColor: "text-blue-400",
        bgColor: "bg-blue-400/10",
      },
      {
        title: "Critical Patients",
        value: String(critical.length),
        change: "Requires attention",
        icon: AlertTriangle,
        iconColor: "text-red-400",
        bgColor: "bg-red-400/10",
        critical: critical.length > 0,
      },
      {
        title: "ICU Availability",
        value: `${resources?.icu_beds ?? 0}`,
        change: `${icuNeed} ICU required currently`,
        icon: BedDouble,
        iconColor: "text-amber-400",
        bgColor: "bg-amber-400/10",
      },
      {
        title: "Doctors Available",
        value: String(resources?.doctors_available ?? 0),
        change: "Current staffing",
        icon: Bell,
        iconColor: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
      },
    ],
    [patients.length, admitted.length, critical.length, resources?.icu_beds, resources?.doctors_available, icuNeed]
  )

  const recentAlerts = critical.slice(0, 5).map((patient, index) => ({
    id: patient._id,
    patient: patient.name,
    type: patient.severity === "high" ? "Critical" : "Warning",
    message: `${patient.disease ?? "Condition"} requires monitoring`,
    time: `Priority ${index + 1}`,
  }))

  const saveResources = async () => {
    setIsSaving(true)
    setError("")
    try {
      const response = await resourceApi.upsert({
        icu_beds: Number(form.icu_beds),
        doctors_available: Number(form.doctors_available),
      })
      setResources(response.data)
    } catch {
      setError("Failed to save resource settings.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddICUBeds = (count: number) => {
    setForm((prev) => ({
      ...prev,
      icu_beds: String(Math.max(0, Number(prev.icu_beds) + count)),
    }))
  }

  const handleAddDoctors = (count: number) => {
    setForm((prev) => ({
      ...prev,
      doctors_available: String(Math.max(0, Number(prev.doctors_available) + count)),
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-slate-950">
      <Navbar title="Dashboard" />
      <div className="p-8 space-y-8">
        {error && <p className="mb-4 p-4 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/30">{error}</p>}
        {isLoading && <p className="mb-4 p-4 text-sm text-cyan-300 bg-cyan-500/10 rounded-lg border border-cyan-500/30">Loading dashboard...</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className={`border-l-4 shadow-lg hover:shadow-xl transition-shadow bg-cyan-900/30 backdrop-blur border-cyan-600/30 ${stat.critical ? "border-l-red-500" : "border-l-cyan-500"}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-cyan-200">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-3 ${stat.bgColor} shadow-md`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <p className={`text-xs mt-2 font-medium ${stat.critical ? "text-red-400" : "text-cyan-200/60"}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
            <CardHeader>
              <CardTitle className="text-cyan-200">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between rounded-lg border border-cyan-600/30 bg-cyan-900/20 p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{alert.patient}</span>
                        <Badge
                          variant={
                            alert.type === "Critical"
                              ? "destructive"
                              : alert.type === "Warning"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-cyan-200/60">{alert.message}</p>
                    </div>
                    <span className="text-xs text-cyan-200/50 whitespace-nowrap">
                      {alert.time}
                    </span>
                  </div>
                ))}
                {recentAlerts.length === 0 && (
                  <p className="text-sm text-cyan-200/50">No critical alerts right now.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cyan-900/30 backdrop-blur border-cyan-600/30">
            <CardHeader>
              <CardTitle className="text-cyan-200">Resource Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-200">
                    ICU Beds: <span className="text-lg font-bold">{form.icu_beds}</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.icu_beds}
                    onChange={(e) => setForm((prev) => ({ ...prev, icu_beds: e.target.value }))}
                    className="mb-2"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddICUBeds(1)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> +1
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddICUBeds(5)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> +5
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddICUBeds(10)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> +10
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddICUBeds(-1)}
                    >
                      <Minus className="h-4 w-4 mr-1" /> -1
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Doctors Available: <span className="text-lg font-bold">{form.doctors_available}</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.doctors_available}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, doctors_available: e.target.value }))
                    }
                    className="mb-2"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddDoctors(1)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> +1
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddDoctors(5)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> +5
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddDoctors(-1)}
                    >
                      <Minus className="h-4 w-4 mr-1" /> -1
                    </Button>
                  </div>
                </div>

                <Button onClick={saveResources} disabled={isSaving} className="w-full">
                  {isSaving ? "Saving..." : "Save Resources"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
