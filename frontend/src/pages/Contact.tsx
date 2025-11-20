import { useI18n } from '../i18n'

export default function Contact(){
  const { t } = useI18n()
  return (
    <div className="card" style={{marginTop:12}}>
      <div className="card-title">{t('contact.title')}</div>
      <div className="card-sub">{t('contact.sub')}</div>
      <p><strong>{t('contact.supportEmail')}:</strong> support@smarthub.local</p>
      <p><strong>{t('contact.partnerEmail')}:</strong> partners@smarthub.local</p>
      <p><strong>{t('contact.phone')}:</strong> +91-99999-00000</p>
      <p><strong>{t('contact.hours')}:</strong> {t('contact.hoursValue')}</p>
      <p>{t('contact.tip')}</p>
      <p>{t('contact.safety')}</p>
    </div>
  )
}
