import { useEffect, useRef } from 'react'
import L from 'leaflet'

export type LatLng = { lat: number; lng: number }

type Props = {
  provider: LatLng
  user?: LatLng | null
  eta?: number | null
  distance?: number | null
  status?: string
}

export default function MapView({ provider, user, eta, distance, status }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<L.Map | null>(null)
  const providerMarkerRef = useRef<L.Marker | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

  // Create custom icons
  const getProviderIcon = () => {
    return L.divIcon({
      html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid white;">🚗</div>`,
      iconSize: [40, 40],
      className: 'provider-marker'
    })
  }

  const getUserIcon = () => {
    return L.divIcon({
      html: `<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid white;">📍</div>`,
      iconSize: [40, 40],
      className: 'user-marker'
    })
  }

  useEffect(() => {
    if (!mapRef.current) return
    if (!instanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [provider.lat, provider.lng],
        zoom: 14,
        zoomControl: true,
      })
      instanceRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)
    }
    const map = instanceRef.current
    if (!map) return

    const p = [provider.lat, provider.lng] as [number, number]
    if (!providerMarkerRef.current) {
      providerMarkerRef.current = L.marker(p, {
        icon: getProviderIcon(),
        title: 'Provider Location',
      }).addTo(map)
      
      // Add popup
      const popupContent = `
        <div style="font-size: 12px; color: #1f2937;">
          <strong>📍 Provider</strong><br/>
          Lat: ${provider.lat.toFixed(4)}<br/>
          Lng: ${provider.lng.toFixed(4)}<br/>
          ${status ? `Status: ${status}` : ''}
        </div>
      `
      providerMarkerRef.current.bindPopup(popupContent)
    } else {
      providerMarkerRef.current.setLatLng(p)
    }

    if (user && user.lat && user.lng) {
      const u = [user.lat, user.lng] as [number, number]
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(u, { 
          icon: getUserIcon(),
          title: 'Your Location' 
        }).addTo(map)
        
        // Add popup
        const userPopupContent = `
          <div style="font-size: 12px; color: #1f2937;">
            <strong>📍 Your Location</strong><br/>
            Lat: ${user.lat.toFixed(4)}<br/>
            Lng: ${user.lng.toFixed(4)}
          </div>
        `
        userMarkerRef.current.bindPopup(userPopupContent)
      } else {
        userMarkerRef.current.setLatLng(u)
      }
      
      if (!lineRef.current) {
        lineRef.current = L.polyline([p, u], { 
          color: '#667eea', 
          weight: 3, 
          opacity: 0.8,
          dashArray: '5, 5'
        }).addTo(map)
      } else {
        lineRef.current.setLatLngs([p, u])
      }
      
      // Add distance circle around user
      if (!circleRef.current && distance) {
        circleRef.current = L.circle(u, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          radius: distance * 1000 / 2 // Half of distance in meters
        }).addTo(map)
      } else if (circleRef.current && distance) {
        circleRef.current.setRadius(distance * 1000 / 2)
      }
      
      map.fitBounds([p, u], { padding: [50, 50] })
    } else {
      if (lineRef.current) {
        map.removeLayer(lineRef.current)
        lineRef.current = null
      }
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current)
        userMarkerRef.current = null
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current)
        circleRef.current = null
      }
      map.setView(p, 14)
    }
  }, [provider.lat, provider.lng, user?.lat, user?.lng, distance, status])

  return <div ref={mapRef} style={{width:'100%',height:'100%'}} />
}
