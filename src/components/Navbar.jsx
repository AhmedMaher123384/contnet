import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'
import { getExternalLinkProps } from '../utils/links.js'

export default function Navbar({ style }) {
  const { config, t, lang, setLang } = useConfig()
  if (!config) return null
  const title = t(config.site.title)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const defaultMenu = [
    { label: { en: 'About', ar: 'من نحن' }, href: '#about' },
    { label: { en: 'Services', ar: 'خدماتنا' }, href: '#services' },
    { label: { en: 'Contact', ar: 'تواصل' }, href: '#contact' }
  ]
  const menu = Array.isArray(config.site?.menu) && config.site.menu.length ? config.site.menu : defaultMenu

  const [open, setOpen] = React.useState(false)
  const [activeHash, setActiveHash] = React.useState(typeof window !== 'undefined' ? (window.location.hash || '') : '')
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const fn = () => setOpen(false)
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  React.useEffect(() => {
    const ids = menu.map((m) => (typeof m.href === 'string' && m.href.startsWith('#') ? m.href.slice(1) : null)).filter(Boolean)
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(`#${entry.target.id}`)
          }
        })
      },
      { root: null, rootMargin: '-35% 0px -55% 0px', threshold: 0.1 }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [menu])

  const onLinkClick = () => setOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`} style={style} dir={dir}>
      <div className="container nav">
        <div className="brand">
          <a href="#" className="brand-link">
            {config.site.logoNavbar ? (
              <img className="brand-logo" src={config.site.logoNavbar} alt={title} />
            ) : (
              title
            )}
          </a>
        </div>

        {/* Desktop navigation */}
        <nav className="nav-links">
          {menu.map((item, i) => {
            const isActive = activeHash && item.href === activeHash
            return (
              <a key={i} href={item.href} className={isActive ? 'active' : ''} {...getExternalLinkProps(item.href)} onClick={onLinkClick}>
                {t(item.label)}
              </a>
            )
          })}
          <select aria-label={t({ en: 'Language', ar: 'اللغة' })} value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </nav>

        {/* Mobile toggle */}
        <button className={`menu-toggle ${open ? 'open' : ''}`} aria-expanded={open ? 'true' : 'false'} aria-label={open ? t({ en: 'Close menu', ar: 'إغلاق القائمة' }) : t({ en: 'Open menu', ar: 'فتح القائمة' })} onClick={() => setOpen(!open)}>
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>

      {/* Mobile overlay menu */}
      <div className={`mobile-nav ${open ? 'open' : ''}`} dir={dir}>
        <div className="mobile-backdrop" onClick={() => setOpen(false)} />
        <aside className="mobile-panel" role="dialog" aria-modal="true">
          <div className="mobile-inner container">
            <div className="mobile-top">
              <div className="brand">
                <a href="#" className="brand-link" onClick={() => setOpen(false)}>
                  {config.site.logoNavbar ? (
                    <img className="brand-logo" src={config.site.logoNavbar} alt={title} />
                  ) : (
                    title
                  )}
                </a>
              </div>
              <button className="close" aria-label={t({ en: 'Close menu', ar: 'إغلاق القائمة' })} onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="mobile-links">
              {menu.map((item, i) => (
                <a key={i} href={item.href} {...getExternalLinkProps(item.href)} onClick={onLinkClick} className={item.href === activeHash ? 'active' : ''}>
                  {t(item.label)}
                </a>
              ))}
            </div>
            <div className="mobile-actions">
              <label className="lang-label" htmlFor="lang-select">{t({ en: 'Language', ar: 'اللغة' })}</label>
              <select id="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </aside>
      </div>
    </header>
  )
}