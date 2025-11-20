import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
export const api = axios.create({ baseURL })

export const ServicesAPI = {
  list: (params: { q?: string; category?: string } = {}) => api.get('/api/services', { params }).then(r => r.data.services),
}

export const AIAPI = {
  recommend: (text: string) => api.post('/api/ai/recommend', { text }).then(r => r.data),
}

export const BookingsAPI = {
  create: (payload: any) => api.post('/api/bookings', payload).then(r => r.data.booking),
  track: (id: string) => api.get(`/api/bookings/${id}/track`).then(r => r.data),
  get: (id: string) => api.get(`/api/bookings/${id}`).then(r => r.data.booking),
  updateStatus: (id: string, payload: { status?: string; payment_status?: string; datetime?: string }) =>
    api.post(`/api/bookings/${id}/status`, payload).then(r => r.data.booking),
  updateLocation: (id: string, payload: { lat: number; lng: number }) =>
    api.post(`/api/bookings/${id}/location/update`, payload).then(r => r.data.location),
  updateCustomerLocation: (id: string, coords: { lat: number; lng: number }, pincode?: string, address?: string) =>
    api.post(`/api/bookings/${id}/customer-location/update`, { ...coords, pincode, address }).then(r => r.data.location),
}

export const PaymentsAPI = {
  create: (amount: number, opts?: { bookingId?: string; method?: string }) =>
    api.post('/api/payments/create', {
      amount,
      booking_id: opts?.bookingId,
      method: opts?.method,
    }).then(r => r.data),
  startStripe: (bookingId: string, amount: number, opts?: { successUrl?: string; cancelUrl?: string }) =>
    api.post('/api/payments/stripe/checkout', {
      booking_id: bookingId,
      amount,
      success_url: opts?.successUrl,
      cancel_url: opts?.cancelUrl,
    }).then(r => r.data as { id: string; url: string }),
  upiMock: (bookingId: string, amount: number, upiId: string) =>
    api.post('/api/payments/upi/mock', {
      booking_id: bookingId,
      amount,
      upi_id: upiId,
    }).then(r => r.data as { transaction: any; upi_link: string }),
}

export const SubscriptionsAPI = {
  plans: () => api.get('/api/subscriptions/plans').then(r => r.data.plans as any[]),
  subscribe: (providerId: string, planId: string) =>
    api.post('/api/subscriptions/subscribe', { provider_id: providerId, plan_id: planId }).then(r => r.data.provider),
}

export const AdminAPI = {
  fraudMetrics: () => api.get('/api/admin/fraud-metrics').then(r => r.data.metrics as any),
}

export const ProvidersAPI = {
  list: () => api.get('/api/providers').then(r => r.data.providers),
  bookings: (providerId: string) =>
    api.get(`/api/providers/${providerId}/bookings`).then(r => r.data as { bookings: any[]; stats: any }),
}

export const UsersAPI = {
  get: (id: string) => api.get(`/api/users/${id}`).then(r => r.data as { user: any; stats: any }),
  bookings: (id: string) => api.get(`/api/users/${id}/bookings`).then(r => r.data.bookings as any[]),
}

export const ChatsAPI = {
  list: (bookingId: string) =>
    api.get(`/api/bookings/${bookingId}/messages`).then(r => r.data.messages as any[]),
  send: (bookingId: string, text: string, sender: 'customer'|'provider' = 'customer', imageUrl?: string) =>
    api.post(`/api/bookings/${bookingId}/messages`, { text, sender, image_url: imageUrl }).then(r => r.data.message as any),
  recent: () =>
    api.get('/api/bookings/recent-chats').then(r => r.data.chats as any[]),
}

export const ReviewsAPI = {
  create: (bookingId: string, rating: number, comment: string, photos?: string[]) =>
    api.post('/api/reviews', { booking_id: bookingId, rating, comment, photos: photos || [] }).then(r => r.data.review as any),
  listForProvider: (providerId: string) =>
    api.get(`/api/providers/${providerId}/reviews`).then(r => r.data as { reviews: any[]; stats: { count: number; avg_rating: number } }),
}
