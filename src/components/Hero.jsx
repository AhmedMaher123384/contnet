import React, { useEffect, useState, useMemo } from 'react'
import { useConfig } from '../config/ConfigContext.jsx'
import { getExternalLinkProps } from '../utils/links.js'

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
  const media = hero.media || {}
  const type = media.type || (hero.backgroundImage ? 'image' : 'image')

  // Carousel state
  const slides = (media.slides || []).filter(s => (s?.src || '').trim() !== '')
  const [index, setIndex] = useState(0)
  const hasCarousel = type === 'carousel' && slides.length > 0
  useEffect(() => {
    if (!hasCarousel || slides.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 6000)
    return () => clearInterval(id)
  }, [hasCarousel, slides.length])

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const goNext = () => setIndex((i) => (i + 1) % slides.length)

  // Determine background rendering
  if (type === 'image') {
    const img = media.image || hero.backgroundImage
    if (img) style.backgroundImage = `url(${img})`
  }
  // في وضع الكاروسيل سنرسم الشرائح داخليًا مع انتقالات ناعمة بدل تبديل background مباشرةً

  const overlayMode = hero.overlayMode || 'global'

  const getOverlayContent = () => {
    if (type === 'carousel' && overlayMode === 'per-slide' && slides[index]) {
      const s = slides[index]
      const textObj = s.overlay?.text || { en: '', ar: '' }
      const btnTextObj = s.overlay?.button?.text || { en: '', ar: '' }
      const btnLink = s.overlay?.button?.link || '#'
      const h = t(textObj)
      const c = t(btnTextObj)
      // إن لم يوجد محتوى للشريحة، نرجع للمحتوى العام حتى لا يظهر القسم فارغًا
      if (!h && !c) {
        return {
          heading: t(hero.heading),
          subheading: t(hero.subheading),
          ctaText: t(hero.cta?.text),
          ctaLink: hero.cta?.link || '#'
        }
      }
      return {
        heading: h,
        subheading: '',
        ctaText: c,
        ctaLink: btnLink
      }
    }
    return {
      heading: t(hero.heading),
      subheading: t(hero.subheading),
      ctaText: t(hero.cta?.text),
      ctaLink: hero.cta?.link || '#'
    }
  }
  const { heading, subheading, ctaText, ctaLink } = getOverlayContent()
  return (
    <section id="hero" className="hero" style={style}>
      {type === 'video' && media.video?.src && (
        <video
          className="hero-video"
          src={media.video.src}
          poster={media.video.poster || ''}
          autoPlay={!!media.video.autoplay}
          loop={!!media.video.loop}
          muted={!!media.video.muted}
          playsInline
        />
      )}
      {hasCarousel && (
        <div className="hero-slides" aria-label="عرض الشرائح">
          {slides.map((s, i) => (
            <div
              key={i}
              className={`hero-slide${i === index ? ' active' : ''}`}
              style={{ backgroundImage: `url(${s.src})` }}
              role="img"
              aria-hidden={i !== index}
            />
          ))}
        </div>
      )}
      {hasCarousel && slides.length > 1 && (
        <div className="hero-nav" aria-label="التنقل في الشرائح">
          <button className="hero-arrow left" onClick={goPrev} aria-label="السابق">‹</button>
          <button className="hero-arrow right" onClick={goNext} aria-label="التالي">›</button>
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot${i === index ? ' active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`اذهب إلى الشريحة ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
      <div className="inner container" style={{ color: 'var(--section-text)' }}>
        {heading && <h1>{heading}</h1>}
        {subheading && <p>{subheading}</p>}
        {ctaText && (
          <a className="btn" href={ctaLink} {...getExternalLinkProps(ctaLink)} style={{ background: 'var(--cta-bg)', color: 'var(--cta-text)' }}>
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}