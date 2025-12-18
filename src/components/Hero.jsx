import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

export default function Hero() {
  const { config, t } = useConfig()
  const hero = config?.sections?.hero
  if (!hero?.enabled) return null
  const colors = hero.colors || {}
  const style = {
    '--section-primary': colors.primary || 'var(--color-primary)',
    '--section-secondary': colors.secondary || 'var(--color-secondary)',
    '--section-bg': colors.background || 'var(--color-bg)',
    '--section-text': colors.text || 'var(--color-text)',
    '--cta-bg': colors.ctaBg || 'var(--section-primary)',
    '--cta-text': colors.ctaText || '#fff'
  }
  if (hero.backgroundImage) style.backgroundImage = `url(${hero.backgroundImage})`
  return (
    <section id="hero" className="hero" style={style}>
      <div className="inner container" style={{ color: 'var(--section-text)' }}>
        <h1>{t(hero.heading)}</h1>
        <p>{t(hero.subheading)}</p>
        <a className="btn" href={hero.cta?.link || '#'} style={{ background: 'var(--cta-bg)', color: 'var(--cta-text)' }}>
          {t(hero.cta?.text)}
        </a>
      </div>
    </section>
  )
}