import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Industries() {
  const { config, t } = useConfig()
  const section = config?.sections?.industries
  if (!section?.enabled) return null
  const colors = section.colors || {}
  const style = {
    '--section-primary': colors.primary || 'var(--color-primary)',
    '--section-secondary': colors.secondary || 'var(--color-secondary)',
    '--section-bg': colors.background || 'var(--color-bg)',
    '--section-text': colors.text || 'var(--color-text)',
    '--section-body': colors.body || colors.text || 'var(--color-text)',
    '--section-heading': colors.heading || 'var(--section-body)'
  }
  const items = Array.isArray(section.items) ? section.items : []
  return (
    <section id="industries" className="industries section" style={style}>
      <div className="container">
        {section.heading && <h2 className="section-title" style={{ color: 'var(--section-heading)' }}>{t(section.heading)}</h2>}
        <div className="industries-grid">
          {items.map((it, i) => (
            <div key={i} className="industry-card">
              <div className="industry-title" style={{ color: 'var(--section-body)' }}>{t(it.title)}</div>
              <div className="industry-tagline" style={{ color: 'var(--section-body)' }}>{t(it.tagline)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}