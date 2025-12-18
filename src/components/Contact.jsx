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
    '--section-text': colors.text || 'var(--color-text)'
  }
  return (
    <section id="contact" className="contact section" style={style}>
      <div className="container">
        <h2 style={{ color: 'var(--section-text)' }}>{t(contact.heading)}</h2>
        <div className="list">
          {contact.email ? <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p> : null}
          {contact.phone ? <p><strong>Phone:</strong> <a href={`tel:${contact.phone}`}>{contact.phone}</a></p> : null}
          {contact.address ? <p><strong>Address:</strong> {t(contact.address)}</p> : null}
          {(contact.links || []).map((l, i) => (
            <a key={i} href={l.url} {...getExternalLinkProps(l.url)}>{t(l.label)}</a>
          ))}
        </div>
      </div>
    </section>
  )
}