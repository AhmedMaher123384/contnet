import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Highlights() {
  const { config, t } = useConfig()
  const section = config?.sections?.highlights
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
    <section id="highlights" className="highlights section" style={style}>
      <div className="container">
        <h2 style={{ color: 'var(--section-heading)' }}>{t(section.heading)}</h2>
        <div className="grid">
          {items.map((it, i) => (
            <div key={i} className="card">
              <h3 style={{ color: 'var(--section-body)' }}>{t(it.title)}</h3>
              <p className="muted" style={{ color: 'var(--section-body)' }}>{t(it.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}