export async function loadConfig() {
  try {
    const override = localStorage.getItem('siteConfig')
    if (override) return JSON.parse(override)
  } catch {}
  const res = await fetch('/config.json')
  return res.json()
}

export function saveConfig(cfg) {
  localStorage.setItem('siteConfig', JSON.stringify(cfg))
}

export function downloadConfig(cfg, filename = 'config.json') {
  const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}