import React from 'react'
import { ConfigProvider, useConfig } from './config/ConfigContext.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Services from './components/Services.jsx'
import Contact from './components/Contact.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import BlocksAt from './components/Blocks.jsx'
import Footer from './components/Footer.jsx'

function Shell({ children }) {
  const { config, t, lang, setLang } = useConfig()
  if (!config) return null
  const title = t(config.site.title)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const navbarColors = (config.sections && config.sections.navbar && config.sections.navbar.colors) || {}
  const footerColors = (config.sections && config.sections.footer && config.sections.footer.colors) || {}
  const headerStyle = {
    '--navbar-bg': navbarColors.background || undefined,
    '--navbar-text': navbarColors.text || undefined,
    '--navbar-accent': navbarColors.accent || navbarColors.primary || undefined,
    '--navbar-border': navbarColors.border || undefined
  }
  const footerStyle = {
    '--footer-bg': footerColors.background || undefined,
    '--footer-text': footerColors.text || undefined,
    '--footer-border': footerColors.border || undefined
  }
  const defaultMenu = [
    { label: { en: 'About', ar: 'من نحن' }, href: '#about' },
    { label: { en: 'Services', ar: 'خدماتنا' }, href: '#services' },
    { label: { en: 'Contact', ar: 'تواصل' }, href: '#contact' }
  ]
  const menu = Array.isArray(config.site?.menu) && config.site.menu.length ? config.site.menu : defaultMenu
  return (
    <div dir={dir}>
      <header className="site-header" style={headerStyle}>
        <div className="container nav">
          <div className="brand">
            <a href="#" className="brand-link">{title}</a>
          </div>
          <nav className="nav-links">
            {menu.map((item, i) => (
              <a key={i} href={item.href}>{t(item.label)}</a>
            ))}
            <select aria-label={t({ en: 'Language', ar: 'اللغة' })} value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginLeft: 18, padding: '6px 10px', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--color-text) 15%, transparent)', background: 'transparent', color: 'var(--color-text)' }}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <Footer style={footerStyle} />
    </div>
  )
}

function Site() {
  const { config } = useConfig()
  if (!config) return null
  const defaultOrder = ['hero', 'about', 'services', 'contact']
  const order = Array.isArray(config.site?.sectionsOrder) && config.site.sectionsOrder.length
    ? config.site.sectionsOrder.filter((k) => defaultOrder.includes(k))
    : defaultOrder

  const SectionComp = {
    hero: Hero,
    about: About,
    services: Services,
    contact: Contact
  }

  const isEnabled = (key) => {
    const sec = config.sections?.[key]
    return sec?.enabled !== false
  }

  return (
    <Shell>
      {order.map((key) => {
        if (!SectionComp[key] || !isEnabled(key)) return null
        const Comp = SectionComp[key]
        const cap = key.charAt(0).toUpperCase() + key.slice(1)
        return (
          <React.Fragment key={key}>
            <BlocksAt position={`before${cap}`} />
            <Comp />
            <BlocksAt position={`after${cap}`} />
          </React.Fragment>
        )
      })}
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