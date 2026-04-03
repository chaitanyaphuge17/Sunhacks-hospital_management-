declare module "@/services/api" {
  export const patientApi: {
    getAll: () => Promise<{ data: any[] }>
    create: (payload: {
      name: string
      age: number
      disease: string
      severity: "low" | "medium" | "high"
      icu_required: boolean
      status: "admitted" | "discharged"
    }) => Promise<{ data: any }>
    update: (patientId: string, payload: any) => Promise<{ data: any }>
    discharge: (patientId: string) => Promise<{ data: any }>
    delete: (patientId: string) => Promise<{ data: any }>
  }

  export const analysisApi: {
    run: () => Promise<{ data: any }>
  }

  export const resourceApi: {
    get: () => Promise<{ data: any }>
    upsert: (payload: { icu_beds: number; doctors_available: number }) => Promise<{ data: any }>
  }

  export const historyApi: {
    list: (limit?: number) => Promise<{ data: any[] }>
  }

  export const agentsApi: {
    runAll: () => Promise<{ data: any }>
    runMonitoring: () => Promise<{ data: any }>
    runClinicalSupport: () => Promise<{ data: any }>
    runResourceOptimization: () => Promise<{ data: any }>
    runPredictiveRisk: () => Promise<{ data: any }>
    runEscalation: () => Promise<{ data: any }>
    generateAnalytics: () => Promise<{ data: any }>
    getAlerts: (limit?: number) => Promise<{ data: any[] }>
    resolveAlert: (alertId: string) => Promise<{ data: any }>
    getRecommendations: (limit?: number) => Promise<{ data: any[] }>
    implementRecommendation: (recId: string) => Promise<{ data: any }>
    getRiskScore: (patientId: string) => Promise<{ data: any }>
    getEscalations: () => Promise<{ data: any[] }>
    approveEscalation: (escalationId: string) => Promise<{ data: any }>
  }
}
