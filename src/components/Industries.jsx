import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Industries() {
  const { config, t } = useConfig()
  const section = config?.sections?.industries
  if (!section?.enabled) return null
  const items = Array.isArray(section.items) ? section.items : []
  return (
    <section id="industries" className="industries">
      <div className="container">
        {section.heading && <h2 className="section-title">{t(section.heading)}</h2>}
        <div className="industries-grid">
          {items.map((it, i) => (
            <div key={i} className="industry-card">
              <div className="industry-title">{t(it.title)}</div>
              <div className="industry-tagline">{t(it.tagline)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}