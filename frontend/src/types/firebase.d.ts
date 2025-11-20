// Advanced Firebase Type Definitions
declare module 'firebase/app' {
  export interface FirebaseApp {}
  export function initializeApp(options: any): FirebaseApp
  export function getApps(): FirebaseApp[]
  export function getApp(): FirebaseApp
}

declare module 'firebase/database' {
  export interface Database {}
  export function getDatabase(app: any): Database
  export function ref(db: Database, path?: string): any
  export function onValue(
    r: any,
    cb: (snap: any) => void,
    onError?: (err: any) => void,
    options?: any
  ): () => void
  export function push(r: any, value?: any): Promise<any>
  export function set(r: any, value: any): Promise<void>
}

// Application Types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'customer' | 'provider' | 'owner'
  avatar?: string
  firebase_uid?: string
  created_at?: string
  updated_at?: string
}

export interface Provider {
  id: string
  name: string
  email: string
  phone: string
  categories: string[]
  rating: number
  review_count: number
  response_time: string
  completion_rate: number
  profile_pic?: string
  bio?: string
  verified: boolean
  active: boolean
}

export interface Booking {
  id: string
  user_id: string
  provider_id: string
  service_type: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  date: string
  time: string
  address: string
  notes?: string
  price: number
  created_at: string
  updated_at: string
}

export interface LoginHistory {
  id: string
  user_id: string
  device_type: string
  browser: string
  timestamp: string
  success: boolean
  error?: string
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
  timestamp: string
}
