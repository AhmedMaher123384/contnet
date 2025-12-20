import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'
import { getExternalLinkProps } from '../utils/links.js'

export default function CTA() {
  const { config, t } = useConfig()
  const section = config?.sections?.cta
  if (!section?.enabled) return null
  const ctaText = t(section.cta?.text)
  const ctaLink = section.cta?.link || '#'
  return (
    <section id="cta" className="cta">
      <div className="container cta-inner">
        {section.heading && <h2 className="cta-title">{t(section.heading)}</h2>}
        {section.subheading && <p className="cta-sub">{t(section.subheading)}</p>}
        {ctaText && (
          <a className="btn" href={ctaLink} {...getExternalLinkProps(ctaLink)}>
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}