import { useEffect, useState } from "react"
import { Plus, Search, Trash2, LogOut, Heart, HeartOff } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { patientApi } from "@/services/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Patient {
  _id: string
  name: string
  age: number
  disease: string
  severity: "low" | "medium" | "high"
  icu_required: boolean
  status: "admitted" | "discharged"
}

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    disease: "",
    severity: "medium" as "low" | "medium" | "high",
    icu_required: false,
    status: "admitted" as "admitted" | "discharged",
  })

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await patientApi.getAll()
        setPatients(response.data)
      } catch {
        setError("Failed to load patients. Check backend connection.")
      } finally {
        setIsLoading(false)
      }
    }
    void fetchPatients()
  }, [])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.disease.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.disease) {
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      const response = await patientApi.create({
        name: newPatient.name,
        age: parseInt(newPatient.age, 10),
        disease: newPatient.disease,
        severity: newPatient.severity,
        icu_required: newPatient.icu_required,
        status: newPatient.status,
      })
      setPatients((prev) => [response.data, ...prev])
      setNewPatient({
        name: "",
        age: "",
        disease: "",
        severity: "medium",
        icu_required: false,
        status: "admitted",
      })
      setIsDialogOpen(false)
    } catch {
      setError("Failed to add patient. Please verify input and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDischargePatient = async (patientId: string) => {
    setActionInProgress(patientId)
    setError("")
    try {
      const response = await patientApi.discharge(patientId)
      setPatients((prev) =>
        prev.map((p) => (p._id === patientId ? response.data : p))
      )
    } catch {
      setError("Failed to discharge patient. Please try again.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDeletePatient = async (patientId: string) => {
    setActionInProgress(patientId)
    setError("")
    try {
      await patientApi.delete(patientId)
      setPatients((prev) => prev.filter((p) => p._id !== patientId))
    } catch {
      setError("Failed to delete patient. Please try again.")
    } finally {
      setActionInProgress(null)
      setSelectedPatientId(null)
    }
  }

  const handleMarkICURequired = async (patientId: string) => {
    setActionInProgress(patientId)
    setError("")
    try {
      const response = await patientApi.update(patientId, { icu_required: true })
      setPatients((prev) =>
        prev.map((p) => (p._id === patientId ? response.data : p))
      )
    } catch {
      setError("Failed to update patient ICU status. Please try again.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleRemoveICURequired = async (patientId: string) => {
    setActionInProgress(patientId)
    setError("")
    try {
      const response = await patientApi.update(patientId, { icu_required: false })
      setPatients((prev) =>
        prev.map((p) => (p._id === patientId ? response.data : p))
      )
    } catch {
      setError("Failed to update patient ICU status. Please try again.")
    } finally {
      setActionInProgress(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-slate-950">
      <Navbar title="Patients Management" />
      <div className="p-8 space-y-6">
        <Card className="border-0 shadow-lg bg-cyan-900/30 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-cyan-950 to-cyan-900 border-b border-cyan-600/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl text-cyan-200">Patient Registry</CardTitle>
                <p className="text-sm text-cyan-200/60 mt-1">Manage and monitor all patient records</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/50" />
                  <Input
                    placeholder="Search by name or diagnosis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:w-72 border-cyan-600/30 bg-cyan-900/30 text-white placeholder-cyan-400/30 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-cyan-950/40 border-cyan-600/30 backdrop-blur">
                    <DialogHeader>
                      <DialogTitle className="text-cyan-200">Add New Patient</DialogTitle>
                      <DialogDescription className="text-cyan-200/60">
                        Enter the patient details below to add them to the registry.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-cyan-200">Full Name</Label>
                        <Input
                          id="name"
                          value={newPatient.name}
                          onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                          placeholder="Enter patient name"
                          className="bg-cyan-900/30 border-cyan-600/30 text-white placeholder-cyan-400/30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="age" className="text-cyan-200">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={newPatient.age}
                            onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                            placeholder="Age"
                            className="bg-cyan-900/30 border-cyan-600/30 text-white placeholder-cyan-400/30"
                          />
                        </div>
                        <div className="grid gap-2" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="disease" className="text-cyan-200">Diagnosis</Label>
                        <Input
                          id="disease"
                          value={newPatient.disease}
                          onChange={(e) => setNewPatient({ ...newPatient, disease: e.target.value })}
                          placeholder="Enter diagnosis"
                          className="bg-cyan-900/30 border-cyan-600/30 text-white placeholder-cyan-400/30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="severity" className="text-cyan-200">Severity</Label>
                          <Select
                            value={newPatient.severity}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              setNewPatient({ ...newPatient, severity: value })
                            }
                          >
                            <SelectTrigger className="bg-cyan-900/30 border-cyan-600/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-cyan-900 border-cyan-600/30">
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="icu">ICU Required</Label>
                          <Select
                            value={newPatient.icu_required ? "yes" : "no"}
                            onValueChange={(value) =>
                              setNewPatient({ ...newPatient, icu_required: value === "yes" })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newPatient.status}
                          onValueChange={(value: "admitted" | "discharged") =>
                            setNewPatient({ ...newPatient, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admitted">Admitted</SelectItem>
                            <SelectItem value="discharged">Discharged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPatient} disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Patient"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
                {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/30">{error}</p>}
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-600/30 border-t-cyan-400"></div>
                <p className="mt-4 text-cyan-200/60">Loading patients...</p>
              </div>
            ) : (
            <div className="overflow-x-auto border border-cyan-600/30 rounded-lg bg-cyan-900/20">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-cyan-600/30 bg-cyan-900/40">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-200">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-200">Age</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-200">Diagnosis</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-200">Severity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-200">ICU</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-200">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient._id}
                      className="border-b border-cyan-600/20 hover:bg-cyan-900/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-white">{patient.name}</td>
                      <td className="px-6 py-4 text-sm text-cyan-200/60">{patient.age}</td>
                      <td className="px-6 py-4 text-sm text-cyan-200">{patient.disease}</td>
                      <td className="py-4">
                        <Badge
                          variant={
                            patient.severity === "high"
                              ? "destructive"
                              : patient.severity === "medium"
                              ? "warning"
                              : "success"
                          }
                        >
                          {patient.severity}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={patient.icu_required ? "destructive" : "secondary"}>
                          {patient.icu_required ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-cyan-200/60">{patient.status}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {patient.status === "admitted" && !patient.icu_required && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkICURequired(patient._id)}
                              disabled={actionInProgress === patient._id}
                              title="Mark as ICU required"
                              className="border-amber-500/50 hover:bg-amber-500/10"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          )}
                          {patient.status === "admitted" && patient.icu_required && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveICURequired(patient._id)}
                              disabled={actionInProgress === patient._id}
                              title="Remove ICU requirement"
                              className="border-green-500/50 hover:bg-green-500/10"
                            >
                              <HeartOff className="h-4 w-4" />
                            </Button>
                          )}
                          {patient.status === "admitted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDischargePatient(patient._id)}
                              disabled={actionInProgress === patient._id}
                              title="Discharge patient"
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedPatientId(patient._id)}
                                disabled={actionInProgress === patient._id}
                                title="Delete patient"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-cyan-950/40 border-cyan-600/30 backdrop-blur">
                              <DialogHeader>
                                <DialogTitle className="text-cyan-200">Delete Patient</DialogTitle>
                                <DialogDescription className="text-cyan-200/60">
                                  Are you sure you want to delete {patient.name}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedPatientId(null)} className="border-cyan-600/30 text-cyan-200 hover:bg-cyan-600/10">
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeletePatient(patient._id)}
                                  disabled={actionInProgress === patient._id}
                                >
                                  {actionInProgress === patient._id ? "Deleting..." : "Delete"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="py-8 text-center text-cyan-200/60">
                  No patients found matching your search.
                </div>
              )}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
