import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Testimonials() {
  const { config, t } = useConfig()
  const section = config?.sections?.testimonials
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
  const summary = Array.isArray(section.summary) ? section.summary : []
  return (
    <section id="testimonials" className="testimonials section" style={style}>
      <div className="container">
        {section.heading && <h2 className="section-title" style={{ color: 'var(--section-heading)' }}>{t(section.heading)}</h2>}
        {summary.length > 0 && (
          <div className="testimonials-summary">
            {summary.map((s, i) => (
              <div key={i} className="summary-item">
                <div className="summary-value" style={{ color: 'var(--section-body)' }}>{s.value}</div>
                <div className="summary-label" style={{ color: 'var(--section-body)' }}>{t(s.label)}</div>
              </div>
            ))}
          </div>
        )}
        <div className="testimonials-list">
          {items.map((tst, i) => (
            <blockquote key={i} className="testimonial">
              <p className="quote" style={{ color: 'var(--section-body)' }}>{t(tst.quote)}</p>
              <footer className="meta" style={{ color: 'var(--section-body)' }}>
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