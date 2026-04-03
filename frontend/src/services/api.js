import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

export const patientApi = {
  getAll: () => api.get("/patients"),
  create: (payload) => api.post("/patients", payload),
  update: (patientId, payload) => api.put(`/patients/${patientId}`, payload),
  discharge: (patientId) => api.post(`/patients/${patientId}/discharge`),
  delete: (patientId) => api.delete(`/patients/${patientId}`),
}

export const resourceApi = {
  get: () => api.get("/resources"),
  upsert: (payload) => api.post("/resources", payload),
}

export const analysisApi = {
  run: () => api.post("/analyze"),
}

export const historyApi = {
  list: (limit = 50) => api.get(`/analysis-history?limit=${limit}`),
}

export const agentsApi = {
  // Main agent operations
  runAll: () => api.post("/agents/run-all"),
  runMonitoring: () => api.post("/agents/monitoring"),
  runClinicalSupport: () => api.post("/agents/clinical-support"),
  runResourceOptimization: () => api.post("/agents/resource-optimization"),
  runPredictiveRisk: () => api.post("/agents/predictive-risk"),
  runEscalation: () => api.post("/agents/escalation"),
  generateAnalytics: () => api.post("/agents/analytics-snapshot"),
  
  // Alerts
  getAlerts: (limit = 10) => api.get(`/agents/alerts?limit=${limit}`),
  resolveAlert: (alertId) => api.post(`/agents/alerts/${alertId}/resolve`),
  
  // Recommendations
  getRecommendations: (limit = 10) => api.get(`/agents/recommendations?limit=${limit}`),
  implementRecommendation: (recId) => api.post(`/agents/recommendations/${recId}/implement`),
  
  // Risk scores
  getRiskScore: (patientId) => api.get(`/agents/risk-scores/${patientId}`),
  
  // Escalations
  getEscalations: () => api.get("/agents/escalations"),
  approveEscalation: (escalationId) => api.post(`/agents/escalations/${escalationId}/approve`),
}

export default api
