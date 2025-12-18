const REMOTE_URL = import.meta.env?.VITE_CONFIG_ENDPOINT
const REMOTE_TOKEN = import.meta.env?.VITE_CONFIG_TOKEN

export const hasRemote = Boolean(REMOTE_URL)

export async function loadConfig() {
  try {
    const override = localStorage.getItem('siteConfig')
    if (override) return JSON.parse(override)
  } catch {}
  // حاول القراءة من مصدر خارجي إن توفر
  if (hasRemote) {
    try {
      const url = REMOTE_URL + (REMOTE_URL.includes('?') ? '&' : '?') + 'v=' + Date.now()
      const res = await fetch(url, {
        cache: 'no-cache'
      })
      if (res.ok) return await res.json()
    } catch {}
  }
  // رجوع للملف المحلي كافتراضي
  const res = await fetch('/config.json?v=' + Date.now(), { cache: 'no-cache' })
  return res.json()
}

export function saveConfig(cfg) {
  localStorage.setItem('siteConfig', JSON.stringify(cfg))
}

export async function saveConfigRemote(cfg) {
  if (!hasRemote) throw new Error('REMOTE endpoint not configured')
  const res = await fetch(REMOTE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(REMOTE_TOKEN ? { Authorization: `Bearer ${REMOTE_TOKEN}` } : {}),
    },
    body: JSON.stringify(cfg)
  })
  if (!res.ok) throw new Error(`Remote save failed: ${res.status}`)
  return true
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