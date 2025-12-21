import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Metrics() {
  const { config, t } = useConfig()
  const section = config?.sections?.metrics
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
    <section id="metrics" className="metrics" style={style}>
      <div className="container">
        <div className="metrics-grid">
          {items.map((m, i) => (
            <div key={i} className="metric">
              <div className="metric-value">{m.value}</div>
              <div className="metric-label" style={{ color: 'var(--section-body)' }}>{t(m.label)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}