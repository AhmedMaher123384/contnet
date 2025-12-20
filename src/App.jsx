import React from 'react'
import { ConfigProvider, useConfig } from './config/ConfigContext.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Highlights from './components/Highlights.jsx'
import Services from './components/Services.jsx'
import Contact from './components/Contact.jsx'
import Metrics from './components/Metrics.jsx'
import Industries from './components/Industries.jsx'
import Portfolio from './components/Portfolio.jsx'
import Testimonials from './components/Testimonials.jsx'
import Team from './components/Team.jsx'
import CTA from './components/CTA.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import BlocksAt from './components/Blocks.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import { getExternalLinkProps } from './utils/links.js'

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
  return (
    <div dir={dir}>
      <Navbar style={headerStyle} />
      <main>{children}</main>
      <Footer style={footerStyle} />
    </div>
  )
}

function Site() {
  const { config } = useConfig()
  if (!config) return null
  const defaultOrder = ['hero', 'metrics', 'highlights', 'about', 'industries', 'services', 'portfolio', 'testimonials', 'team', 'cta', 'contact']
  const order = Array.isArray(config.site?.sectionsOrder) && config.site.sectionsOrder.length
    ? config.site.sectionsOrder.filter((k) => defaultOrder.includes(k))
    : defaultOrder

  const SectionComp = {
    hero: Hero,
    metrics: Metrics,
    highlights: Highlights,
    about: About,
    industries: Industries,
    services: Services,
    portfolio: Portfolio,
    testimonials: Testimonials,
    team: Team,
    cta: CTA,
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