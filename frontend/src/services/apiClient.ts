import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cricketverse-token')
  if (token && token !== 'demo-guest-session') {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    axios.isAxiosError<{ message?: unknown }>(error) &&
    typeof error.response?.data?.message === 'string'
  ) {
    return error.response.data.message
  }

  return fallback
}
