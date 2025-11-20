const getEnv = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] as string | undefined
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback
    throw new Error(`Missing env ${key}`)
  }
  return value
}

export const API_BASE_URL = getEnv('VITE_API_BASE_URL', '/api/v1')
export const ACTIVE_ELECTION_ID = Number(getEnv('VITE_ELECTION_ID', '1'))
