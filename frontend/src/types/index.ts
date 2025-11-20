// Advanced Application Types Export

// User & Auth Types
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

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Provider Types
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

// Booking Types
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

export interface BookingStep {
  step: number
  title: string
  description: string
  completed: boolean
}

// Payment Types
export interface Payment {
  id: string
  booking_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  method: 'card' | 'upi' | 'wallet' | 'bank_transfer'
  transaction_id?: string
  created_at: string
  updated_at: string
}

// Review Types
export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  provider_id: string
  rating: number
  comment: string
  photos?: string[]
  created_at: string
  updated_at: string
}

// Login History Types
export interface LoginHistory {
  id: string
  user_id: string
  device_type: string
  browser: string
  timestamp: string
  success: boolean
  error?: string
}

// Device Info Types
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
  timestamp: string
}

// Notification Types
export interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: Date
  duration?: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// Call Types
export interface CallState {
  isInCall: boolean
  isCalling: boolean
  callType: 'audio' | 'video' | null
  remoteUserId?: string
  callDuration: number
  isRecording: boolean
}

export interface CallControls {
  startCall: (type: 'audio' | 'video') => void
  endCall: () => void
  toggleMute: () => void
  toggleVideo: () => void
  toggleRecording: () => void
}

// Search Types
export interface SearchFilters {
  category?: string
  rating?: number
  priceRange?: [number, number]
  location?: string
  availability?: string
  sortBy?: 'rating' | 'price' | 'distance' | 'newest'
}

export interface SearchResult {
  id: string
  name: string
  category: string
  rating: number
  price: number
  distance?: number
  image?: string
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  accentColor: string
  fontFamily: string
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'phone' | 'number' | 'date' | 'select' | 'textarea'
  required: boolean
  validation?: (value: any) => boolean | string
  placeholder?: string
  options?: { label: string; value: any }[]
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
}

// Analytics Types
export interface AnalyticsEvent {
  name: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: Date
}

export interface UserAnalytics {
  totalBookings: number
  totalSpent: number
  averageRating: number
  lastActive: Date
  joinDate: Date
}
