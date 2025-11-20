import { Link } from 'react-router-dom'
import { useRef, useMemo } from 'react'

const categoryThumbs: Record<string, string[]> = {
  Cleaning: [
    'https://sp.yimg.com/ib/th/id/OIP.Zld2pr2QHA8LVEyU-uckJAHaLG?pid=Api&w=148&h=148&c=7&dpr=2&rs=1',
    'https://sp.yimg.com/ib/th/id/OIP.Rx6sf1uk9qaYk_icirLx9AHaE8?pid=Api&w=148&h=148&c=7&dpr=2&rs=1',
    'https://up.yimg.com/ib/th/id/OIP.LmQt_RYltDGNiSXmc4bzwgHaFK?pid=Api&rs=1&c=1&qlt=95&w=140&h=97',
    'https://tse2.mm.bing.net/th/id/OIP.crsaU19KbAYq0bxL1vf_ewHaE7?pid=Api&P=0&h=180',
    'https://tse1.mm.bing.net/th/id/OIP.O9jHqfR5O49kMSzhZr7CLAHaHa?pid=Api&P=0&h=180',
  ],
  Plumber: [
    'https://sp.yimg.com/ib/th/id/OIP.eH8M5_H93ahhGxcdlPz4RwHaHa?pid=Api&w=148&h=148&c=7&dpr=2&rs=1',
    'https://tse3.mm.bing.net/th/id/OIP.TFoiCUkvsSBgrpHDnOeSJgHaE8?pid=Api&P=0&h=180',
    'https://tse2.mm.bing.net/th/id/OIP.rrS1D2mztOgAeFiLX3n1LQHaE8?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.ZyJ8j1MuGqad-1Ir0Fd4cwHaE8?pid=Api&P=0&h=180',
    'https://tse1.mm.bing.net/th/id/OIP.KUAsmNfV85UItUpT4yppeAHaHa?pid=Api&P=0&h=180',
  ],
  Electrician: [
    'https://tse4.mm.bing.net/th/id/OIP.xA2jVA8gX4LP2ZtK-_8ldQHaHg?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.P-CBQcugdiw56W98TaWROAHaFb?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.PpKmMd-2LrLROWliZrDOmgHaHa?pid=Api&P=0&h=180',
    'https://tse1.mm.bing.net/th/id/OIP.YD5UUBp7vXF1G9HDg9BTswHaE8?pid=Api&P=0&h=180',
    'https://tse4.mm.bing.net/th/id/OIP.m5keiSbkHU176I74w32CNgHaEK?pid=Api&P=0&h=180',
  ],
  'Appliance Repair': [
    'https://tse3.mm.bing.net/th/id/OIP.W517xMRMxRron8z4V1t_3gHaDt?pid=Api&P=0&h=180',
    'https://tse2.mm.bing.net/th/id/OIP.3HALTKXvpgUS5rdLkjL5HQHaFF?pid=Api&P=0&h=180',
    'https://tse4.mm.bing.net/th/id/OIP.iyIPQP1FYHe1pW3u8SpDpgHaE6?pid=Api&P=0&h=180',
  ],
  'AC Repair': [
    'https://tse3.mm.bing.net/th/id/OIP.bdYYZzbqEycb-IqbM-yHFQHaE7?pid=Api&P=0&h=180',
    'https://tse1.mm.bing.net/th/id/OIP.csoDSm5p9IpPi6h5UjUTdAHaE7?pid=Api&P=0&h=180',
    'https://tse2.mm.bing.net/th/id/OIP.OQQkbze_GXpPs6Yf8m-xnwHaEK?pid=Api&P=0&h=180',
  ],
  Mechanic: [
    'https://tse1.mm.bing.net/th/id/OIP.QVlOHiBbbl8btUaH4GMoawHaEx?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.4QopavoDcL4KOI4ZhctuOwHaE8?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.O6vhXxqGApIO1hedy93aWgHaFc?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.Sk-5KHXtN0wnHZDLsNueuwHaEK?pid=Api&P=0&h=180',
  ],
  Tutor: [
    'https://tse3.mm.bing.net/th/id/OIP._5PioL9KFA_EL_gxsiYKYQHaEK?pid=Api&P=0&h=180',
    'https://tse4.mm.bing.net/th/id/OIP.agGP9Nbak9NwHMG87KQe1QHaFh?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.l6x85lzVJkDrG6Jh4KSlVwHaGN?pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th/id/OIP.k6DF5Z1mj8U4NfIlq_QnhQHaE8?pid=Api&P=0&h=180',
  ],
}

type Props = { service: any }
export default function ServiceCard({ service }: Props) {
  const baseThumb = (service.thumbnail as string | undefined) || ''
  const category = (service.category as string | undefined) || ''
  const pool = categoryThumbs[category] || []
  const fallback = !baseThumb && pool.length
    ? pool[Math.abs(String(service.id || '').split('').reduce((s, ch) => s + ch.charCodeAt(0), 0)) % pool.length]
    : ''
  const thumb = baseThumb || fallback
  const apiBase = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000'
  const isExternal = /^https?:\/\//i.test(thumb)
  const proxied = isExternal ? `${apiBase}/api/proxy?url=${encodeURIComponent(thumb)}` : thumb
  const img = proxied || '/images/placeholder-service.svg'
  const triedDirectRef = useRef(false)
  const onErr = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget
    if (isExternal && !triedDirectRef.current) {
      triedDirectRef.current = true
      el.src = thumb
      return
    }
    el.src = '/images/placeholder-service.svg'
  }

  const bio = useMemo(() => {
    if (service.description) return String(service.description)
    const cat = (service.category || '').toString().toLowerCase()
    if (cat.includes('clean')) return 'Deep cleaning by verified professionals. Includes dusting, mopping and basic sanitisation.'
    if (cat.includes('plumb')) return 'Leak, tap and pipe issues fixed with proper tools and original parts wherever possible.'
    if (cat.includes('electric')) return 'Fan, light, wiring and small appliance jobs handled with safety-first approach.'
    if (cat.includes('tutor')) return '1:1 concept-focused sessions with flexible timing and progress tracking.'
    if (cat.includes('ac')) return 'Cooling check, gas level check and basic service for better performance.'
    if (cat.includes('appliance')) return 'Diagnosis and repair for common home appliances with transparent pricing.'
    if (cat.includes('mechanic')) return 'Basic inspection and quick fixes so your vehicle stays road-ready.'
    return 'Service by a trusted local professional with transparent pricing.'
  }, [service.description, service.category])

  const etaLabel = useMemo(() => {
    const cat = (service.category || '').toString().toLowerCase()
    if (cat.includes('clean')) return 'Avg. duration: 2–3 hrs'
    if (cat.includes('plumb')) return 'Most jobs: 45–90 mins'
    if (cat.includes('electric')) return 'Most jobs: 30–60 mins'
    if (cat.includes('tutor')) return 'Typical session: 60 mins'
    if (cat.includes('ac')) return 'Service slot: ~90 mins'
    return 'Duration depends on issue size'
  }, [service.category])
  return (
    <div className="card service service-hover">
      {img && <img className="service-thumb" src={img} alt={service.title} onError={onErr} referrerPolicy="no-referrer" crossOrigin="anonymous" />}
      <div className="service-body">
        <div className="card-title">{service.title}</div>
        <div className="card-sub">{service.category}</div>
        <div style={{marginTop:4, fontSize:13}}>{bio}</div>
        <div style={{marginTop:6,fontSize:13}}>₹ {service.price}</div>
        {service.featured && <span className="chip chip-sm" style={{marginTop:6}}>Featured</span>}
      </div>
      <div className="service-cta">
        <Link to={`/book/${service.id}`} className="btn">Book Now</Link>
      </div>
      <div className="service-meta">
        <div className="service-meta-inner">
          <div className="card-title" style={{fontSize:14, marginBottom:4}}>Service details</div>
          <div className="card-sub" style={{fontSize:12}}>{bio}</div>
          <ul style={{marginTop:8, paddingLeft:18, fontSize:12}}>
            <li>{etaLabel}</li>
            <li>Verified provider, chat support inside app</li>
            <li>Track provider on live map once job starts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
