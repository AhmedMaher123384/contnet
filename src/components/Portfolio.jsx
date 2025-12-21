import React, { useMemo, useState } from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Portfolio() {
  const { config, t } = useConfig()
  const section = config?.sections?.portfolio
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
  const filters = Array.isArray(section.filters) ? section.filters : []
  const items = Array.isArray(section.items) ? section.items : []
  const [active, setActive] = useState('all')
  const visible = useMemo(() => {
    if (active === 'all') return items
    return items.filter(p => p.category === active)
  }, [items, active])
  return (
    <section id="portfolio" className="portfolio section" style={style}>
      <div className="container">
        {section.heading && <h2 className="section-title" style={{ color: 'var(--section-heading)' }}>{t(section.heading)}</h2>}
        {filters.length > 0 && (
          <div className="filters">
            {filters.map((f, i) => (
              <button
                key={i}
                className={`filter-btn${active === f.value ? ' active' : ''}`}
                onClick={() => setActive(f.value)}
              >
                {t(f.label)}
              </button>
            ))}
          </div>
        )}
        <div className="portfolio-grid">
          {visible.map((p, i) => (
            <div key={i} className="portfolio-card">
              <div className="portfolio-title" style={{ color: 'var(--section-body)' }}>{t(p.title)}</div>
              <div className="portfolio-desc" style={{ color: 'var(--section-body)' }}>{t(p.description)}</div>
              {p.metrics && (
                <div className="portfolio-metrics">
                  {p.metrics.clients && <span>👥 {p.metrics.clients}</span>}
                  {p.metrics.revenue && <span>💶 {p.metrics.revenue}</span>}
                  {p.metrics.satisfaction && <span>⭐ {p.metrics.satisfaction}</span>}
                  {p.metrics.duration && <span>⏱ {p.metrics.duration}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}