import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadConfig, saveConfig } from './configLoader.js'

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [lang, setLang] = useState('en')

  useEffect(() => { (async () => {
    const cfg = await loadConfig()
    setConfig(cfg)
    setLang(cfg?.site?.lang || 'en')
  })() }, [])

  useEffect(() => {
    if (!config) return
    const root = document.documentElement
    const theme = config.theme
    if (!theme) return
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-secondary', theme.secondary)
    root.style.setProperty('--color-bg', theme.background)
    root.style.setProperty('--color-text', theme.text)
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) metaTheme.content = theme.primary
  }, [config])

  const value = useMemo(() => ({
    config,
    setConfig,
    lang,
    setLang,
    t: (obj) => typeof obj === 'string' ? obj : (obj?.[lang] ?? ''),
    saveToBrowser: () => config && saveConfig(config)
  }), [config, lang])

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  return useContext(ConfigContext)
}