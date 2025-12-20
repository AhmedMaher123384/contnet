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
    '--section-text': colors.text || 'var(--color-text)'
  }
  const items = Array.isArray(section.items) ? section.items : []
  return (
    <section id="highlights" className="highlights section" style={style}>
      <div className="container">
        <h2 style={{ color: 'var(--section-text)' }}>{t(section.heading)}</h2>
        <div className="grid">
          {items.map((it, i) => (
            <div key={i} className="card">
              <h3 style={{ color: 'var(--section-text)' }}>{t(it.title)}</h3>
              <p className="muted" style={{ color: 'var(--section-text)' }}>{t(it.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}