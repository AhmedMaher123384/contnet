import React from 'react'
import { ConfigProvider, useConfig } from './config/ConfigContext.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Services from './components/Services.jsx'
import Contact from './components/Contact.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import BlocksAt from './components/Blocks.jsx'

function Shell({ children }) {
  const { config, t, lang, setLang } = useConfig()
  if (!config) return null
  const title = t(config.site.title)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <div dir={dir}>
      <header className="site-header">
        <div className="container nav">
          <div className="brand">
            <a href="#" className="brand-link">{title}</a>
          </div>
          <nav className="nav-links">
            <a href="#about">{t({ en: 'About', ar: 'من نحن' })}</a>
            <a href="#services">{t({ en: 'Services', ar: 'خدماتنا' })}</a>
            <a href="#contact">{t({ en: 'Contact', ar: 'تواصل' })}</a>
            <select aria-label={t({ en: 'Language', ar: 'اللغة' })} value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginLeft: 18, padding: '6px 10px', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--color-text) 15%, transparent)', background: 'transparent', color: 'var(--color-text)' }}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer">
          <span>© {new Date().getFullYear()} {title} · {t(config.site.footerText)}</span>
        </div>
      </footer>
    </div>
  )
}

function Site() {
  const { config } = useConfig()
  if (!config) return null
  return (
    <Shell>
      <BlocksAt position="beforeHero" />
      <Hero />
      <BlocksAt position="afterHero" />
      <BlocksAt position="beforeAbout" />
      <About />
      <BlocksAt position="afterAbout" />
      <BlocksAt position="beforeServices" />
      <Services />
      <BlocksAt position="afterServices" />
      <BlocksAt position="beforeContact" />
      <Contact />
      <BlocksAt position="afterContact" />
    </Shell>
  )
}

function Router() {
  const [route, setRoute] = React.useState(window.location.hash || '#')
  React.useEffect(() => {
    const fn = () => setRoute(window.location.hash || '#')
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  if (route === '#admin') return <Dashboard />
  return <Site />
}

export default function App() {
  return (
    <ConfigProvider>
      <Router />
    </ConfigProvider>
  )
}