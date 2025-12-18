import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Footer({ style }) {
  const { config, t } = useConfig()
  if (!config) return null

  const footer = (config.sections && config.sections.footer) || {}
  const title = t(config.site.title)

  const main = footer.main || { columns: [] }
  const bottom = footer.bottom || {}
  const bottomText = t(bottom.text || config.site.footerText)

  const contact = (config.sections && config.sections.contact) || {}
  const includeContact = footer.includeContact ?? true
  const contactEnabled = contact.enabled !== false
  const contactHeading = t(contact.heading || { en: 'Contact Us', ar: 'تواصل معنا' })
  const contactEmail = contact.email
  const contactPhone = contact.phone
  const contactAddress = t(contact.address || { en: '', ar: '' })
  const emailLink = (contact.links || []).find(l => (l.url || '').startsWith('mailto:'))?.url || (contactEmail ? `mailto:${contactEmail}` : '')
  const phoneLink = (contact.links || []).find(l => (l.url || '').startsWith('tel:'))?.url || (contactPhone ? `tel:${contactPhone.replace(/[^+\d]/g, '')}` : '')

  return (
    <footer className="site-footer" style={style}>
      <div className="container">
        {/* الجزء الرئيسي أعلى الشريط السفلي */}
        <div className="footer-main">
          <div className="footer-columns">
            {(main.columns || []).map((col, i) => (
              <div key={i} className="footer-col">
                {col.title && <div className="footer-col-title">{t(col.title)}</div>}
                <ul className="footer-links">
                  {(col.links || []).map((link, j) => (
                    <li key={j}><a href={link.href || '#'}>{t(link.label || { en: '', ar: '' })}</a></li>
                  ))}
                </ul>
              </div>
            ))}

            {includeContact && contactEnabled && (
              <div className="footer-col footer-contact">
                <div className="footer-col-title">{contactHeading}</div>
                <ul className="footer-contact-list">
                  {contactEmail && (
                    <li className="footer-contact-item">
                      <span className="label">Email:</span>
                      <a href={emailLink}>{contactEmail}</a>
                    </li>
                  )}
                  {contactPhone && (
                    <li className="footer-contact-item">
                      <span className="label">Phone:</span>
                      <a href={phoneLink}>{contactPhone}</a>
                    </li>
                  )}
                  {contactAddress && (
                    <li className="footer-contact-item">
                      <span className="label">Address:</span>
                      <span>{contactAddress}</span>
                    </li>
                  )}
                </ul>
                <div className="footer-cta">
                  {emailLink && <a className="cta" href={emailLink}>{t({ en: 'Email Us', ar: 'راسلنا' })}</a>}
                  {phoneLink && <a className="cta" href={phoneLink}>{t({ en: 'Call Us', ar: 'اتصل بنا' })}</a>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الشريط السفلي (حقوق النشر/نص قصير) */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {title} · {bottomText}</span>
        </div>
      </div>
    </footer>
  )
}