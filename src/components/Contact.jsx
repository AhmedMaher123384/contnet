import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'
import { getExternalLinkProps } from '../utils/links.js'

export default function Contact() {
  const { config, t } = useConfig()
  const contact = config?.sections?.contact
  if (!contact?.enabled) return null
  const colors = contact.colors || {}
  const style = {
    '--section-primary': colors.primary || 'var(--color-primary)',
    '--section-secondary': colors.secondary || 'var(--color-secondary)',
    '--section-bg': colors.background || 'var(--color-bg)',
    '--section-text': colors.text || 'var(--color-text)',
    '--section-body': colors.body || colors.text || 'var(--color-text)',
    '--section-heading': colors.heading || 'var(--section-body)'
  }
  const addrText = contact.address ? t(contact.address) : ''
  const hasAddress = !!addrText && addrText.trim().length > 0
  const gmapsLink = hasAddress ? `https://www.google.com/maps?q=${encodeURIComponent(addrText)}` : ''
  const wazeLink = hasAddress ? `https://waze.com/ul?q=${encodeURIComponent(addrText)}&navigate=yes` : ''
  const gmapsEmbed = hasAddress ? `${gmapsLink}&output=embed` : ''
  return (
    <section id="contact" className="contact section" style={style}>
      <div className="container">
        <h2 style={{ color: 'var(--section-heading)' }}>{t(contact.heading)}</h2>
        {contact.subheading ? (<p className="muted" style={{ color: 'var(--section-body)' }}>{t(contact.subheading)}</p>) : null}
        <div className="contact-grid">
          <div className="contact-card">
            {contact.email ? (
              <p className="contact-row">
                <span className="label">{t({ en: 'Email', ar: 'البريد الإلكتروني' })}:</span>{' '}
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            ) : null}
            {contact.phone ? (
              <p className="contact-row">
                <span className="label">{t({ en: 'Phone', ar: 'الهاتف' })}:</span>{' '}
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              </p>
            ) : null}
            {hasAddress ? (
              <p className="contact-row">
                <span className="label">{t({ en: 'Address', ar: 'العنوان' })}:</span>{' '}
                <span>{addrText}</span>
              </p>
            ) : null}

            <div className="contact-actions">
              {hasAddress ? (
                <a className="btn" href={gmapsLink} {...getExternalLinkProps(gmapsLink)}>
                  {t({ en: 'Open Google Maps', ar: 'فتح خرائط جوجل' })}
                </a>
              ) : null}
              {hasAddress ? (
                <a className="btn secondary" href={wazeLink} {...getExternalLinkProps(wazeLink)}>
                  {t({ en: 'Open Waze', ar: 'فتح ويز' })}
                </a>
              ) : null}
            </div>

            {(contact.links || []).length > 0 ? (
              <div className="contact-links">
                {(contact.links || []).map((l, i) => (
                  <a key={i} href={l.url} {...getExternalLinkProps(l.url)}>
                    {t(l.label)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="contact-card">
            <div className="title">
              <div className="contact-icon">📍</div>
              <div>{t({ en: 'Location', ar: 'الموقع' })}</div>
            </div>
            {hasAddress ? (<p className="contact-row"><span className="label">{t({ en: 'Address', ar: 'العنوان' })}:</span> <span>{addrText}</span></p>) : null}
            <div className="contact-actions">
              {hasAddress ? (<a className="btn" href={gmapsLink} {...getExternalLinkProps(gmapsLink)}>{t({ en: 'Google Maps', ar: 'خرائط جوجل' })}</a>) : null}
              {hasAddress ? (<a className="btn secondary" href={wazeLink} {...getExternalLinkProps(wazeLink)}>{t({ en: 'Waze', ar: 'ويز' })}</a>) : null}
            </div>
          </div>

          {(() => {
            const waItem = (contact.links || []).find(l => /wa\.me|whatsapp\.com/i.test(l.url || ''))
            if (!waItem) return null
            const waText = t(waItem.label) || t({ en: 'Quick WhatsApp', ar: 'تواصل سريع واتساب' })
            return (
              <div className="contact-cta-card">
                <div className="cta-content">
                  <div className="contact-icon">🟢</div>
                  <a className="btn" href={waItem.url} {...getExternalLinkProps(waItem.url)}>{waText}</a>
                </div>
              </div>
            )
          })()}

          {contact.hours ? (
            <div className="contact-card">
              <div className="title">
                <div className="contact-icon">⏰</div>
                <div>{t({ en: 'Working Hours', ar: 'ساعات العمل' })}</div>
              </div>
              <p className="contact-row"><span>{t(contact.hours)}</span></p>
            </div>
          ) : null}
        </div>
        {hasAddress ? (
          <div className="map-embed">
            <iframe
              title={t({ en: 'Location Map', ar: 'خريطة الموقع' })}
              src={gmapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}