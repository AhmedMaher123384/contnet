import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function About() {
  const { config, t } = useConfig()
  const about = config?.sections?.about
  if (!about?.enabled) return null
  const colors = about.colors || {}
  const style = {
    '--section-primary': colors.primary || 'var(--color-primary)',
    '--section-secondary': colors.secondary || 'var(--color-secondary)',
    '--section-bg': colors.background || 'var(--color-bg)',
    '--section-text': colors.text || 'var(--color-text)'
  }
  return (
    <section id="about" className="about section" style={style}>
      <div className="container">
        <h2 style={{ color: 'var(--section-text)' }}>{t(about.heading)}</h2>
        <div className="grid">
          <div className="card">
            {(about.paragraphs || []).map((p, i) => (
              <p key={i} className="muted" style={{ color: 'var(--section-text)' }}>{t(p)}</p>
            ))}
          </div>
          <div>
            {about.image ? <img src={about.image} alt={t(about.heading)} loading="lazy" /> : null}
          </div>
        </div>
      </div>
    </section>
  )
}