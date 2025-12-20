import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Metrics() {
  const { config, t } = useConfig()
  const section = config?.sections?.metrics
  if (!section?.enabled) return null
  const items = Array.isArray(section.items) ? section.items : []
  return (
    <section id="metrics" className="metrics">
      <div className="container">
        <div className="metrics-grid">
          {items.map((m, i) => (
            <div key={i} className="metric">
              <div className="metric-value">{m.value}</div>
              <div className="metric-label">{t(m.label)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}