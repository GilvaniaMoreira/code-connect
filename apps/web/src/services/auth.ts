import { isAxiosError } from 'axios'
import { api } from '../lib/api'

export type LoginPayload = {
  email: string
  senha: string
}

export type RegisterPayload = {
  nome: string
  email: string
  senha: string
}

export type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type PublicUser = {
  id: string
  nome: string
  email: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload): Promise<PublicUser> {
  const { data } = await api.post<PublicUser>('/users', payload)
  return data
}

export async function getMe(): Promise<PublicUser> {
  const { data } = await api.get<PublicUser>('/users/me')
  return data
}

export function extractApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined
    const message = data?.message
    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === 'string') return message
  }
  return fallback
}
