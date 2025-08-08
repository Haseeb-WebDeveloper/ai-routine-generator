export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}
