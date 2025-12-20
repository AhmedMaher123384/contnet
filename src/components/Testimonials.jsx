import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Testimonials() {
  const { config, t } = useConfig()
  const section = config?.sections?.testimonials
  if (!section?.enabled) return null
  const items = Array.isArray(section.items) ? section.items : []
  const summary = Array.isArray(section.summary) ? section.summary : []
  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        {section.heading && <h2 className="section-title">{t(section.heading)}</h2>}
        {summary.length > 0 && (
          <div className="testimonials-summary">
            {summary.map((s, i) => (
              <div key={i} className="summary-item">
                <div className="summary-value">{s.value}</div>
                <div className="summary-label">{t(s.label)}</div>
              </div>
            ))}
          </div>
        )}
        <div className="testimonials-list">
          {items.map((tst, i) => (
            <blockquote key={i} className="testimonial">
              <p className="quote">{t(tst.quote)}</p>
              <footer className="meta">
                <strong>{tst.name}</strong>
                {' — '}
                <span>{t(tst.role)}</span>
                {' • '}
                <span>{t(tst.company)}</span>
                {' • '}
                <span>{t(tst.country)}</span>
                {tst.project && (
                  <span>{' • '}{t(tst.project)}</span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}