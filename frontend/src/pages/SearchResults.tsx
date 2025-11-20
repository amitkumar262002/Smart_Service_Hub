import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ServicesAPI } from '@/api/client'
import ServiceCard from '@/components/ServiceCard'

export default function SearchResults() {
  const loc = useLocation()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [services, setServices] = useState<any[]>([])

  async function load() {
    const list = await ServicesAPI.list({ q, category })
    setServices(list)
  }

  useEffect(() => {
    const params = new URLSearchParams(loc.search)
    const qParam = params.get('q') || ''
    const catParam = params.get('category') || ''
    setQ(qParam)
    setCategory(catParam)
  }, [loc.search])

  useEffect(() => { load() }, [q, category])

  return (
    <div>
      <h2>Services</h2>
      <div className="grid">
        <input className="input" placeholder="Query" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option>Plumber</option>
          <option>Electrician</option>
          <option>Cleaning</option>
          <option>Mechanic</option>
          <option>Tutor</option>
          <option>Appliance Repair</option>
          <option>AC Repair</option>
        </select>
      </div>
      <div style={{marginTop:8}}>
        <button className="btn" onClick={load}>Apply Filters</button>
      </div>
      <div style={{marginTop:12}}>
        {services.map(s => <ServiceCard key={s.id} service={s} />)}
      </div>
    </div>
  )
}
