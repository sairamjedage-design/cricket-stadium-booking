import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authService } from '../services/authService'
import { getApiErrorMessage } from '../services/apiClient'
import type { AuthResponse, AuthUser } from '../services/authService'

export type User = AuthUser

interface AuthState {
  user: User | null
  isLoading: boolean
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (isLoading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (
    name: string,
    email: string,
    password: string,
    photoDataUrl?: string,
    phone?: string,
  ) => Promise<void>
}

const saveSession = (set: (state: Partial<AuthState>) => void, response: AuthResponse) => {
  localStorage.setItem('cricketverse-token', response.token)
  set({ user: response.user, token: response.token, isLoading: false })
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        token: null,
        setUser: (user) => set({ user }),
        setToken: (token) => {
          if (token && token !== 'demo-guest-session') {
            localStorage.setItem('cricketverse-token', token)
          } else {
            localStorage.removeItem('cricketverse-token')
          }
          set({ token })
        },
        setLoading: (isLoading) => set({ isLoading }),
        login: async (email, password) => {
          set({ isLoading: true })
          try {
            const response = await authService.login({ email, password })
            saveSession(set, response)
          } catch (error) {
            set({ isLoading: false })
            throw new Error(getApiErrorMessage(error, 'Unable to sign in. Please try again.'))
          }
        },
        logout: () => {
          localStorage.removeItem('cricketverse-token')
          set({ user: null, token: null })
        },
        register: async (name, email, password, photoDataUrl, phone) => {
          set({ isLoading: true })
          try {
            const response = await authService.register({
              name,
              email,
              password,
              ...(photoDataUrl ? { photoDataUrl } : {}),
              ...(phone ? { phone } : {}),
            })
            saveSession(set, response)
          } catch (error) {
            set({ isLoading: false })
            throw new Error(getApiErrorMessage(error, 'Unable to create your account. Please try again.'))
          }
        }
      }),
      {
        name: 'auth-storage',
        version: 3,
        migrate: () => ({ user: null, isLoading: false, token: null }),
        partialize: (state) =>
          state.user?.id === 'guest'
            ? { user: null, token: null }
            : { user: state.user, token: state.token },
      }
    )
  )
)