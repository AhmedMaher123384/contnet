import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useConfig } from '../config/ConfigContext.jsx'
import { downloadConfig } from '../config/configLoader.js'

function ColorInput({ label, value, onChange }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function TextInput({ label, value, onChange, dir, placeholder }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} dir={dir} placeholder={placeholder} />
    </div>
  )
}

export default function Dashboard() {
  const { config, setConfig, t, lang, setLang, saveToBrowser } = useConfig()
  const [editLang, setEditLang] = useState(lang)
  const [active, setActive] = useState('theme')
  const [livePreview, setLivePreview] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [svcFilter, setSvcFilter] = useState('')
  const [linkFilter, setLinkFilter] = useState('')
  const [blockFilter, setBlockFilter] = useState('')
  const dir = editLang === 'ar' ? 'rtl' : 'ltr'
  const previewRef = useRef(null)

  // حافظ على ترتيب واستدعاء الـ hooks ثابتًا دائمًا
  const cfg = useMemo(() => (config ? JSON.parse(JSON.stringify(config)) : null), [config])

  function refreshPreview() {
    if (!showPreview) return
    const iframe = previewRef.current
    try {
      if (iframe && iframe.contentWindow) iframe.contentWindow.location.reload()
    } catch {}
  }

  function handleSaveAndRefresh() {
    try { saveToBrowser() } finally { refreshPreview() }
  }

  function setTheme(key, v) { cfg.theme[key] = v; setConfig(cfg) }
  function setSiteText(key, v) { cfg.site[key][editLang] = v; setConfig(cfg) }
  function setSectionEnabled(sec, v) { cfg.sections[sec].enabled = v; setConfig(cfg) }
  function setSectionText(sec, key, v) { cfg.sections[sec][key][editLang] = v; setConfig(cfg) }
  function setSectionColor(sec, key, v) { cfg.sections[sec].colors[key] = v; setConfig(cfg) }
  function setHeroCTA(key, v) { cfg.sections.hero.cta[key][editLang] = v; setConfig(cfg) }
  function setAboutImage(v) { cfg.sections.about.image = v; setConfig(cfg) }
  function addService() { cfg.sections.services.items.push({ title: { en: '', ar: '' }, description: { en: '', ar: '' }, icon: '•' }); setConfig(cfg) }
  function updateService(i, field, v) { cfg.sections.services.items[i][field][editLang] = v; setConfig(cfg) }
  function updateServiceIcon(i, v) { cfg.sections.services.items[i].icon = v; setConfig(cfg) }
  function removeService(i) { cfg.sections.services.items.splice(i, 1); setConfig(cfg) }
  function moveService(i, dirMove) { const j = dirMove === 'up' ? i - 1 : i + 1; if (j < 0 || j >= cfg.sections.services.items.length) return; const arr = cfg.sections.services.items; [arr[i], arr[j]] = [arr[j], arr[i]]; setConfig(cfg) }
  function addLink() { cfg.sections.contact.links.push({ label: { en: '', ar: '' }, url: '' }); setConfig(cfg) }
  function updateLinkLabel(i, v) { cfg.sections.contact.links[i].label[editLang] = v; setConfig(cfg) }
  function updateLinkUrl(i, v) { cfg.sections.contact.links[i].url = v; setConfig(cfg) }
  function removeLink(i) { cfg.sections.contact.links.splice(i, 1); setConfig(cfg) }
  function moveLink(i, dirMove) { const j = dirMove === 'up' ? i - 1 : i + 1; if (j < 0 || j >= cfg.sections.contact.links.length) return; const arr = cfg.sections.contact.links; [arr[i], arr[j]] = [arr[j], arr[i]]; setConfig(cfg) }

  useEffect(() => {
    if (livePreview && config) {
      try { localStorage.setItem('siteConfig', JSON.stringify(config)) } catch {}
    }
  }, [config, livePreview])

  // إذا كان الـ config غير جاهز بعد، أعرض واجهة تحميل بسيطة بدون تعديل ترتيب الـ hooks
  if (!cfg) {
    return (
      <div className="dashboard" dir={dir}>
        <aside className="dashboard-sidebar">
          <div className="dashboard-logo">لوحة التحكم</div>
          <div className="dashboard-nav">
            <span className="nav-label">المظهر</span>
            <button className={'active'}>ألوان الثيم</button>
            <span className="nav-label">الأقسام</span>
            <button>الهيرو</button>
            <button>من نحن</button>
            <button>الخدمات</button>
            <button>التواصل</button>
            <span className="nav-label">إدارة البيانات</span>
            <button>حفظ / تصدير</button>
          </div>
        </aside>
        <main className="dashboard-main">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">جاري تحميل الإعدادات...</div>
              <div className="panel-desc">انتظر لحظات من فضلك</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const activeLabel = {
    theme: 'ألوان الثيم',
    hero: 'الهيرو',
    about: 'من نحن',
    services: 'الخدمات',
    contact: 'التواصل',
    custom: 'محتوى مخصص',
    data: 'حفظ / تصدير',
  }[active]

  return (
    <div className="dashboard" dir={dir}>
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">لوحة التحكم</div>
        <div className="dashboard-nav">
          <span className="nav-label">المظهر</span>
          <button className={active === 'theme' ? 'active' : ''} onClick={() => setActive('theme')}>ألوان الثيم</button>
          <span className="nav-label">الأقسام</span>
          <button className={active === 'hero' ? 'active' : ''} onClick={() => setActive('hero')}>الهيرو</button>
          <button className={active === 'about' ? 'active' : ''} onClick={() => setActive('about')}>من نحن</button>
          <button className={active === 'services' ? 'active' : ''} onClick={() => setActive('services')}>الخدمات</button>
          <button className={active === 'contact' ? 'active' : ''} onClick={() => setActive('contact')}>التواصل</button>
          <button className={active === 'custom' ? 'active' : ''} onClick={() => setActive('custom')}>محتوى مخصص</button>
          <span className="nav-label">إدارة البيانات</span>
          <button className={active === 'data' ? 'active' : ''} onClick={() => setActive('data')}>حفظ / تصدير</button>
        </div>
        <div className="sidebar-actions">
          <button className="btn" onClick={handleSaveAndRefresh}>حفظ في المتصفح</button>
          <button className="btn-outline" onClick={() => downloadConfig(config)}>تنزيل JSON</button>
          <button className="btn-ghost" onClick={() => { localStorage.removeItem('siteConfig'); window.location.reload() }}>إعادة التعيين</button>
          <label className="form-row" style={{ gap: 8 }}>
            <span style={{ color: 'var(--dash-muted)' }}>تحميل ملف</span>
            <input type="file" accept="application/json" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              const text = await file.text();
              try { const obj = JSON.parse(text); setConfig(obj); alert('تم تحميل JSON بنجاح.'); }
              catch { alert('ملف JSON غير صالح'); }
            }} />
          </label>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <span className="badge">القسم الحالي: {activeLabel}</span>
          </div>
          <div className="topbar-right">
            <button className="btn-outline" onClick={() => { window.location.hash = '#'; }}>عرض الموقع</button>
            <button className="btn" onClick={handleSaveAndRefresh}>حفظ</button>
            <label className="chip" title="تحديث المعاينة تلقائيًا">
              <input type="checkbox" checked={livePreview} onChange={(e) => setLivePreview(e.target.checked)} style={{ marginInlineEnd: 6 }} /> معاينة فورية
            </label>
            <button className="btn-ghost" onClick={() => setShowPreview(v => !v)}>{showPreview ? 'إخفاء المعاينة' : 'إظهار المعاينة'}</button>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">الإعدادات العامة</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="panel-desc">لغة العرض:</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
              <span className="panel-desc">لغة التحرير:</span>
              <select value={editLang} onChange={(e) => setEditLang(e.target.value)}>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <TextInput label="عنوان الموقع" value={cfg.site.title[editLang]} onChange={(v) => setSiteText('title', v)} dir={dir} placeholder={editLang === 'ar' ? 'مثال: شركة السمارت' : 'e.g., SmartCo'} />
            <TextInput label="نص الفوتر" value={cfg.site.footerText[editLang]} onChange={(v) => setSiteText('footerText', v)} dir={dir} placeholder={editLang === 'ar' ? '© جميع الحقوق محفوظة' : '© All rights reserved'} />
          </div>
        </div>

        {active === 'theme' && (
          <div className="panel">
            <div className="panel-header"><div className="panel-title">ألوان الثيم</div><div className="panel-desc">ألوان عامة تؤثر على الموقع</div></div>
            <div className="row-grid row-4">
              <ColorInput label="Primary" value={cfg.theme.primary} onChange={(v) => setTheme('primary', v)} />
              <ColorInput label="Secondary" value={cfg.theme.secondary} onChange={(v) => setTheme('secondary', v)} />
              <ColorInput label="Background" value={cfg.theme.background} onChange={(v) => setTheme('background', v)} />
              <ColorInput label="Text" value={cfg.theme.text} onChange={(v) => setTheme('text', v)} />
            </div>
          </div>
        )}

        {active === 'hero' && (
          <div className="panel">
            <div className="panel-header"><div className="panel-title">الهيرو</div><div className="panel-desc">العناوين، الصورة الخلفية، وألوان CTA</div></div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <input type="checkbox" checked={cfg.sections.hero.enabled} onChange={(e) => setSectionEnabled('hero', e.target.checked)} />
              <span className="panel-desc">مفعّل</span>
            </div>
            <div className="row-grid row-2">
              <TextInput label="العنوان" value={cfg.sections.hero.heading[editLang]} onChange={(v) => setSectionText('hero', 'heading', v)} dir={dir} placeholder={editLang === 'ar' ? 'مثال: نَبني حلول رقمية' : 'e.g., We build digital solutions'} />
              <TextInput label="العنوان الفرعي" value={cfg.sections.hero.subheading[editLang]} onChange={(v) => setSectionText('hero', 'subheading', v)} dir={dir} placeholder={editLang === 'ar' ? 'وصف مختصر جذاب' : 'Short catchy subheading'} />
              <TextInput label="CTA نص" value={cfg.sections.hero.cta.text[editLang]} onChange={(v) => setHeroCTA('text', v)} dir={dir} placeholder={editLang === 'ar' ? 'ابدأ الآن' : 'Get Started'} />
              <TextInput label="CTA رابط" value={cfg.sections.hero.cta.link} onChange={(v) => { cfg.sections.hero.cta.link = v; setConfig(cfg) }} dir="ltr" placeholder={editLang === 'ar' ? 'https://...' : 'https://...'} />
              <TextInput label="خلفية صورة URL" value={cfg.sections.hero.backgroundImage || ''} onChange={(v) => { cfg.sections.hero.backgroundImage = v; setConfig(cfg) }} dir="ltr" placeholder={editLang === 'ar' ? 'رابط الصورة الخلفية' : 'Background image URL'} />
            </div>
            <div className="row-grid row-3" style={{ marginTop: 12 }}>
              <ColorInput label="Primary" value={cfg.sections.hero.colors.primary || ''} onChange={(v) => setSectionColor('hero', 'primary', v)} />
              <ColorInput label="Secondary" value={cfg.sections.hero.colors.secondary || ''} onChange={(v) => setSectionColor('hero', 'secondary', v)} />
              <ColorInput label="Background" value={cfg.sections.hero.colors.background || ''} onChange={(v) => setSectionColor('hero', 'background', v)} />
              <ColorInput label="Text" value={cfg.sections.hero.colors.text || ''} onChange={(v) => setSectionColor('hero', 'text', v)} />
              <ColorInput label="CTA Bg" value={cfg.sections.hero.colors.ctaBg || ''} onChange={(v) => setSectionColor('hero', 'ctaBg', v)} />
              <ColorInput label="CTA Text" value={cfg.sections.hero.colors.ctaText || ''} onChange={(v) => setSectionColor('hero', 'ctaText', v)} />
            </div>
          </div>
        )}

        {active === 'about' && (
          <div className="panel">
            <div className="panel-header"><div className="panel-title">من نحن</div><div className="panel-desc">العنوان، الفقرات، والصورة</div></div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <input type="checkbox" checked={cfg.sections.about.enabled} onChange={(e) => setSectionEnabled('about', e.target.checked)} />
              <span className="panel-desc">مفعّل</span>
            </div>
            <TextInput label="العنوان" value={cfg.sections.about.heading[editLang]} onChange={(v) => setSectionText('about', 'heading', v)} dir={dir} placeholder={editLang === 'ar' ? 'من نحن' : 'About Us'} />
            <div className="row-grid" style={{ marginTop: 12 }}>
              {(cfg.sections.about.paragraphs || []).map((p, i) => (
                <TextInput key={i} label={`فقرة ${i + 1}`} value={p[editLang] || ''} onChange={(v) => { cfg.sections.about.paragraphs[i][editLang] = v; setConfig(cfg) }} dir={dir} placeholder={editLang === 'ar' ? 'نص الفقرة...' : 'Paragraph text...'} />
              ))}
            </div>
            <TextInput label="صورة URL" value={cfg.sections.about.image || ''} onChange={(v) => setAboutImage(v)} dir="ltr" placeholder={editLang === 'ar' ? 'رابط صورة عن الشركة' : 'About image URL'} />
            <div className="row-grid row-4" style={{ marginTop: 12 }}>
              <ColorInput label="Primary" value={cfg.sections.about.colors.primary || ''} onChange={(v) => setSectionColor('about', 'primary', v)} />
              <ColorInput label="Secondary" value={cfg.sections.about.colors.secondary || ''} onChange={(v) => setSectionColor('about', 'secondary', v)} />
              <ColorInput label="Background" value={cfg.sections.about.colors.background || ''} onChange={(v) => setSectionColor('about', 'background', v)} />
              <ColorInput label="Text" value={cfg.sections.about.colors.text || ''} onChange={(v) => setSectionColor('about', 'text', v)} />
            </div>
          </div>
        )}

        {active === 'services' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">الخدمات <span className="badge">{cfg.sections.services.items.length}</span></div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="text" dir={dir} placeholder={editLang === 'ar' ? 'بحث عن خدمة' : 'Search services'} value={svcFilter} onChange={(e) => setSvcFilter(e.target.value)} style={{ padding: 8, borderRadius: 10, border: '1px solid var(--dash-border)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <input type="checkbox" checked={cfg.sections.services.enabled} onChange={(e) => setSectionEnabled('services', e.target.checked)} />
              <span className="panel-desc">مفعّل</span>
            </div>
            <TextInput label="العنوان" value={cfg.sections.services.heading[editLang]} onChange={(v) => setSectionText('services', 'heading', v)} dir={dir} placeholder={editLang === 'ar' ? 'خدماتنا' : 'Our Services'} />
            <button className="btn" style={{ marginTop: 12 }} onClick={addService}>إضافة خدمة</button>
            <div className="row-grid" style={{ marginTop: 12 }}>
              {cfg.sections.services.items
                .map((svc, i) => ({ svc, i }))
                .filter(({ svc }) => {
                  const q = svcFilter.trim().toLowerCase(); if (!q) return true
                  return (svc.title[editLang] || '').toLowerCase().includes(q) || (svc.description[editLang] || '').toLowerCase().includes(q) || (svc.icon || '').toLowerCase().includes(q)
                })
                .map(({ svc, i }) => (
                  <div key={i} className="row-cta" style={{ display: 'grid', gridTemplateColumns: '64px 1fr 1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                    <input type="text" value={svc.icon} onChange={(e) => updateServiceIcon(i, e.target.value)} style={{ textAlign: 'center' }} />
                    <input type="text" value={svc.title[editLang] || ''} onChange={(e) => updateService(i, 'title', e.target.value)} dir={dir} placeholder={editLang === 'ar' ? 'عنوان الخدمة' : 'Service title'} />
                    <input type="text" value={svc.description[editLang] || ''} onChange={(e) => updateService(i, 'description', e.target.value)} dir={dir} placeholder={editLang === 'ar' ? 'وصف مختصر' : 'Short description'} />
                    <button className="btn-outline" onClick={() => moveService(i, 'up')}>↑</button>
                    <button className="btn-outline" onClick={() => moveService(i, 'down')}>↓</button>
                    <button className="btn-ghost" onClick={() => { if (confirm('تأكيد حذف الخدمة؟')) removeService(i) }}>حذف</button>
                  </div>
                ))}
            </div>
            <div className="row-grid row-4" style={{ marginTop: 12 }}>
              <ColorInput label="Primary" value={cfg.sections.services.colors.primary || ''} onChange={(v) => setSectionColor('services', 'primary', v)} />
              <ColorInput label="Secondary" value={cfg.sections.services.colors.secondary || ''} onChange={(v) => setSectionColor('services', 'secondary', v)} />
              <ColorInput label="Background" value={cfg.sections.services.colors.background || ''} onChange={(v) => setSectionColor('services', 'background', v)} />
              <ColorInput label="Text" value={cfg.sections.services.colors.text || ''} onChange={(v) => setSectionColor('services', 'text', v)} />
            </div>
          </div>
        )}

        {active === 'contact' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">التواصل <span className="badge">{cfg.sections.contact.links.length}</span></div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="text" dir={dir} placeholder={editLang === 'ar' ? 'بحث عن رابط' : 'Search links'} value={linkFilter} onChange={(e) => setLinkFilter(e.target.value)} style={{ padding: 8, borderRadius: 10, border: '1px solid var(--dash-border)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <input type="checkbox" checked={cfg.sections.contact.enabled} onChange={(e) => setSectionEnabled('contact', e.target.checked)} />
              <span className="panel-desc">مفعّل</span>
            </div>
            <div className="row-grid row-2">
              <TextInput label="العنوان" value={cfg.sections.contact.heading[editLang]} onChange={(v) => setSectionText('contact', 'heading', v)} dir={dir} placeholder={editLang === 'ar' ? 'تواصل معنا' : 'Contact Us'} />
              <TextInput label="البريد" value={cfg.sections.contact.email || ''} onChange={(v) => { cfg.sections.contact.email = v; setConfig(cfg) }} dir="ltr" placeholder="email@example.com" />
              <TextInput label="الهاتف" value={cfg.sections.contact.phone || ''} onChange={(v) => { cfg.sections.contact.phone = v; setConfig(cfg) }} dir="ltr" placeholder="+201234567890" />
              <TextInput label="العنوان" value={cfg.sections.contact.address[editLang] || ''} onChange={(v) => { cfg.sections.contact.address[editLang] = v; setConfig(cfg) }} dir={dir} placeholder={editLang === 'ar' ? 'اكتب العنوان' : 'Write address'} />
            </div>
            <div className="panel-header" style={{ marginTop: 12 }}>
              <div className="panel-title">روابط</div>
              <button className="btn" onClick={addLink}>إضافة رابط</button>
            </div>
            <div className="row-grid" style={{ marginTop: 8 }}>
              {cfg.sections.contact.links
                .map((l, i) => ({ l, i }))
                .filter(({ l }) => {
                  const q = linkFilter.trim().toLowerCase(); if (!q) return true
                  return (l.label[editLang] || '').toLowerCase().includes(q) || (l.url || '').toLowerCase().includes(q)
                })
                .map(({ l, i }) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                    <input type="text" value={l.label[editLang] || ''} onChange={(e) => updateLinkLabel(i, e.target.value)} dir={dir} placeholder={editLang === 'ar' ? 'اسم الرابط' : 'Link label'} />
                    <input type="url" value={l.url || ''} onChange={(e) => updateLinkUrl(i, e.target.value)} dir="ltr" placeholder="https://..." />
                    <button className="btn-outline" onClick={() => moveLink(i, 'up')}>↑</button>
                    <button className="btn-outline" onClick={() => moveLink(i, 'down')}>↓</button>
                    <button className="btn-ghost" onClick={() => { if (confirm('تأكيد حذف الرابط؟')) removeLink(i) }}>حذف</button>
                  </div>
                ))}
            </div>
            <div className="row-grid row-4" style={{ marginTop: 12 }}>
              <ColorInput label="Primary" value={cfg.sections.contact.colors.primary || ''} onChange={(v) => setSectionColor('contact', 'primary', v)} />
              <ColorInput label="Secondary" value={cfg.sections.contact.colors.secondary || ''} onChange={(v) => setSectionColor('contact', 'secondary', v)} />
              <ColorInput label="Background" value={cfg.sections.contact.colors.background || ''} onChange={(v) => setSectionColor('contact', 'background', v)} />
              <ColorInput label="Text" value={cfg.sections.contact.colors.text || ''} onChange={(v) => setSectionColor('contact', 'text', v)} />
            </div>
          </div>
        )}

        {active === 'custom' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">المحتوى المخصص <span className="badge">{(cfg.customBlocks || []).length}</span></div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="text" dir={dir} placeholder={editLang === 'ar' ? 'بحث في البلوكات' : 'Search blocks'} value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} style={{ padding: 8, borderRadius: 10, border: '1px solid var(--dash-border)' }} />
                <button className="btn" onClick={() => {
                  const arr = cfg.customBlocks || (cfg.customBlocks = [])
                  arr.push({
                    enabled: true,
                    type: 'text',
                    position: 'afterHero',
                    props: { text: { en: '', ar: '' }, align: 'center' }
                  })
                  setConfig(cfg)
                }}>إضافة بلوك</button>
              </div>
            </div>
            <div className="row-grid" style={{ marginTop: 8 }}>
              {(cfg.customBlocks || [])
                .map((b, i) => ({ b, i }))
                .filter(({ b }) => {
                  const q = blockFilter.trim().toLowerCase(); if (!q) return true
                  const txt = (b.props?.text?.[editLang] || '').toLowerCase()
                  return b.type.toLowerCase().includes(q) || (b.position || '').toLowerCase().includes(q) || txt.includes(q)
                })
                .map(({ b, i }) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                    <select value={b.type} onChange={(e) => { b.type = e.target.value; setConfig(cfg) }}>
                      <option value="text">نص</option>
                      <option value="button">زر</option>
                      <option value="image">صورة</option>
                      <option value="spacer">مسافة</option>
                    </select>
                    <select value={b.position} onChange={(e) => { b.position = e.target.value; setConfig(cfg) }}>
                      <option value="beforeHero">قبل الهيرو</option>
                      <option value="afterHero">بعد الهيرو</option>
                      <option value="beforeAbout">قبل من نحن</option>
                      <option value="afterAbout">بعد من نحن</option>
                      <option value="beforeServices">قبل الخدمات</option>
                      <option value="afterServices">بعد الخدمات</option>
                      <option value="beforeContact">قبل التواصل</option>
                      <option value="afterContact">بعد التواصل</option>
                    </select>
                    <select value={b.props?.align || 'center'} onChange={(e) => { b.props = b.props || {}; b.props.align = e.target.value; setConfig(cfg) }}>
                      <option value="left">يسار</option>
                      <option value="center">منتصف</option>
                      <option value="right">يمين</option>
                    </select>

                    {b.type === 'text' && (
                      <input type="text" value={b.props?.text?.[editLang] || ''} onChange={(e) => { b.props = b.props || {}; b.props.text = b.props.text || { en: '', ar: '' }; b.props.text[editLang] = e.target.value; setConfig(cfg) }} dir={dir} placeholder={editLang === 'ar' ? 'نص البلوك' : 'Block text'} />
                    )}

                    {b.type === 'button' && (
                      <>
                        <input type="text" value={b.props?.text?.[editLang] || ''} onChange={(e) => { b.props = b.props || {}; b.props.text = b.props.text || { en: '', ar: '' }; b.props.text[editLang] = e.target.value; setConfig(cfg) }} dir={dir} placeholder={editLang === 'ar' ? 'نص الزر' : 'Button text'} />
                        <input type="url" value={b.props?.link || ''} onChange={(e) => { b.props = b.props || {}; b.props.link = e.target.value; setConfig(cfg) }} dir="ltr" placeholder="https://..." />
                      </>
                    )}

                    {b.type === 'image' && (
                      <>
                        <input type="url" value={b.props?.src || ''} onChange={(e) => { b.props = b.props || {}; b.props.src = e.target.value; setConfig(cfg) }} dir="ltr" placeholder={editLang === 'ar' ? 'رابط الصورة' : 'Image URL'} />
                        <input type="text" value={b.props?.alt?.[editLang] || ''} onChange={(e) => { b.props = b.props || {}; b.props.alt = b.props.alt || { en: '', ar: '' }; b.props.alt[editLang] = e.target.value; setConfig(cfg) }} dir={dir} placeholder={editLang === 'ar' ? 'نص بديل' : 'Alt text'} />
                        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gridColumn: '1 / -1' }}>
                          <input type="text" value={b.props?.width ?? ''} onChange={(e) => { b.props = b.props || {}; b.props.width = e.target.value; setConfig(cfg) }} dir="ltr" placeholder={editLang === 'ar' ? 'العرض (px أو %)' : 'Width (px or %)'} />
                          <input type="text" value={b.props?.height ?? ''} onChange={(e) => { b.props = b.props || {}; b.props.height = e.target.value; setConfig(cfg) }} dir="ltr" placeholder={editLang === 'ar' ? 'الطول (px أو % أو auto)' : 'Height (px, % or auto)'} />
                          <select value={b.props?.objectFit || 'contain'} onChange={(e) => { b.props = b.props || {}; b.props.objectFit = e.target.value; setConfig(cfg) }}>
                            <option value="contain">contain</option>
                            <option value="cover">cover</option>
                            <option value="fill">fill</option>
                            <option value="scale-down">scale-down</option>
                            <option value="none">none</option>
                          </select>
                          <input type="text" value={b.props?.overlayText?.[editLang] || ''} onChange={(e) => { b.props = b.props || {}; b.props.overlayText = b.props.overlayText || { en: '', ar: '' }; b.props.overlayText[editLang] = e.target.value; setConfig(cfg) }} dir={dir} placeholder={editLang === 'ar' ? 'نص فوق الصورة (اختياري)' : 'Overlay text (optional)'} />
                          <select value={b.props?.overlayPosition || 'bottom-right'} onChange={(e) => { b.props = b.props || {}; b.props.overlayPosition = e.target.value; setConfig(cfg) }}>
                            <option value="top-left">top-left</option>
                            <option value="top-right">top-right</option>
                            <option value="bottom-left">bottom-left</option>
                            <option value="bottom-right">bottom-right</option>
                            <option value="center">center</option>
                          </select>
                        </div>
                        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr 1fr 1fr', gridColumn: '1 / -1' }}>
                          <input type="text" value={b.props?.overlayBg ?? ''} onChange={(e) => { b.props = b.props || {}; b.props.overlayBg = e.target.value; setConfig(cfg) }} dir="ltr" placeholder={editLang === 'ar' ? 'خلفية النص (rgba أو #)' : 'Overlay background (rgba or #)'} />
                          <div className="form-row">
                            <label>{editLang === 'ar' ? 'لون النص فوق الصورة' : 'Overlay text color'}</label>
                            <input type="color" value={b.props?.overlayColor || '#ffffff'} onChange={(e) => { b.props = b.props || {}; b.props.overlayColor = e.target.value; setConfig(cfg) }} />
                          </div>
                          <div className="form-row">
                            <label>{editLang === 'ar' ? 'Padding النص' : 'Overlay padding'}</label>
                            <input type="number" min="0" value={b.props?.overlayPadding ?? 8} onChange={(e) => { b.props = b.props || {}; b.props.overlayPadding = Number(e.target.value) || 0; setConfig(cfg) }} />
                          </div>
                          <div className="form-row">
                            <label>{editLang === 'ar' ? 'Radius الحواف' : 'Overlay radius'}</label>
                            <input type="number" min="0" value={b.props?.overlayRadius ?? 6} onChange={(e) => { b.props = b.props || {}; b.props.overlayRadius = Number(e.target.value) || 0; setConfig(cfg) }} />
                          </div>
                        </div>
                      </>
                    )}

                    {b.type === 'spacer' && (
                      <input type="number" min="0" value={b.props?.height || 24} onChange={(e) => { b.props = b.props || {}; b.props.height = Number(e.target.value) || 0; setConfig(cfg) }} />
                    )}

                    <button className="btn-outline" onClick={() => { const arr = cfg.customBlocks || []; const j = i - 1; if (j >= 0) { [arr[i], arr[j]] = [arr[j], arr[i]]; setConfig(cfg) } }}>↑</button>
                    <button className="btn-outline" onClick={() => { const arr = cfg.customBlocks || []; const j = i + 1; if (j < arr.length) { [arr[i], arr[j]] = [arr[j], arr[i]]; setConfig(cfg) } }}>↓</button>
                    <button className="btn-ghost" onClick={() => { if (confirm('تأكيد حذف البلوك؟')) { const arr = cfg.customBlocks || []; arr.splice(i, 1); setConfig(cfg) } }}>حذف</button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {active === 'data' && (
          <div className="panel">
            <div className="panel-header"><div className="panel-title">حفظ / تصدير</div><div className="panel-desc">إدارة النسخ والحفظ</div></div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn" onClick={handleSaveAndRefresh}>حفظ في المتصفح</button>
              <button className="btn-outline" onClick={() => downloadConfig(config)}>تنزيل JSON</button>
              <button className="btn-ghost" onClick={() => { localStorage.removeItem('siteConfig'); window.location.reload() }}>إعادة التعيين</button>
            </div>
          </div>
        )}

        {showPreview && (
          <div className="panel">
            <div className="panel-header"><div className="panel-title">معاينة الموقع</div><div className="panel-desc">احفظ أو فعّل المعاينة الفورية لتحديث الفور</div></div>
            <iframe className="preview-frame" src="/" ref={previewRef}></iframe>
          </div>
        )}
      </main>
    </div>
  )
}