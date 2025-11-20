import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BookingsAPI } from '@/api/client'
import { db } from '@/firebase'
import { ref, push, set } from 'firebase/database'
import { getSessionUserId, getSessionUser } from '@/auth'
import { getAllStates, getCitiesForState, validateAndGetLocation } from '@/data/indiaLocations'

export default function BookingFlow() {
  const { serviceId } = useParams()
  const nav = useNavigate()
  const [dt, setDt] = useState('')
  const [address, setAddress] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [note, setNote] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1) // 1: date, 2: address, 3: review
  const [useCurrentAddress, setUseCurrentAddress] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [pincodeValid, setPincodeValid] = useState(false)
  const [pincodeError, setPincodeError] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState<string[]>([])

  useEffect(() => {
    const id = getSessionUserId()
    if (!id) {
      nav('/login')
      return
    }
    setUserId(id)
  }, [nav])

  // Validation functions
  const validateDate = () => {
    if (!dt) {
      setErrors({ ...errors, date: 'Please select a date and time' })
      return false
    }
    const selectedDate = new Date(dt)
    if (selectedDate < new Date()) {
      setErrors({ ...errors, date: 'Cannot book in the past' })
      return false
    }
    return true
  }

  const validateAddress = () => {
    const newErrors: Record<string, string> = {}
    if (!street.trim()) newErrors.street = 'Street is required'
    if (!city.trim()) newErrors.city = 'City is required'
    if (!state.trim()) newErrors.state = 'State is required'
    if (!pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(pincode)) newErrors.pincode = 'Invalid pincode (must be 6 digits)'
    else if (!pincodeValid) newErrors.pincode = 'Pincode not found in India'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }
    return true
  }

  // Handle pincode change and validation
  const handlePincodeChange = (value: string) => {
    setPincode(value)
    setPincodeError('')
    
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const location = validateAndGetLocation(value)
      if (location.valid && location.state && location.city) {
        setState(location.state)
        setCity(location.city)
        setPincodeValid(true)
        setPincodeError('')
      } else {
        setPincodeValid(false)
        setPincodeError('❌ Invalid pincode for India')
      }
    } else if (value.length > 0) {
      setPincodeValid(false)
    }
  }

  // Handle state change
  const handleStateChange = (newState: string) => {
    setState(newState)
    const cities = getCitiesForState(newState)
    setAvailableCities(cities)
    setCity('')
    setShowCitySuggestions(false)
  }

  // Handle city input change with autocomplete
  const handleCityChange = (value: string) => {
    setCity(value)
    setShowCitySuggestions(true)
    
    if (value.trim()) {
      // Filter cities based on input
      const filtered = availableCities.filter(c => 
        c.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredCities(filtered)
    } else {
      setFilteredCities(availableCities)
    }
  }

  // Handle city selection from suggestions
  const selectCity = (selectedCity: string) => {
    setCity(selectedCity)
    setShowCitySuggestions(false)
    setFilteredCities([])
  }

  const nextStep = () => {
    if (step === 1 && validateDate()) {
      setStep(2)
      setErrors({})
    } else if (step === 2 && validateAddress()) {
      setStep(3)
      setErrors({})
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  async function confirm() {
    if (!userId) {
      nav('/login')
      return
    }
    
    if (!validateDate() || !validateAddress()) {
      return
    }
    
    const fullAddress = `${street}, ${city}, ${state} ${pincode}`
    
    const payload = {
      user_id: userId,
      provider_id: 'p1', // demo stub
      service_id: serviceId,
      datetime: dt,
      address: fullAddress,
      street,
      city,
      state,
      pincode,
      note
    }

    setLoading(true)
    setError('')
    
    try {
      // write to backend
      const booking = await BookingsAPI.create(payload)

      // write to Firebase RTDB (mirror)
      try {
        const r = push(ref(db, 'bookings'))
        await set(r, { id: booking.id, status: 'pending', amount: 999, ...payload, createdAt: new Date().toISOString() })
      } catch (e) {
        // non-blocking: proceed even if Firebase write fails
        console.warn('Firebase write failed', e)
      }
      setSuccess('✅ Booking confirmed!')
      setTimeout(() => nav(`/pay/${booking.id}`), 1500)
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Failed to create booking. Make sure backend API is running.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', color: '#fff', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>📅 Advanced Booking</h1>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: '0' }}>Step {step} of 3 - {step === 1 ? 'Date & Time' : step === 2 ? 'Address Details' : 'Review & Confirm'}</p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', background: s <= step ? '#fff' : 'rgba(255,255,255,0.3)', borderRadius: '2px', transition: '0.3s' }}></div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: '30px' }}>
          {error && (
            <div style={{ background: '#fee2e2', border: '2px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#dcfce7', border: '2px solid #86efac', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
              ✅ {success}
            </div>
          )}

          {/* STEP 1: Date & Time */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#1f2937' }}>📅 Choose Date & Time</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>Pick a slot when you're available</p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={dt}
                  onChange={e => {
                    const value = e.target.value
                    setDt(value)
                    setErrors({})
                    
                    // Auto-validate and move to next step if valid
                    if (value) {
                      const selectedDate = new Date(value)
                      if (selectedDate > new Date()) {
                        // Valid date - auto advance after 500ms
                        setTimeout(() => {
                          setStep(2)
                          setErrors({})
                        }, 500)
                      }
                    }
                  }}
                  style={{ width: '100%', padding: '12px', border: errors.date ? '2px solid #dc2626' : dt ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: dt ? '#f0fdf4' : '#fff', transition: 'all 0.3s' }}
                />
                {errors.date && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>⚠️ {errors.date}</p>}
                {dt && !errors.date && <p style={{ color: '#16a34a', fontSize: '12px', margin: '4px 0 0 0' }}>✅ Date selected! Moving to next step...</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                <button 
                  onClick={() => { 
                    const now = new Date()
                    now.setHours(18,0,0,0)
                    const dateStr = now.toISOString().slice(0,16)
                    setDt(dateStr)
                    setErrors({})
                    // Auto advance
                    setTimeout(() => {
                      setStep(2)
                      setErrors({})
                    }, 500)
                  }} 
                  style={{ padding: '10px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.3s' }}
                  onMouseOver={e => { (e.target as HTMLElement).style.background = '#5568d3' }}
                  onMouseOut={e => { (e.target as HTMLElement).style.background = '#667eea' }}
                >
                  🌙 Today Evening
                </button>
                <button 
                  onClick={() => { 
                    const now = new Date()
                    now.setDate(now.getDate()+1)
                    now.setHours(9,0,0,0)
                    const dateStr = now.toISOString().slice(0,16)
                    setDt(dateStr)
                    setErrors({})
                    // Auto advance
                    setTimeout(() => {
                      setStep(2)
                      setErrors({})
                    }, 500)
                  }} 
                  style={{ padding: '10px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.3s' }}
                  onMouseOver={e => { (e.target as HTMLElement).style.background = '#7c3aed' }}
                  onMouseOut={e => { (e.target as HTMLElement).style.background = '#8b5cf6' }}
                >
                  🌅 Tomorrow Morning
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Address */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#1f2937' }}>📍 Service Address</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>Where should we provide the service?</p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Street Address *</label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                  style={{ width: '100%', padding: '12px', border: errors.street ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
                {errors.street && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>⚠️ {errors.street}</p>}
              </div>

              {/* State Dropdown */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>State (India) *</label>
                <select
                  value={state}
                  onChange={e => handleStateChange(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: errors.state ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="">Select a state...</option>
                  {getAllStates().map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>⚠️ {errors.state}</p>}
              </div>

              {/* City Input with Autocomplete */}
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>City *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={city}
                    onChange={e => handleCityChange(e.target.value)}
                    onFocus={() => state && setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    disabled={!state}
                    placeholder={state ? "Type city name..." : "Select state first"}
                    style={{ width: '100%', padding: '12px', border: errors.city ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#fff', opacity: state ? 1 : 0.5, cursor: state ? 'text' : 'not-allowed' }}
                  />
                  
                  {/* Autocomplete Suggestions */}
                  {showCitySuggestions && state && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      {filteredCities.length > 0 ? (
                        filteredCities.map(c => (
                          <div
                            key={c}
                            onClick={() => selectCity(c)}
                            style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '14px', color: city === c ? '#667eea' : '#1f2937', background: city === c ? '#f0f4ff' : '#fff', fontWeight: city === c ? '600' : '400', transition: 'all 0.2s' }}
                            onMouseOver={e => { (e.target as HTMLElement).style.background = '#f3f4f6' }}
                            onMouseOut={e => { (e.target as HTMLElement).style.background = city === c ? '#f0f4ff' : '#fff' }}
                          >
                            📍 {c}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '12px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
                          No cities found. Type to create custom city.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.city && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>⚠️ {errors.city}</p>}
                {city && !availableCities.includes(city) && (
                  <p style={{ color: '#f59e0b', fontSize: '12px', margin: '4px 0 0 0' }}>✏️ Custom city: "{city}"</p>
                )}
              </div>

              {/* Pincode Input with Validation */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Pincode (6 digits) *</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => handlePincodeChange(e.target.value.slice(0, 6))}
                  placeholder="201301"
                  maxLength={6}
                  style={{ width: '100%', padding: '12px', border: errors.pincode ? '2px solid #dc2626' : pincodeValid && pincode.length === 6 ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
                {pincodeError && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>⚠️ {pincodeError}</p>}
                {pincodeValid && pincode.length === 6 && <p style={{ color: '#16a34a', fontSize: '12px', margin: '4px 0 0 0' }}>✅ Valid pincode - {state}, {city}</p>}
                {errors.pincode && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>⚠️ {errors.pincode}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Additional Notes (Optional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Any special instructions for the provider..."
                  style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#1f2937' }}>✅ Review Booking</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>Please review your booking details</p>

              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>📅 Date & Time</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{new Date(dt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>📍 Address</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>{street}, {city}, {state} {pincode}</span>
                  </div>
                  {note && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>📝 Notes</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>{note}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            {step > 1 && (
              <button onClick={prevStep} disabled={loading} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#1f2937', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={nextStep} disabled={loading} style={{ flex: 1, padding: '12px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Next →
              </button>
            ) : (
              <button onClick={confirm} disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? '#ccc' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>
                {loading ? '⏳ Confirming...' : '✅ Confirm & Pay'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Old UI below (keeping for reference)
/*
      <div className="card" style={{maxWidth:480, margin:'12px auto'}}>
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '12px',
            fontSize: '12px'
          }}>
            ❌ {error}
          </div>
        )}
        <div className="card-title">Choose date & time</div>
        <div className="card-sub">Pick a slot when you&apos;re available. You can adjust later from My Bookings.</div>
        <div className="grid" style={{marginTop:8}}>
          <input
            className="input"
            type="datetime-local"
            value={dt}
            onChange={e=>setDt(e.target.value)}
          />
        </div>
        <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:8,fontSize:12}}>
          <button
            type="button"
            className="chip chip-sm"
            onClick={() => {
              const now = new Date()
              now.setHours(18,0,0,0)
              setDt(now.toISOString().slice(0,16))
            }}
          >
            Today evening
          </button>
          <button
            type="button"
            className="chip chip-sm"
            onClick={() => {
              const d = new Date()
              d.setDate(d.getDate()+1)
              d.setHours(10,0,0,0)
              setDt(d.toISOString().slice(0,16))
            }}
          >
            Tomorrow morning
          </button>
          <button
            type="button"
            className="chip chip-sm"
            onClick={() => setDt('')}
          >
            Clear
          </button>
        </div>
        <div className="grid" style={{marginTop:12}}>
          <input
            className="input"
            placeholder="Address (flat, street, city)"
            value={address}
            onChange={e=>setAddress(e.target.value)}
          />
          <input
            className="input"
            placeholder="Notes for provider (optional)"
            value={note}
            onChange={e=>setNote(e.target.value)}
          />
        </div>
        <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
          <button 
            className="btn" 
            onClick={confirm}
            disabled={loading}
            style={{opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
          >
            {loading ? '⏳ Processing...' : 'Confirm & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
*/
