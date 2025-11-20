import { useI18n } from '../i18n'

export default function Terms(){
  const { t } = useI18n()
  return (
    <div className="card" style={{marginTop:12}}>
      <div className="card-title">{t('terms.title')}</div>
      <ul>
        <li>{t('terms.li1')}</li>
        <li>{t('terms.li2')}</li>
        <li>{t('terms.li3')}</li>
        <li>{t('terms.li4')}</li>
        <li>{t('terms.li5')}</li>
        <li>{t('terms.li6')}</li>
        <li>{t('terms.li7')}</li>
        <li>{t('terms.li8')}</li>
      </ul>
      <p>{t('terms.p1')}</p>
    </div>
  )
}
