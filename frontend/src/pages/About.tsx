import { useI18n } from '../i18n'

export default function About(){
  const { t } = useI18n()
  return (
    <div className="card" style={{marginTop:12}}>
      <div className="card-title">{t('about.title')}</div>
      <div className="card-sub">{t('about.sub')}</div>
      <p>{t('about.p1')}</p>
      <ul>
        <li><strong>{t('about.li1').split(':')[0]}:</strong> {t('about.li1').split(':').slice(1).join(':').trim()}</li>
        <li><strong>{t('about.li2').split(':')[0]}:</strong> {t('about.li2').split(':').slice(1).join(':').trim()}</li>
        <li><strong>{t('about.li3').split(':')[0]}:</strong> {t('about.li3').split(':').slice(1).join(':').trim()}</li>
        <li><strong>{t('about.li4').split(':')[0]}:</strong> {t('about.li4').split(':').slice(1).join(':').trim()}</li>
        <li><strong>{t('about.li5').split(':')[0]}:</strong> {t('about.li5').split(':').slice(1).join(':').trim()}</li>
        <li><strong>{t('about.li6').split(':')[0]}:</strong> {t('about.li6').split(':').slice(1).join(':').trim()}</li>
      </ul>
      <p>{t('about.p2')}</p>
      <div style={{marginTop:16, display:'grid', gap:12}}>
        <div style={{borderTop:'1px solid #1f2937', paddingTop:12}}>
          <div style={{fontWeight:600, marginBottom:4}}>📲 {t('about.installTitle')}</div>
          <p style={{margin:0}}>{t('about.installP1')}</p>
        </div>
        <div style={{borderTop:'1px solid #1f2937', paddingTop:12}}>
          <div style={{fontWeight:600, marginBottom:4}}>🔗 {t('about.shareTitle')}</div>
          <p style={{margin:0}}>{t('about.shareP1')}</p>
        </div>
      </div>
    </div>
  )
}
