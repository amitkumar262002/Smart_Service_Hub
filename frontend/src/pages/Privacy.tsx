import { useI18n } from '../i18n'

export default function Privacy(){
  const { t } = useI18n()
  return (
    <div className="card" style={{marginTop:12}}>
      <div className="card-title">{t('privacy.title')}</div>
      <div className="card-sub">{t('privacy.sub')}</div>
      <ul>
        <li>{t('privacy.li1')}</li>
        <li>{t('privacy.li2')}</li>
        <li>{t('privacy.li3')}</li>
        <li>{t('privacy.li4')}</li>
        <li>{t('privacy.li5')}</li>
        <li>{t('privacy.li6')}</li>
      </ul>
      <p>{t('privacy.p1')}</p>
    </div>
  )
}
