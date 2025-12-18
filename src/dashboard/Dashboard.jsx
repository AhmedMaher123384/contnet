import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useConfig } from '../config/ConfigContext.jsx';
import { downloadConfig, saveConfigRemote, hasRemote } from '../config/configLoader.js';

// =============== مكونات مخصصة ===============
const ConfirmModal = ({ isOpen, onClose, onConfirm, message, confirmText = "تأكيد", cancelText = "إلغاء" }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', handleEsc);
      dialogRef.current?.focus();
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} ref={dialogRef} tabIndex="-1">
        <div className="modal-header">
          <h3>تأكيد الحذف</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>{cancelText}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const ColorInput = ({ label, value, onChange, required = false }) => {
  const [error, setError] = useState(false);
  const isValid = value && /^#[0-9A-F]{6}$/i.test(value);

  const handleChange = (v) => {
    const valid = /^#[0-9A-F]{6}$/i.test(v);
    setError(!valid && required);
    onChange(v);
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="color-wrapper">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => handleChange(e.target.value)}
          className={error ? 'input-error' : ''}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="#000000"
          className={`color-text-input ${error ? 'input-error' : ''}`}
          dir="ltr"
        />
      </div>
      {error && <span className="error-hint">يجب أن يكون لونًا صالحًا (مثل #FF0000)</span>}
    </div>
  );
};

const URLInput = ({ label, value, onChange, placeholder = '', dir = 'ltr', required = false }) => {
  const [error, setError] = useState(false);
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

  const validate = (v) => {
    if (!required && !v) return true;
    return v && urlRegex.test(v);
  };

  const handleChange = (v) => {
    const valid = validate(v);
    setError(!valid && required);
    onChange(v);
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="url-input-wrapper">
        <input
          type="url"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          className={error ? 'input-error' : ''}
        />
        <UploadImageButton onUpload={handleChange} />
      </div>
      {error && <span className="error-hint">رابط غير صالح</span>}
    </div>
  );
};

const UploadImageButton = ({ onUpload }) => {
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
      alert('الملف ليس صورة. يُرجى اختيار صورة (JPEG, PNG, GIF).');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = () => {
        onUpload(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('حدث خطأ أثناء قراءة الملف.');
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn-upload"
        onClick={() => fileInputRef.current?.click()}
        title="رفع صورة"
      >
        📤 رفع
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
    </>
  );
};

const TextInput = ({ label, value, onChange, dir, placeholder, required = false }) => {
  const [error, setError] = useState(false);

  const handleChange = (v) => {
    const valid = !required || v.trim() !== '';
    setError(!valid);
    onChange(v);
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        dir={dir}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="error-hint">هذا الحقل مطلوب</span>}
    </div>
  );
};

// =============== لوحة التحكم ===============
export default function Dashboard() {
  const { config, setConfig, t, lang, setLang, saveToBrowser } = useConfig();
  const [editLang, setEditLang] = useState(lang);
  const [active, setActive] = useState('theme');
  const [livePreview, setLivePreview] = useState(false);
  const [showPreview, setShowPreview] = useState(window.innerWidth > 768); // default hidden on mobile
  const [svcFilter, setSvcFilter] = useState('');
  const [linkFilter, setLinkFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, message: '' });

  const dir = editLang === 'ar' ? 'rtl' : 'ltr';
  const previewRef = useRef(null);

  const cfg = useMemo(() => (config ? JSON.parse(JSON.stringify(config)) : null), [config]);

  const refreshPreview = useCallback(() => {
    if (!showPreview || !previewRef.current) return;
    try {
      previewRef.current.contentWindow?.location.reload();
    } catch {}
  }, [showPreview]);

  // ======== وظائف التحديث ========
  const setTheme = (key, v) => { cfg.theme[key] = v; setConfig(cfg); };
  const setSiteText = (key, v) => { cfg.site[key][editLang] = v; setConfig(cfg); };
  const setSectionEnabled = (sec, v) => { cfg.sections[sec].enabled = v; setConfig(cfg); };
  const setSectionText = (sec, key, v) => { cfg.sections[sec][key][editLang] = v; setConfig(cfg); };
  const setSectionColor = (sec, key, v) => { cfg.sections[sec].colors[key] = v; setConfig(cfg); };
  const setNavbarColor = (key, v) => {
    cfg.sections.navbar = cfg.sections.navbar || { enabled: true, colors: {} };
    cfg.sections.navbar.colors[key] = v;
    setConfig(cfg);
  };
  const setFooterColor = (key, v) => {
    cfg.sections.footer = cfg.sections.footer || { enabled: true, colors: {} };
    cfg.sections.footer.colors[key] = v;
    setConfig(cfg);
  };
  const setHeroCTA = (key, v) => { cfg.sections.hero.cta[key][editLang] = v; setConfig(cfg); };
  const setAboutImage = (v) => { cfg.sections.about.image = v; setConfig(cfg); };

  // ======== مديريات المحتوى (مع تأكيد عبر Modal) ========
  const safeDelete = (callback, message) => {
    setConfirmModal({ isOpen: true, onConfirm: () => { callback(); setConfirmModal({ isOpen: false }); }, message });
  };

  const addService = () => {
    cfg.sections.services.items.push({
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      icon: '•',
    });
    setConfig(cfg);
  };
  const updateService = (i, field, v) => { cfg.sections.services.items[i][field][editLang] = v; setConfig(cfg); };
  const updateServiceIcon = (i, v) => { cfg.sections.services.items[i].icon = v; setConfig(cfg); };
  const removeService = (i) => {
    cfg.sections.services.items.splice(i, 1);
    setConfig(cfg);
  };
  const moveService = (i, dirMove) => {
    const j = dirMove === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= cfg.sections.services.items.length) return;
    [cfg.sections.services.items[i], cfg.sections.services.items[j]] = [cfg.sections.services.items[j], cfg.sections.services.items[i]];
    setConfig(cfg);
  };

  const addLink = () => {
    cfg.sections.contact.links.push({ label: { en: '', ar: '' }, url: '' });
    setConfig(cfg);
  };
  const updateLinkLabel = (i, v) => { cfg.sections.contact.links[i].label[editLang] = v; setConfig(cfg); };
  const updateLinkUrl = (i, v) => { cfg.sections.contact.links[i].url = v; setConfig(cfg); };
  const removeLink = (i) => {
    cfg.sections.contact.links.splice(i, 1);
    setConfig(cfg);
  };
  const moveLink = (i, dirMove) => {
    const j = dirMove === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= cfg.sections.contact.links.length) return;
    [cfg.sections.contact.links[i], cfg.sections.contact.links[j]] = [cfg.sections.contact.links[j], cfg.sections.contact.links[i]];
    setConfig(cfg);
  };

  const addNavLink = () => {
    cfg.site.menu = cfg.site.menu || [];
    cfg.site.menu.push({ label: { en: '', ar: '' }, href: '#' });
    setConfig(cfg);
  };
  const updateNavLabel = (i, v) => { cfg.site.menu[i].label[editLang] = v; setConfig(cfg); };
  const updateNavHref = (i, v) => { cfg.site.menu[i].href = v; setConfig(cfg); };
  const removeNav = (i) => {
    cfg.site.menu.splice(i, 1);
    setConfig(cfg);
  };
  const moveNav = (i, dirMove) => {
    const j = dirMove === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= (cfg.site.menu || []).length) return;
    [cfg.site.menu[i], cfg.site.menu[j]] = [cfg.site.menu[j], cfg.site.menu[i]];
    setConfig(cfg);
  };

  const ensureFooter = () => {
    cfg.sections.footer = cfg.sections.footer || {
      enabled: true,
      colors: {},
      main: { columns: [] },
      bottom: { text: { en: '', ar: '' } },
    };
  };

  const setFooterIncludeContact = (v) => { ensureFooter(); cfg.sections.footer.includeContact = v; setConfig(cfg); };
  const addFooterColumn = () => { ensureFooter(); cfg.sections.footer.main.columns.push({ title: { en: '', ar: '' }, links: [] }); setConfig(cfg); };
  const updateFooterColumnTitle = (i, v) => { ensureFooter(); cfg.sections.footer.main.columns[i].title[editLang] = v; setConfig(cfg); };
  const removeFooterColumn = (i) => { ensureFooter(); cfg.sections.footer.main.columns.splice(i, 1); setConfig(cfg); };
  const moveFooterColumn = (i, dirMove) => {
    ensureFooter();
    const j = dirMove === 'up' ? i - 1 : i + 1;
    const arr = cfg.sections.footer.main.columns;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setConfig(cfg);
  };
  const addFooterLink = (colIdx) => {
    ensureFooter();
    const col = cfg.sections.footer.main.columns[colIdx];
    (col.links = col.links || []).push({ label: { en: '', ar: '' }, href: '#' });
    setConfig(cfg);
  };
  const updateFooterLinkLabel = (colIdx, linkIdx, v) => {
    ensureFooter();
    cfg.sections.footer.main.columns[colIdx].links[linkIdx].label[editLang] = v;
    setConfig(cfg);
  };
  const updateFooterLinkHref = (colIdx, linkIdx, v) => {
    ensureFooter();
    cfg.sections.footer.main.columns[colIdx].links[linkIdx].href = v;
    setConfig(cfg);
  };
  const removeFooterLink = (colIdx, linkIdx) => {
    ensureFooter();
    cfg.sections.footer.main.columns[colIdx].links.splice(linkIdx, 1);
    setConfig(cfg);
  };
  const moveFooterLink = (colIdx, linkIdx, dirMove) => {
    ensureFooter();
    const arr = cfg.sections.footer.main.columns[colIdx].links;
    const j = dirMove === 'up' ? linkIdx - 1 : linkIdx + 1;
    if (j < 0 || j >= arr.length) return;
    [arr[linkIdx], arr[j]] = [arr[j], arr[linkIdx]];
    setConfig(cfg);
  };
  const updateFooterBottomText = (v) => {
    ensureFooter();
    cfg.sections.footer.bottom = cfg.sections.footer.bottom || { text: { en: '', ar: '' } };
    cfg.sections.footer.bottom.text[editLang] = v;
    setConfig(cfg);
  };

  // ======== حفظ ========
  const handleSaveAndRefresh = async () => {
    try {
      if (hasRemote) await saveConfigRemote(config);
      saveToBrowser();
      alert(hasRemote
        ? 'تم حفظ الإعدادات عالميًا (سيرفر) وبالمتصفح.'
        : 'تم الحفظ في المتصفح فقط.'
      );
    } catch (e) {
      console.error(e);
      alert('تعذّر الحفظ على السيرفر، تم الحفظ محليًا فقط.');
    } finally {
      refreshPreview();
    }
  };

  const handleRemoteSave = async () => {
    try {
      await saveConfigRemote(config);
      alert('تم حفظ الإعدادات على السيرفر بنجاح.');
    } catch (e) {
      console.error(e);
      alert('تعذّر الحفظ على السيرفر. تأكد من إعداد VITE_CONFIG_ENDPOINT.');
    } finally {
      refreshPreview();
    }
  };

  // ======== Live Preview ========
  useEffect(() => {
    if (livePreview && config) {
      try {
        localStorage.setItem('siteConfig', JSON.stringify(config));
      } catch {}
    }
  }, [config, livePreview]);

  if (!cfg) {
    return (
      <div className="dashboard-loading" dir={dir}>
        <div className="spinner"></div>
        <p>جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  const activeLabel = {
    theme: 'الألوان',
    hero: 'الهيرو',
    about: 'من نحن',
    services: 'الخدمات',
    contact: 'التواصل',
    footer: 'الفوتر',
    custom: 'محتوى مخصص',
    data: 'البيانات',
  }[active] || 'لوحة التحكم';

  return (
    <>
      <style jsx>{`
        :root {
          --burgundy: #6D0019;
          --burgundy-light: #8B0025;
          --burgundy-dark: #4A0011;
          --black: #111;
          --dark-gray: #2d2d2d;
          --gray: #444;
          --light-gray: #f5f5f7;
          --border: #e0e0e0;
          --success: #2e7d32;
          --warning: #f57c00;
          --danger: #c62828;
          --shadow-sm: 0 2px 6px rgba(0,0,0,0.05);
          --shadow: 0 4px 12px rgba(0,0,0,0.08);
          --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
          --radius: 12px;
          --radius-sm: 8px;
          --transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: ${dir === 'rtl' ? "'Cairo', system-ui" : "'Inter', system-ui"}, sans-serif;
          background-color: #fafafa;
          color: var(--black);
          line-height: 1.5;
        }

        .dashboard {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        /* Sidebar */
        .dashboard-sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: var(--transition);
          z-index: 100;
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
        }

        .dashboard-logo {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--burgundy);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dashboard-logo::before {
          content: "⚙️";
          font-size: 1.3em;
        }

        .dashboard-nav {
          flex: 1;
          padding: 12px 0;
          overflow-y: auto;
        }

        .nav-section {
          padding: 4px 16px 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-item {
          width: 100%;
          text-align: ${dir === 'rtl' ? 'right' : 'left'};
          padding: 12px 20px;
          border: none;
          background: none;
          color: var(--gray);
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: var(--transition);
        }

        .nav-item:hover,
        .nav-item.active {
          color: var(--burgundy);
          background: rgba(109, 0, 25, 0.04);
        }

        .nav-item.active {
          font-weight: 600;
          position: relative;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          ${dir === 'rtl' ? 'right' : 'left'}: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--burgundy);
          border-radius: 0 ${dir === 'rtl' ? '4px 0 0 4px' : '0 4px 4px 0'};
        }

        .sidebar-actions {
          padding: 16px;
          border-top: 1px solid var(--border);
          background: #fcfcfc;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          background: var(--burgundy);
          color: white;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 1.2rem;
          position: fixed;
          ${dir === 'rtl' ? 'right' : 'left'}: 16px;
          top: 16px;
          z-index: 200;
          box-shadow: var(--shadow);
        }

        /* Main Content */
        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          min-height: 0; /* يسمح بالتمرير داخل حاوية flex */
          background: #fafafa;
        }

        .dashboard-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 12px;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .badge {
          background: var(--burgundy);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Panels */
        .panel {
          background: white;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          margin: 16px 24px;
          padding: 24px;
          transition: var(--transition);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .panel-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--black);
        }

        .panel-desc {
          font-size: 0.9rem;
          color: var(--gray);
        }

        /* Forms */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 600;
          color: var(--black);
          font-size: 0.95rem;
        }

        input, select, button {
          font-family: inherit;
          font-size: 0.95rem;
        }

        input[type="text"],
        input[type="url"],
        input[type="number"],
        select {
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: white;
          transition: var(--transition);
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: var(--burgundy);
          box-shadow: 0 0 0 3px rgba(109, 0, 25, 0.15);
        }

        input.input-error {
          border-color: var(--danger) !important;
        }

        .error-hint {
          color: var(--danger);
          font-size: 0.8rem;
          margin-top: 4px;
        }

        /* Buttons */
        .btn {
          padding: 10px 18px;
          border-radius: var(--radius-sm);
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary {
          background: var(--burgundy);
          color: white;
        }

        .btn-primary:hover {
          background: var(--burgundy-dark);
          transform: translateY(-1px);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--gray);
        }

        .btn-outline:hover {
          border-color: var(--burgundy);
          color: var(--burgundy);
        }

        .btn-ghost {
          background: transparent;
          color: var(--gray);
        }

        .btn-ghost:hover {
          color: var(--burgundy);
        }

        .btn-danger {
          background: var(--danger);
          color: white;
        }

        .btn-danger:hover {
          opacity: 0.9;
        }

        .btn-upload {
          background: #f0f0f0;
          border: 1px dashed var(--border);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
        }

        /* Rows & Grids */
        .row-grid {
          display: grid;
          gap: 16px;
        }

        .row-2 { grid-template-columns: repeat(2, 1fr); }
        .row-3 { grid-template-columns: repeat(3, 1fr); }
        .row-4 { grid-template-columns: repeat(4, 1fr); }

        .row-cta {
          background: #fcfcfc;
          padding: 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        /* Color Inputs */
        .color-wrapper {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .color-text-input {
          flex: 1;
          padding: 8px 12px;
          font-family: monospace;
        }

        /* URL Inputs */
        .url-input-wrapper {
          display: flex;
          gap: 10px;
        }

        /* Preview */
        .preview-frame {
          width: 100%;
          height: 600px;
          border: none;
          border-radius: var(--radius-sm);
          background: white;
          box-shadow: var(--shadow);
        }

        /* Modals */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s;
        }

        .modal-content {
          background: white;
          border-radius: var(--radius);
          width: 90%;
          max-width: 500px;
          box-shadow: var(--shadow-lg);
          animation: scaleIn 0.25s;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--gray);
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body p {
          font-size: 1rem;
          line-height: 1.6;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
        }

        /* Loading */
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(109, 0, 25, 0.2);
          border-top: 4px solid var(--burgundy);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Chips & Badges */
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8f8f8;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          color: var(--gray);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard {
            flex-direction: column;
          }

          .dashboard-sidebar {
            position: fixed;
            top: 0;
            ${dir === 'rtl' ? 'right' : 'left'}: ${mobileMenuOpen ? '0' : '-100%'};
            height: 100vh;
            width: 85%;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
          }

          .mobile-menu-toggle {
            display: block;
          }

          .dashboard-main {
            margin-top: 64px;
          }

          .dashboard-topbar {
            padding: 14px 16px;
          }

          .form-grid,
          .row-2,
          .row-3,
          .row-4 {
            grid-template-columns: 1fr;
          }

          .panel {
            margin: 12px 12px;
            padding: 18px;
          }

          .preview-frame {
            height: 400px;
          }
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Modal التأكيد */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
      />

      {/* زر فتح القائمة على الموبايل */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="فتح القائمة"
      >
        ☰
      </button>

      <div className="dashboard" dir={dir}>
        {/* Sidebar */}
        <aside className="dashboard-sidebar" style={{ left: mobileMenuOpen ? '0' : '-100%' }}>
          <div className="sidebar-header">
            <div className="dashboard-logo">لوحة التحكم</div>
          </div>
          <nav className="dashboard-nav">
            <div className="nav-section">المظهر</div>
            <button
              className={`nav-item ${active === 'theme' ? 'active' : ''}`}
              onClick={() => { setActive('theme'); setMobileMenuOpen(false); }}
            >
              🎨 ألوان الثيم
            </button>

            <div className="nav-section">الأقسام</div>
            {['hero', 'about', 'services', 'contact', 'footer', 'custom'].map((key) => (
              <button
                key={key}
                className={`nav-item ${active === key ? 'active' : ''}`}
                onClick={() => { setActive(key); setMobileMenuOpen(false); }}
              >
                {key === 'hero' && '🖼️ الهيرو'}
                {key === 'about' && 'ℹ️ من نحن'}
                {key === 'services' && '🛠️ الخدمات'}
                {key === 'contact' && '📞 التواصل'}
                {key === 'footer' && '🔻 الفوتر'}
                {key === 'custom' && '🧩 مخصص'}
              </button>
            ))}

            <div className="nav-section">البيانات</div>
            <button
              className={`nav-item ${active === 'data' ? 'active' : ''}`}
              onClick={() => { setActive('data'); setMobileMenuOpen(false); }}
            >
              💾 حفظ / تصدير
            </button>
          </nav>

          <div className="sidebar-actions">
            <button className="btn btn-primary" onClick={handleSaveAndRefresh}>حفظ</button>
            <button className="btn btn-outline" onClick={() => downloadConfig(config)}>تنزيل JSON</button>
            <button className="btn btn-ghost" onClick={() => { localStorage.removeItem('siteConfig'); window.location.reload(); }}>
              إعادة التعيين
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-topbar">
            <div className="topbar-left">
              <span className="badge">القسم: {activeLabel}</span>
            </div>
            <div className="topbar-right">
              <button className="btn btn-outline" onClick={() => { window.location.hash = '#'; }}>
                عرض الموقع
              </button>
              <button className="btn btn-primary" onClick={handleSaveAndRefresh}>حفظ</button>
              <label className="chip">
                <input
                  type="checkbox"
                  checked={livePreview}
                  onChange={(e) => setLivePreview(e.target.checked)}
                />
                معاينة فورية
              </label>
              <button
                className="btn btn-ghost"
                onClick={() => setShowPreview(v => !v)}
              >
                {showPreview ? 'إخفاء المعاينة' : 'إظهار المعاينة'}
              </button>
            </div>
          </div>

          {/* General Settings */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">الإعدادات العامة</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>لغة العرض:</span>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="btn-outline">
                  <option value="en">EN</option>
                  <option value="ar">AR</option>
                </select>
                <span>تحرير بـ:</span>
                <select value={editLang} onChange={(e) => setEditLang(e.target.value)} className="btn-outline">
                  <option value="en">الإنجليزية</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <TextInput
                label="عنوان الموقع"
                value={cfg.site.title[editLang]}
                onChange={(v) => setSiteText('title', v)}
                dir={dir}
                placeholder={editLang === 'ar' ? 'مثال: شركة السمارت' : 'e.g., SmartCo'}
                required
              />
              <TextInput
                label="نص الفوتر"
                value={cfg.site.footerText[editLang]}
                onChange={(v) => setSiteText('footerText', v)}
                dir={dir}
                placeholder={editLang === 'ar' ? '© جميع الحقوق محفوظة' : '© All rights reserved'}
              />
            </div>

            <div className="panel-header" style={{ marginTop: 24 }}>
              <div className="panel-title">روابط النافبار <span className="badge">{(cfg.site.menu || []).length}</span></div>
              <button className="btn btn-outline" onClick={addNavLink}>إضافة رابط</button>
            </div>
            <div className="row-grid" style={{ marginTop: 12 }}>
              {(cfg.site.menu || []).map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                  <TextInput
                    label="الاسم"
                    value={l.label?.[editLang] || ''}
                    onChange={(v) => updateNavLabel(i, v)}
                    dir={dir}
                    placeholder={editLang === 'ar' ? 'اسم الرابط' : 'Link label'}
                  />
                  <URLInput
                    label="الرابط"
                    value={l.href || ''}
                    onChange={(v) => updateNavHref(i, v)}
                    placeholder="#about أو https://..."
                    required
                  />
                  <button className="btn btn-outline" onClick={() => moveNav(i, 'up')}>↑</button>
                  <button className="btn btn-outline" onClick={() => moveNav(i, 'down')}>↓</button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => safeDelete(() => removeNav(i), 'هل أنت متأكد من حذف هذا الرابط؟')}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Panel */}
          {active === 'theme' && (
            <>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">ألوان الثيم</div>
                  <div className="panel-desc">ألوان عامة تؤثر على الموقع</div>
                </div>
                <div className="row-grid row-2">
                  <ColorInput label="الأساسي" value={cfg.theme.primary} onChange={(v) => setTheme('primary', v)} required />
                  <ColorInput label="الثانوي" value={cfg.theme.secondary} onChange={(v) => setTheme('secondary', v)} />
                  <ColorInput label="الخلفية" value={cfg.theme.background} onChange={(v) => setTheme('background', v)} />
                  <ColorInput label="النص" value={cfg.theme.text} onChange={(v) => setTheme('text', v)} required />
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">ألوان الهيدر والفوتر</div>
                  <div className="panel-desc">تحكم مستقل في ألوان النافبار والفوتر</div>
                </div>
                <div className="row-grid row-2" style={{ marginTop: 16 }}>
                  <ColorInput label="خلفية الهيدر" value={(cfg.sections.navbar?.colors || {}).background || ''} onChange={(v) => setNavbarColor('background', v)} />
                  <ColorInput label="نص الهيدر" value={(cfg.sections.navbar?.colors || {}).text || ''} onChange={(v) => setNavbarColor('text', v)} required />
                  <ColorInput label="خلفية الفوتر" value={(cfg.sections.footer?.colors || {}).background || ''} onChange={(v) => setFooterColor('background', v)} />
                  <ColorInput label="نص الفوتر" value={(cfg.sections.footer?.colors || {}).text || ''} onChange={(v) => setFooterColor('text', v)} required />
                </div>
              </div>
            </>
          )}

          {/* Hero Panel */}
          {active === 'hero' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">الهيرو</div>
                <div className="panel-desc">العناوين، الصورة الخلفية، وألوان CTA</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <input
                  type="checkbox"
                  checked={cfg.sections.hero.enabled}
                  onChange={(e) => setSectionEnabled('hero', e.target.checked)}
                  id="hero-enabled"
                />
                <label htmlFor="hero-enabled" className="panel-desc">مفعّل</label>
              </div>

              <div className="form-grid">
                <TextInput
                  label="العنوان"
                  value={cfg.sections.hero.heading[editLang]}
                  onChange={(v) => setSectionText('hero', 'heading', v)}
                  dir={dir}
                  placeholder={editLang === 'ar' ? 'مثال: نَبني حلول رقمية' : 'e.g., We build digital solutions'}
                  required
                />
                <TextInput
                  label="العنوان الفرعي"
                  value={cfg.sections.hero.subheading[editLang]}
                  onChange={(v) => setSectionText('hero', 'subheading', v)}
                  dir={dir}
                  placeholder={editLang === 'ar' ? 'وصف مختصر جذاب' : 'Short catchy subheading'}
                />
                <TextInput
                  label="نص الزر"
                  value={cfg.sections.hero.cta.text[editLang]}
                  onChange={(v) => setHeroCTA('text', v)}
                  dir={dir}
                  placeholder={editLang === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                  required
                />
                <URLInput
                  label="رابط الزر"
                  value={cfg.sections.hero.cta.link}
                  onChange={(v) => { cfg.sections.hero.cta.link = v; setConfig(cfg); }}
                  placeholder={editLang === 'ar' ? 'https://...' : 'https://...'}
                  required
                />
                <URLInput
                  label="صورة الخلفية"
                  value={cfg.sections.hero.backgroundImage || ''}
                  onChange={(v) => { cfg.sections.hero.backgroundImage = v; setConfig(cfg); }}
                  placeholder={editLang === 'ar' ? 'رابط الصورة أو ارفع ملفًا' : 'Background image URL or upload'}
                />
              </div>

              <div className="panel-header" style={{ marginTop: 24 }}>
                <div className="panel-title">الألوان</div>
              </div>
              <div className="row-grid row-3" style={{ marginTop: 12 }}>
                <ColorInput label="الأساسي" value={cfg.sections.hero.colors.primary || ''} onChange={(v) => setSectionColor('hero', 'primary', v)} />
                <ColorInput label="الثانوي" value={cfg.sections.hero.colors.secondary || ''} onChange={(v) => setSectionColor('hero', 'secondary', v)} />
                <ColorInput label="خلفية النص" value={cfg.sections.hero.colors.background || ''} onChange={(v) => setSectionColor('hero', 'background', v)} />
                <ColorInput label="لون النص" value={cfg.sections.hero.colors.text || ''} onChange={(v) => setSectionColor('hero', 'text', v)} required />
                <ColorInput label="خلفية الزر" value={cfg.sections.hero.colors.ctaBg || ''} onChange={(v) => setSectionColor('hero', 'ctaBg', v)} required />
                <ColorInput label="نص الزر" value={cfg.sections.hero.colors.ctaText || ''} onChange={(v) => setSectionColor('hero', 'ctaText', v)} required />
              </div>
            </div>
          )}

          {/* About Panel */}
          {active === 'about' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">من نحن</div>
                <div className="panel-desc">العنوان، الفقرات، والصورة</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <input
                  type="checkbox"
                  checked={cfg.sections.about.enabled}
                  onChange={(e) => setSectionEnabled('about', e.target.checked)}
                  id="about-enabled"
                />
                <label htmlFor="about-enabled" className="panel-desc">مفعّل</label>
              </div>

              <TextInput
                label="العنوان"
                value={cfg.sections.about.heading[editLang]}
                onChange={(v) => setSectionText('about', 'heading', v)}
                dir={dir}
                placeholder={editLang === 'ar' ? 'من نحن' : 'About Us'}
                required
              />

              <div className="panel-header" style={{ marginTop: 20 }}>
                <div className="panel-title">الفقرات</div>
              </div>
              <div className="row-grid" style={{ marginTop: 12 }}>
                {(cfg.sections.about.paragraphs || []).map((p, i) => (
                  <TextInput
                    key={i}
                    label={`فقرة ${i + 1}`}
                    value={p[editLang] || ''}
                    onChange={(v) => { cfg.sections.about.paragraphs[i][editLang] = v; setConfig(cfg); }}
                    dir={dir}
                    placeholder={editLang === 'ar' ? 'نص الفقرة...' : 'Paragraph text...'}
                    required
                  />
                ))}
              </div>

              <div className="panel-header" style={{ marginTop: 20 }}>
                <div className="panel-title">الصورة</div>
              </div>
              <URLInput
                label="رابط الصورة"
                value={cfg.sections.about.image || ''}
                onChange={(v) => setAboutImage(v)}
                placeholder={editLang === 'ar' ? 'رابط صورة أو ارفع ملفًا' : 'Image URL or upload'}
              />

              <div className="panel-header" style={{ marginTop: 20 }}>
                <div className="panel-title">الألوان</div>
              </div>
              <div className="row-grid row-2" style={{ marginTop: 12 }}>
                <ColorInput label="الأساسي" value={cfg.sections.about.colors.primary || ''} onChange={(v) => setSectionColor('about', 'primary', v)} />
                <ColorInput label="الثانوي" value={cfg.sections.about.colors.secondary || ''} onChange={(v) => setSectionColor('about', 'secondary', v)} />
                <ColorInput label="الخلفية" value={cfg.sections.about.colors.background || ''} onChange={(v) => setSectionColor('about', 'background', v)} />
                <ColorInput label="النص" value={cfg.sections.about.colors.text || ''} onChange={(v) => setSectionColor('about', 'text', v)} required />
              </div>
            </div>
          )}

          {/* Services Panel */}
          {active === 'services' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  الخدمات <span className="badge">{cfg.sections.services.items.length}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="text"
                    dir={dir}
                    placeholder={editLang === 'ar' ? 'بحث...' : 'Search...'}
                    value={svcFilter}
                    onChange={(e) => setSvcFilter(e.target.value)}
                    className="btn-outline"
                    style={{ padding: '8px 12px', width: '180px' }}
                  />
                  <button className="btn btn-outline" onClick={addService}>إضافة خدمة</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <input
                  type="checkbox"
                  checked={cfg.sections.services.enabled}
                  onChange={(e) => setSectionEnabled('services', e.target.checked)}
                  id="services-enabled"
                />
                <label htmlFor="services-enabled" className="panel-desc">مفعّل</label>
              </div>

              <TextInput
                label="العنوان"
                value={cfg.sections.services.heading[editLang]}
                onChange={(v) => setSectionText('services', 'heading', v)}
                dir={dir}
                placeholder={editLang === 'ar' ? 'خدماتنا' : 'Our Services'}
                required
              />

              <div className="row-grid" style={{ marginTop: 20 }}>
                {cfg.sections.services.items
                  .map((svc, i) => ({ svc, i }))
                  .filter(({ svc }) => {
                    const q = svcFilter.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      (svc.title[editLang] || '').toLowerCase().includes(q) ||
                      (svc.description[editLang] || '').toLowerCase().includes(q) ||
                      (svc.icon || '').toLowerCase().includes(q)
                    );
                  })
                  .map(({ svc, i }) => (
                    <div key={i} className="row-cta">
                      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={svc.icon}
                          onChange={(e) => updateServiceIcon(i, e.target.value)}
                          style={{ textAlign: 'center', fontSize: '1.5rem' }}
                          placeholder="•"
                        />
                        <TextInput
                          label="العنوان"
                          value={svc.title[editLang] || ''}
                          onChange={(v) => updateService(i, 'title', v)}
                          dir={dir}
                          placeholder={editLang === 'ar' ? 'عنوان الخدمة' : 'Service title'}
                          required
                        />
                        <TextInput
                          label="الوصف"
                          value={svc.description[editLang] || ''}
                          onChange={(v) => updateService(i, 'description', v)}
                          dir={dir}
                          placeholder={editLang === 'ar' ? 'وصف مختصر' : 'Short description'}
                        />
                        <button className="btn btn-outline" onClick={() => moveService(i, 'up')}>↑</button>
                        <button className="btn btn-outline" onClick={() => moveService(i, 'down')}>↓</button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => safeDelete(() => removeService(i), 'هل أنت متأكد من حذف هذه الخدمة؟')}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="panel-header" style={{ marginTop: 24 }}>
                <div className="panel-title">الألوان</div>
              </div>
              <div className="row-grid row-2" style={{ marginTop: 12 }}>
                <ColorInput label="الأساسي" value={cfg.sections.services.colors.primary || ''} onChange={(v) => setSectionColor('services', 'primary', v)} />
                <ColorInput label="الثانوي" value={cfg.sections.services.colors.secondary || ''} onChange={(v) => setSectionColor('services', 'secondary', v)} />
                <ColorInput label="الخلفية" value={cfg.sections.services.colors.background || ''} onChange={(v) => setSectionColor('services', 'background', v)} />
                <ColorInput label="النص" value={cfg.sections.services.colors.text || ''} onChange={(v) => setSectionColor('services', 'text', v)} required />
              </div>
            </div>
          )}

          {/* Contact Panel */}
          {active === 'contact' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  التواصل <span className="badge">{cfg.sections.contact.links.length}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="text"
                    dir={dir}
                    placeholder={editLang === 'ar' ? 'بحث...' : 'Search...'}
                    value={linkFilter}
                    onChange={(e) => setLinkFilter(e.target.value)}
                    className="btn-outline"
                    style={{ padding: '8px 12px', width: '180px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <input
                  type="checkbox"
                  checked={cfg.sections.contact.enabled}
                  onChange={(e) => setSectionEnabled('contact', e.target.checked)}
                  id="contact-enabled"
                />
                <label htmlFor="contact-enabled" className="panel-desc">مفعّل</label>
              </div>

              <div className="form-grid">
                <TextInput
                  label="العنوان"
                  value={cfg.sections.contact.heading[editLang]}
                  onChange={(v) => setSectionText('contact', 'heading', v)}
                  dir={dir}
                  placeholder={editLang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  required
                />
                <TextInput
                  label="البريد"
                  value={cfg.sections.contact.email || ''}
                  onChange={(v) => { cfg.sections.contact.email = v; setConfig(cfg); }}
                  dir="ltr"
                  placeholder="email@example.com"
                  required
                />
                <TextInput
                  label="الهاتف"
                  value={cfg.sections.contact.phone || ''}
                  onChange={(v) => { cfg.sections.contact.phone = v; setConfig(cfg); }}
                  dir="ltr"
                  placeholder="+201234567890"
                />
                <TextInput
                  label="العنوان"
                  value={cfg.sections.contact.address[editLang] || ''}
                  onChange={(v) => { cfg.sections.contact.address[editLang] = v; setConfig(cfg); }}
                  dir={dir}
                  placeholder={editLang === 'ar' ? 'اكتب العنوان' : 'Write address'}
                />
              </div>

              <div className="panel-header" style={{ marginTop: 24 }}>
                <div className="panel-title">روابط إضافية</div>
                <button className="btn btn-outline" onClick={addLink}>إضافة رابط</button>
              </div>
              <div className="row-grid" style={{ marginTop: 12 }}>
                {cfg.sections.contact.links
                  .map((l, i) => ({ l, i }))
                  .filter(({ l }) => {
                    const q = linkFilter.trim().toLowerCase();
                    if (!q) return true;
                    return (l.label[editLang] || '').toLowerCase().includes(q) || (l.url || '').toLowerCase().includes(q);
                  })
                  .map(({ l, i }) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                      <TextInput
                        label="الاسم"
                        value={l.label[editLang] || ''}
                        onChange={(v) => updateLinkLabel(i, v)}
                        dir={dir}
                        placeholder={editLang === 'ar' ? 'اسم الرابط' : 'Link label'}
                        required
                      />
                      <URLInput
                        label="الرابط"
                        value={l.url || ''}
                        onChange={(v) => updateLinkUrl(i, v)}
                        placeholder="https://..."
                        required
                      />
                      <button className="btn btn-outline" onClick={() => moveLink(i, 'up')}>↑</button>
                      <button className="btn btn-outline" onClick={() => moveLink(i, 'down')}>↓</button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => safeDelete(() => removeLink(i), 'هل أنت متأكد من حذف هذا الرابط؟')}
                      >
                        حذف
                      </button>
                    </div>
                  ))}
              </div>

              <div className="panel-header" style={{ marginTop: 24 }}>
                <div className="panel-title">الألوان</div>
              </div>
              <div className="row-grid row-2" style={{ marginTop: 12 }}>
                <ColorInput label="الأساسي" value={cfg.sections.contact.colors.primary || ''} onChange={(v) => setSectionColor('contact', 'primary', v)} />
                <ColorInput label="الثانوي" value={cfg.sections.contact.colors.secondary || ''} onChange={(v) => setSectionColor('contact', 'secondary', v)} />
                <ColorInput label="الخلفية" value={cfg.sections.contact.colors.background || ''} onChange={(v) => setSectionColor('contact', 'background', v)} />
                <ColorInput label="النص" value={cfg.sections.contact.colors.text || ''} onChange={(v) => setSectionColor('contact', 'text', v)} required />
              </div>
            </div>
          )}

          {/* Footer Panel */}
          {active === 'footer' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  الفوتر <span className="badge">{(cfg.sections.footer?.main?.columns || []).length}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="chip">
                    <input
                      type="checkbox"
                      checked={(cfg.sections.footer?.enabled ?? true)}
                      onChange={(e) => setSectionEnabled('footer', e.target.checked)}
                    />
                    مفعّل
                  </label>
                  <label className="chip">
                    <input
                      type="checkbox"
                      checked={(cfg.sections.footer?.includeContact ?? true)}
                      onChange={(e) => setFooterIncludeContact(e.target.checked)}
                    />
                    تضمين التواصل
                  </label>
                  <button className="btn btn-outline" onClick={addFooterColumn}>إضافة عمود</button>
                </div>
              </div>

              <div className="row-grid" style={{ marginTop: 16 }}>
                {(cfg.sections.footer?.main?.columns || []).map((col, i) => (
                  <div key={i} className="panel" style={{ padding: '16px', marginBottom: 0 }}>
                    <div className="panel-header">
                      <div className="panel-title">عمود {i + 1}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline" onClick={() => moveFooterColumn(i, 'up')}>↑</button>
                        <button className="btn btn-outline" onClick={() => moveFooterColumn(i, 'down')}>↓</button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => safeDelete(() => removeFooterColumn(i), 'هل أنت متأكد من حذف هذا العمود؟')}
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <TextInput
                      label="العنوان"
                      value={col.title?.[editLang] || ''}
                      onChange={(v) => updateFooterColumnTitle(i, v)}
                      dir={dir}
                      placeholder={editLang === 'ar' ? 'مثال: الشركة' : 'e.g., Company'}
                      required
                    />

                    <div className="panel-header" style={{ marginTop: 16 }}>
                      <div className="panel-title">
                        روابط <span className="badge">{(col.links || []).length}</span>
                      </div>
                      <button className="btn btn-outline" onClick={() => addFooterLink(i)}>إضافة رابط</button>
                    </div>

                    <div className="row-grid" style={{ marginTop: 12 }}>
                      {(col.links || []).map((l, j) => (
                        <div key={j} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                          <TextInput
                            label="الاسم"
                            value={l.label?.[editLang] || ''}
                            onChange={(e) => updateFooterLinkLabel(i, j, e.target.value)}
                            dir={dir}
                            placeholder={editLang === 'ar' ? 'اسم الرابط' : 'Link label'}
                            required
                          />
                          <URLInput
                            label="الرابط"
                            value={l.href || ''}
                            onChange={(e) => updateFooterLinkHref(i, j, e.target.value)}
                            placeholder="# أو https://..."
                            required
                          />
                          <button className="btn btn-outline" onClick={() => moveFooterLink(i, j, 'up')}>↑</button>
                          <button className="btn btn-outline" onClick={() => moveFooterLink(i, j, 'down')}>↓</button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => safeDelete(() => removeFooterLink(i, j), 'هل أنت متأكد من حذف هذا الرابط؟')}
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="panel" style={{ marginTop: 20 }}>
                <div className="panel-header">
                  <div className="panel-title">الشريط السفلي</div>
                </div>
                <TextInput
                  label="النص"
                  value={(cfg.sections.footer?.bottom?.text?.[editLang] || '')}
                  onChange={(v) => updateFooterBottomText(v)}
                  dir={dir}
                  placeholder={editLang === 'ar' ? 'مثال: جميع الحقوق محفوظة' : 'e.g., All rights reserved'}
                  required
                />
              </div>
            </div>
          )}

          {/* Custom Blocks Panel */}
          {active === 'custom' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  المحتوى المخصص <span className="badge">{(cfg.customBlocks || []).length}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="text"
                    dir={dir}
                    placeholder={editLang === 'ar' ? 'بحث...' : 'Search...'}
                    value={blockFilter}
                    onChange={(e) => setBlockFilter(e.target.value)}
                    className="btn-outline"
                    style={{ padding: '8px 12px', width: '180px' }}
                  />
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      const arr = cfg.customBlocks || (cfg.customBlocks = []);
                      arr.push({
                        enabled: true,
                        type: 'text',
                        position: 'afterHero',
                        props: { text: { en: '', ar: '' }, align: 'center' },
                      });
                      setConfig(cfg);
                    }}
                  >
                    إضافة بلوك
                  </button>
                </div>
              </div>

              <div className="row-grid" style={{ marginTop: 16 }}>
                {(cfg.customBlocks || [])
                  .map((b, i) => ({ b, i }))
                  .filter(({ b }) => {
                    const q = blockFilter.trim().toLowerCase();
                    if (!q) return true;
                    const txt = (b.props?.text?.[editLang] || '').toLowerCase();
                    return (
                      b.type.toLowerCase().includes(q) ||
                      (b.position || '').toLowerCase().includes(q) ||
                      txt.includes(q)
                    );
                  })
                  .map(({ b, i }) => (
                    <div key={i} className="row-cta" style={{ padding: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'center' }}>
                        <select
                          value={b.type}
                          onChange={(e) => { b.type = e.target.value; setConfig(cfg); }}
                          className="btn-outline"
                        >
                          <option value="text">نص</option>
                          <option value="button">زر</option>
                          <option value="image">صورة</option>
                          <option value="spacer">مسافة</option>
                        </select>

                        <select
                          value={b.position}
                          onChange={(e) => { b.position = e.target.value; setConfig(cfg); }}
                          className="btn-outline"
                        >
                          <option value="beforeHero">قبل الهيرو</option>
                          <option value="afterHero">بعد الهيرو</option>
                          <option value="beforeAbout">قبل من نحن</option>
                          <option value="afterAbout">بعد من نحن</option>
                          <option value="beforeServices">قبل الخدمات</option>
                          <option value="afterServices">بعد الخدمات</option>
                          <option value="beforeContact">قبل التواصل</option>
                          <option value="afterContact">بعد التواصل</option>
                        </select>

                        <select
                          value={b.props?.align || 'center'}
                          onChange={(e) => { b.props = b.props || {}; b.props.align = e.target.value; setConfig(cfg); }}
                          className="btn-outline"
                        >
                          <option value="left">يسار</option>
                          <option value="center">منتصف</option>
                          <option value="right">يمين</option>
                        </select>

                        {/* حقول حسب النوع */}
                        {b.type === 'text' && (
                          <TextInput
                            label="النص"
                            value={b.props?.text?.[editLang] || ''}
                            onChange={(v) => {
                              b.props = b.props || {};
                              b.props.text = b.props.text || { en: '', ar: '' };
                              b.props.text[editLang] = v;
                              setConfig(cfg);
                            }}
                            dir={dir}
                            placeholder={editLang === 'ar' ? 'نص البلوك' : 'Block text'}
                            required
                          />
                        )}

                        {b.type === 'button' && (
                          <>
                            <TextInput
                              label="نص الزر"
                              value={b.props?.text?.[editLang] || ''}
                              onChange={(v) => {
                                b.props = b.props || {};
                                b.props.text = b.props.text || { en: '', ar: '' };
                                b.props.text[editLang] = v;
                                setConfig(cfg);
                              }}
                              dir={dir}
                              placeholder={editLang === 'ar' ? 'نص الزر' : 'Button text'}
                              required
                            />
                            <URLInput
                              label="الرابط"
                              value={b.props?.link || ''}
                              onChange={(v) => {
                                b.props = b.props || {};
                                b.props.link = v;
                                setConfig(cfg);
                              }}
                              placeholder="https://..."
                              required
                            />
                          </>
                        )}

                        {b.type === 'image' && (
                          <>
                            <URLInput
                              label="رابط الصورة"
                              value={b.props?.src || ''}
                              onChange={(v) => {
                                b.props = b.props || {};
                                b.props.src = v;
                                setConfig(cfg);
                              }}
                              placeholder={editLang === 'ar' ? 'رابط أو رفع' : 'URL or upload'}
                              required
                            />
                            <TextInput
                              label="نص بديل"
                              value={b.props?.alt?.[editLang] || ''}
                              onChange={(v) => {
                                b.props = b.props || {};
                                b.props.alt = b.props.alt || { en: '', ar: '' };
                                b.props.alt[editLang] = v;
                                setConfig(cfg);
                              }}
                              dir={dir}
                              placeholder={editLang === 'ar' ? 'للمكفوفين' : 'Alt text'}
                            />
                          </>
                        )}

                        {b.type === 'spacer' && (
                          <div className="form-group">
                            <label>الارتفاع (px)</label>
                            <input
                              type="number"
                              min="0"
                              value={b.props?.height || 24}
                              onChange={(e) => {
                                b.props = b.props || {};
                                b.props.height = Number(e.target.value) || 0;
                                setConfig(cfg);
                              }}
                              className="btn-outline"
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button className="btn btn-outline" onClick={() => {
                            const arr = cfg.customBlocks || [];
                            const j = i - 1;
                            if (j >= 0) { [arr[i], arr[j]] = [arr[j], arr[i]]; setConfig(cfg); }
                          }}>↑</button>
                          <button className="btn btn-outline" onClick={() => {
                            const arr = cfg.customBlocks || [];
                            const j = i + 1;
                            if (j < arr.length) { [arr[i], arr[j]] = [arr[j], arr[i]]; setConfig(cfg); }
                          }}>↓</button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => safeDelete(() => {
                              const arr = cfg.customBlocks || [];
                              arr.splice(i, 1);
                              setConfig(cfg);
                            }, 'هل أنت متأكد من حذف هذا البلوك؟')}
                          >
                            حذف
                          </button>
                        </div>
                      </div>

                      {/* إعدادات متقدمة للصورة */}
                      {b.type === 'image' && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                          <div className="panel-header">
                            <div className="panel-title">إعدادات متقدمة</div>
                          </div>
                          <div className="form-grid" style={{ marginTop: 12 }}>
                            <div className="form-group">
                              <label>العرض</label>
                              <input
                                type="text"
                                value={b.props?.width ?? ''}
                                onChange={(e) => { b.props = b.props || {}; b.props.width = e.target.value; setConfig(cfg); }}
                                placeholder="100% أو 600px"
                                dir="ltr"
                              />
                            </div>
                            <div className="form-group">
                              <label>الطول</label>
                              <input
                                type="text"
                                value={b.props?.height ?? ''}
                                onChange={(e) => { b.props = b.props || {}; b.props.height = e.target.value; setConfig(cfg); }}
                                placeholder="auto أو 400px"
                                dir="ltr"
                              />
                            </div>
                            <div className="form-group">
                              <label>المقاس</label>
                              <select
                                value={b.props?.objectFit || 'contain'}
                                onChange={(e) => { b.props = b.props || {}; b.props.objectFit = e.target.value; setConfig(cfg); }}
                                className="btn-outline"
                              >
                                <option value="contain">contain</option>
                                <option value="cover">cover</option>
                                <option value="fill">fill</option>
                                <option value="scale-down">scale-down</option>
                                <option value="none">none</option>
                              </select>
                            </div>
                            <TextInput
                              label="نص فوق الصورة"
                              value={b.props?.overlayText?.[editLang] || ''}
                              onChange={(v) => {
                                b.props = b.props || {};
                                b.props.overlayText = b.props.overlayText || { en: '', ar: '' };
                                b.props.overlayText[editLang] = v;
                                setConfig(cfg);
                              }}
                              dir={dir}
                              placeholder={editLang === 'ar' ? 'اختياري' : 'Optional'}
                            />
                            <ColorInput
                              label="لون نص التغطية"
                              value={b.props?.overlayColor || '#ffffff'}
                              onChange={(v) => { b.props = b.props || {}; b.props.overlayColor = v; setConfig(cfg); }}
                            />
                            <ColorInput
                              label="خلفية التغطية"
                              value={b.props?.overlayBg ?? 'rgba(0,0,0,0.5)'}
                              onChange={(v) => { b.props = b.props || {}; b.props.overlayBg = v; setConfig(cfg); }}
                            />
                            <div className="form-group">
                              <label>Padding (px)</label>
                              <input
                                type="number"
                                min="0"
                                value={b.props?.overlayPadding ?? 8}
                                onChange={(e) => { b.props = b.props || {}; b.props.overlayPadding = Number(e.target.value) || 0; setConfig(cfg); }}
                                className="btn-outline"
                              />
                            </div>
                            <div className="form-group">
                              <label>زاوية الحواف (px)</label>
                              <input
                                type="number"
                                min="0"
                                value={b.props?.overlayRadius ?? 6}
                                onChange={(e) => { b.props = b.props || {}; b.props.overlayRadius = Number(e.target.value) || 0; setConfig(cfg); }}
                                className="btn-outline"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Data Panel */}
          {active === 'data' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">حفظ وتصدير</div>
                <div className="panel-desc">إدارة النسخ الاحتياطية</div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleSaveAndRefresh}>حفظ في المتصفح</button>
                {hasRemote && (
                  <button className="btn btn-outline" onClick={handleRemoteSave}>حفظ على السيرفر</button>
                )}
                <button className="btn btn-outline" onClick={() => downloadConfig(config)}>تنزيل JSON</button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    if (confirm('هل أنت متأكد؟ سيتم مسح الإعدادات وتحديث الصفحة.')) {
                      localStorage.removeItem('siteConfig');
                      window.location.reload();
                    }
                  }}
                >
                  إعادة تعيين
                </button>
              </div>
              <div className="panel" style={{ marginTop: 20 }}>
                <div className="panel-header">
                  <div className="panel-title">استيراد</div>
                </div>
                <label className="btn btn-outline" style={{ display: 'inline-flex', gap: 8, cursor: 'pointer' }}>
                  📤 تحميل ملف JSON
                  <input
                    type="file"
                    accept="application/json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      try {
                        const obj = JSON.parse(text);
                        setConfig(obj);
                        alert('تم تحميل JSON بنجاح.');
                      } catch {
                        alert('ملف JSON غير صالح');
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Live Preview */}
          {showPreview && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">معاينة حية</div>
                <div className="panel-desc">
                  {livePreview ? '✅ التحديث تلقائي' : 'اضغط "حفظ" لتحديث المعاينة'}
                </div>
              </div>
              <iframe
                className="preview-frame"
                src="/"
                ref={previewRef}
                title="معاينة الموقع"
              ></iframe>
            </div>
          )}
        </main>
      </div>
    </>
  );
}