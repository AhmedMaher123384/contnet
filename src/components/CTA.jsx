import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'
import { getExternalLinkProps } from '../utils/links.js'

export default function CTA() {
  const { config, t } = useConfig()
  const section = config?.sections?.cta
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
  const ctaText = t(section.cta?.text)
  const ctaLink = section.cta?.link || '#'
  return (
    <section id="cta" className="cta section" style={style}>
      <div className="container cta-inner">
        {section.heading && <h2 className="cta-title" style={{ color: 'var(--section-heading)' }}>{t(section.heading)}</h2>}
        {section.subheading && <p className="cta-sub" style={{ color: 'var(--section-body)' }}>{t(section.subheading)}</p>}
        {ctaText && (
          <a className="btn" href={ctaLink} {...getExternalLinkProps(ctaLink)}>
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}