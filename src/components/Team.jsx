import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Team() {
  const { config, t } = useConfig()
  const section = config?.sections?.team
  if (!section?.enabled) return null
  const members = Array.isArray(section.members) ? section.members : []
  return (
    <section id="team" className="team">
      <div className="container">
        {section.heading && <h2 className="section-title">{t(section.heading)}</h2>}
        <div className="team-grid">
          {members.map((m, i) => (
            <div key={i} className="team-card">
              <div className="team-name">{t(m.name)}</div>
              <div className="team-role">{t(m.role)}</div>
              <div className="team-bio">{t(m.bio)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}