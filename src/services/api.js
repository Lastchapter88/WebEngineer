import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API functions
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health')
    return response.data
  },

  // Get all presets
  async getPresets() {
    const response = await api.get('/presets')
    return response.data
  },

  // Get specific preset info
  async getPresetInfo(presetName) {
    const response = await api.get(`/presets/${presetName}`)
    return response.data
  },

  // Upload track
  async uploadTrack(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload/track', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload reference
  async uploadReference(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload/reference', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Master track
  async masterTrack(fileId, preset, referenceFileId = null) {
    const response = await api.post('/master', {
      file_id: fileId,
      preset: preset,
      reference_file_id: referenceFileId,
    })
    return response.data
  },

  // Check job status
  async getJobStatus(jobId) {
    const response = await api.get(`/master/${jobId}/status`)
    return response.data
  },

  // Get download URL
  getDownloadUrl(jobId) {
    return `${API_BASE_URL}/download/${jobId}` 
  },
}

export default api
