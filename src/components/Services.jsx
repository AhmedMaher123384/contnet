import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Services() {
  const { config, t } = useConfig()
  const services = config?.sections?.services
  if (!services?.enabled) return null
  const colors = services.colors || {}
  const style = {
    '--section-primary': colors.primary || 'var(--color-primary)',
    '--section-secondary': colors.secondary || 'var(--color-secondary)',
    '--section-bg': colors.background || 'var(--color-bg)',
    '--section-text': colors.text || 'var(--color-text)',
    '--section-body': colors.body || colors.text || 'var(--color-text)',
    '--section-heading': colors.heading || 'var(--section-body)'
  }
  return (
    <section id="services" className="services section" style={style}>
      <div className="container">
        <h2 style={{ color: 'var(--section-heading)' }}>{t(services.heading)}</h2>
        <div className="grid">
          {(services.items || []).map((svc, i) => (
            <div className="service-card" key={i}>
              {svc.image ? (
                <img src={svc.image} alt={t(svc.title)} className="service-image" loading="lazy" />
              ) : null}
              <h3 style={{ color: 'var(--section-body)' }}>{t(svc.title)}</h3>
              <p className="muted" style={{ color: 'var(--section-body)' }}>{t(svc.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}