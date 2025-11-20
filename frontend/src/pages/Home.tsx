import { useState } from 'react'
import { AIAPI, ServicesAPI } from '@/api/client'
import ServiceCard from '@/components/ServiceCard'
import { useI18n } from '@/i18n'

export default function Home() {
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [aiText, setAiText] = useState('')
  const [recommend, setRecommend] = useState<any|null>(null)
  const [services, setServices] = useState<any[]>([])
  const cats = ['Cleaning','Plumber','Electrician','Appliance Repair','AC Repair','Mechanic','Tutor']

  async function search() {
    const res = await ServicesAPI.list({ q })
    setServices(res)
  }
  async function ai() {
    const res = await AIAPI.recommend(aiText || q)
    setRecommend(res)
  }

  return (
    <div>
      <section className="hero">
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
        <div className="grid">
          <div>
            <input className="input" placeholder={t('home.searchPlaceholder')} value={q} onChange={e=>setQ(e.target.value)} />
            <div style={{marginTop:8}}>
              <button className="btn" onClick={search}>{t('home.searchBtn')}</button>
            </div>
          </div>
          <div>
            <input className="input" placeholder={t('home.aiPlaceholder')} value={aiText} onChange={e=>setAiText(e.target.value)} />
            <div style={{marginTop:8}}>
              <button className="btn" onClick={ai}>{t('home.aiBtn')}</button>
            </div>
          </div>
        </div>
        <div className="chips">
          {cats.map(c => (
            <button key={c} className="chip" onClick={()=>{ setQ(c); ServicesAPI.list({ q: c }).then(setServices) }}>{c}</button>
          ))}
        </div>
      </section>

      {recommend && (
        <div className="card" style={{marginTop:12}}>
          <div className="card-title">{t('home.aiSuggestions')}</div>
          <div>Categories: {recommend.categories.join(', ')}</div>
          <div>{t('home.topProviders')}</div>
          {recommend.providers.map((p:any)=> (
            <div key={p.id}>• {p.name} — {p.rating} ★ — {p.reason}</div>
          ))}
          <div style={{color:'#64748b', marginTop:6}}>{recommend.reason}</div>
        </div>
      )}

      <div style={{marginTop:16}}>
        {services.map(s => <ServiceCard key={s.id} service={s} />)}
      </div>
    </div>
  )
}
