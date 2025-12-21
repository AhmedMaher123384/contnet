import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Team() {
  const { config, t } = useConfig()
  const section = config?.sections?.team
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
  const members = Array.isArray(section.members) ? section.members : []
  return (
    <section id="team" className="team section" style={style}>
      <div className="container">
        {section.heading && <h2 className="section-title" style={{ color: 'var(--section-heading)' }}>{t(section.heading)}</h2>}
        <div className="team-grid">
          {members.map((m, i) => (
            <div key={i} className="team-card">
              <div className="team-name" style={{ color: 'var(--section-body)' }}>{t(m.name)}</div>
              <div className="team-role" style={{ color: 'var(--section-body)' }}>{t(m.role)}</div>
              <div className="team-bio" style={{ color: 'var(--section-body)' }}>{t(m.bio)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}