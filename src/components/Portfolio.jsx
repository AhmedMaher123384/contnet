import React, { useMemo, useState } from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Portfolio() {
  const { config, t } = useConfig()
  const section = config?.sections?.portfolio
  if (!section?.enabled) return null
  const filters = Array.isArray(section.filters) ? section.filters : []
  const items = Array.isArray(section.items) ? section.items : []
  const [active, setActive] = useState('all')
  const visible = useMemo(() => {
    if (active === 'all') return items
    return items.filter(p => p.category === active)
  }, [items, active])
  return (
    <section id="portfolio" className="portfolio">
      <div className="container">
        {section.heading && <h2 className="section-title">{t(section.heading)}</h2>}
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
              <div className="portfolio-title">{t(p.title)}</div>
              <div className="portfolio-desc">{t(p.description)}</div>
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