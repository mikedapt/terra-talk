import { useState, useEffect, useRef } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

const COLOR_VARS = {
  'Backgrounds': [
    { var: '--bg-base',        label: 'Page Background',   light: '#dfded9', dark: '#111214' },
    { var: '--bg-surface',     label: 'Surface / Cards',   light: '#ffffff', dark: '#1c1e21' },
    { var: '--bg-header',      label: 'Header',            light: '#1e4d1a', dark: '#0f2b0c' },
    { var: '--bg-header-mid',  label: 'Header Mid',        light: '#2a6122', dark: '#163a12' },
    { var: '--bg-section-hd',  label: 'Section Header',    light: '#2d5e27', dark: '#1a3d16' },
    { var: '--bg-hover',       label: 'Hover State',       light: '#f7f8fa', dark: '#242628' },
    { var: '--bg-sidebar',     label: 'Sidebar',           light: '#ffffff', dark: '#1c1e21' },
    { var: '--bg-input',       label: 'Input Background',  light: '#ffffff', dark: '#242628' },
    { var: '--bg-post-op',     label: 'OP Post Highlight', light: '#f0f7ee', dark: '#1a2e18' },
    { var: '--policy-card-bg', label: 'Policy Card',       light: '#f0f2f5', dark: '#272727' },
  ],
  'Text': [
    { var: '--text-primary',   label: 'Primary Text',      light: '#1a1a1a', dark: '#e4e6eb' },
    { var: '--text-secondary', label: 'Secondary Text',    light: '#555555', dark: '#b0b3b8' },
    { var: '--text-muted',     label: 'Muted Text',        light: '#888888', dark: '#6e7176' },
    { var: '--text-header',    label: 'Header Text',       light: '#ffffff', dark: '#e4e6eb' },
  ],
  'Borders': [
    { var: '--border',         label: 'Border',            light: '#e2e5ea', dark: '#2d3035' },
    { var: '--border-light',   label: 'Light Border',      light: '#eef0f3', dark: '#242628' },
  ],
  'Accent': [
    { var: '--accent',         label: 'Accent',            light: '#3d8c35', dark: '#5cb85c' },
    { var: '--accent-hover',   label: 'Accent Hover',      light: '#2e6e28', dark: '#4cae4c' },
    { var: '--accent-light',   label: 'Accent Light',      light: '#e8f5e3', dark: '#1a3018' },
  ],
  'Pins': [
    { var: '--pin-bg',         label: 'Pin Background',    light: '#fffbea', dark: '#2a2510' },
    { var: '--pin-border',     label: 'Pin Border',        light: '#f5e27a', dark: '#5a4e20' },
  ],
  'Badges': [
    { var: '--badge-admin-bg',  label: 'Admin Badge',      light: '#c0392b', dark: '#c0392b' },
    { var: '--badge-mod-bg',    label: 'Mod Badge',        light: '#2980b9', dark: '#2471a3' },
    { var: '--badge-member-bg', label: 'Member Badge',     light: '#7f8c8d', dark: '#4a4f55' },
  ],
};

function buildDefaultColors(themeKey) {
  const result = {};
  Object.values(COLOR_VARS).flat().forEach(({ var: v, [themeKey]: def }) => {
    result[v] = def;
  });
  return result;
}

function loadSavedColors(themeKey) {
  try {
    const saved = localStorage.getItem(`themeColors_${themeKey}`);
    if (saved) return { ...buildDefaultColors(themeKey), ...JSON.parse(saved) };
  } catch {}
  return buildDefaultColors(themeKey);
}

function applyColorsToDOM(lightColors, darkColors) {
  const toVars = (colors) =>
    Object.entries(colors).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  let tag = document.getElementById('theme-color-override');
  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'theme-color-override';
    document.head.appendChild(tag);
  }
  tag.textContent = `.light {\n${toVars(lightColors)}\n}\n.dark {\n${toVars(darkColors)}\n}`;
}

function buildHexDrafts(lightColors, darkColors) {
  const drafts = {};
  Object.values(COLOR_VARS).flat().forEach(({ var: v }) => {
    drafts[`light_${v}`] = lightColors[v];
    drafts[`dark_${v}`] = darkColors[v];
  });
  return drafts;
}

export default function TermsOfService({ onNavigate }) {

  const { user, token } = useAuth();

  const [catform, setCatForm] = useState({ catname: "", catdesc: "", catauthor: user.id});
  const [topform, setTopForm] = useState({ topname: "", topdesc: "", topcat: "", topicon: "💬", topcolor: "#4CAF50", topauthor: user.id});
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("");
  const [quicklinks, setQuicklinks] = useState([]);
  const [qlform, setQlForm] = useState({ qltitle: '', qlicon: '📋', qllink: '' });
  const [qlStatus, setQlStatus] = useState('');
  const [hexDraft, setHexDraft] = useState(topform.topcolor);

  const [lightColors, setLightColors] = useState(() => loadSavedColors('light'));
  const [darkColors, setDarkColors] = useState(() => loadSavedColors('dark'));
  const [themeHexDrafts, setThemeHexDrafts] = useState(() => buildHexDrafts(loadSavedColors('light'), loadSavedColors('dark')));
  const [colorStatus, setColorStatus] = useState('');
  const [activeThemeTab, setActiveThemeTab] = useState('light');

  const [headerTitle, setHeaderTitle] = useState(() => localStorage.getItem('siteTitle') || 'TerraTalk');
  const [headerTagline, setHeaderTagline] = useState(() => localStorage.getItem('siteTagline') || 'Your world. Your voice.');
  const [headerStatus, setHeaderStatus] = useState('');

  const [serverAddress, setServerAddress] = useState(() => localStorage.getItem('serverAddress') || 'play.yourserver.net');
  const [serverVersions, setServerVersions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('serverVersions')) || ['Java 1.21.4', 'Bedrock 1.21.x']; }
    catch { return ['Java 1.21.4', 'Bedrock 1.21.x']; }
  });
  const [serverOnline, setServerOnline] = useState(() => localStorage.getItem('serverOnline') !== 'false');
  const [newVersionTag, setNewVersionTag] = useState('');
  const [serverInfoStatus, setServerInfoStatus] = useState('');

  const logoFileInputRef = useRef(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(() => localStorage.getItem('siteLogoUrl') || null);
  const [logoHidden, setLogoHidden] = useState(() => localStorage.getItem('logoHidden') === 'true');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoStatus, setLogoStatus] = useState(null);

  const capitalize = str => str[0].toUpperCase() + str.slice(1);


  //Handle Hex inputting
  // Swatch picker: always a valid value, so commit it straight through
  const handleColorPick = (e) => {
    setHexDraft(e.target.value);
    handleChange(e);            // name="topcolor" routes to topform already
  };

  // Typing: keep the draft freely editable, commit only when it's complete
  const handleHexType = (e) => {
    let value = e.target.value.trim();
    if (value && !value.startsWith("#")) value = "#" + value;
    setHexDraft(value);

    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setTopForm(prev => ({ ...prev, topcolor: value.toLowerCase() }));
    }
  };

  // Leaving the field: expand shorthand, or roll back a half-typed value
  const handleHexBlur = () => {
    const expanded = /^#[0-9a-fA-F]{3}$/.test(hexDraft)
      ? "#" + hexDraft.slice(1).split("").map(c => c + c).join("")
      : hexDraft;

    if (/^#[0-9a-fA-F]{6}$/.test(expanded)) {
      setTopForm(prev => ({ ...prev, topcolor: expanded.toLowerCase() }));
      setHexDraft(expanded.toLowerCase());
    } else {
      setHexDraft(topform.topcolor);
    }
  };



  //Load Categories to list in dropdown for add Topic

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/categories");
        const data = await res.json();
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setStatus("Could not load categories");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Apply any saved theme colors on mount
  useEffect(() => {
    if (localStorage.getItem('themeColors_light') || localStorage.getItem('themeColors_dark')) {
      applyColorsToDOM(lightColors, darkColors);
    }
  }, []);

  // Live-preview: apply color changes to DOM as admin adjusts them
  useEffect(() => {
    applyColorsToDOM(lightColors, darkColors);
  }, [lightColors, darkColors]);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('http://localhost:3001/api/quicklinks');
        const data = await res.json();
        if (!cancelled) setQuicklinks(Array.isArray(data) ? data : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // Submit Form Values to Server Side

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('cat')) setCatForm(prev => ({ ...prev, [name]: value }));
    if (name.startsWith('top')) setTopForm(prev => ({ ...prev, [name]: value }));
    if (name.startsWith('ql')) setQlForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isCategory = e.target.id === 'addcat-form';

    try {
      const res = await fetch(`http://localhost:3001/api/${isCategory ? 'categories' : 'topics'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(isCategory ? catform : topform),
      });
      const data = await res.json();
      if (!res.ok) return setStatus(data.error || 'Something went wrong');

      if (isCategory) {
        setCategories(prev => [...prev, { id: data.id, name: catform.catname, description: catform.catdesc }]);
        setCatForm({ catname: '', catdesc: '' });
        setStatus('Category Added!');
      } else {
        setTopForm(prev => ({ ...prev, topname: '', topdesc: '' }));
        setStatus('Topic Added!');
      }
    } catch {
      setStatus('Network error');
    }
  };


  const handleAddQuicklink = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/quicklinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: qlform.qltitle, icon: qlform.qlicon, link: qlform.qllink }),
      });
      const data = await res.json();
      if (!res.ok) return setQlStatus(data.error || 'Something went wrong');
      setQuicklinks(prev => [...prev, { id: data.id, title: qlform.qltitle, icon: qlform.qlicon, link: qlform.qllink }]);
      setQlForm({ qltitle: '', qlicon: '📋', qllink: '' });
      setQlStatus('Quicklink added!');
      setTimeout(() => setQlStatus(''), 3000);
    } catch {
      setQlStatus('Network error');
    }
  };

  const handleRestoreDefaultQuicklinks = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/quicklinks/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return setQlStatus(data.error || 'Something went wrong');
      setQuicklinks(data);
      setQlStatus('Quicklinks restored to defaults!');
      setTimeout(() => setQlStatus(''), 3000);
    } catch {
      setQlStatus('Network error');
    }
  };

  const handleDeleteQuicklink = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/quicklinks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return setQlStatus(data.error || 'Something went wrong');
      }
      setQuicklinks(prev => prev.filter(ql => ql.id !== id));
      setQlStatus('Quicklink removed!');
      setTimeout(() => setQlStatus(''), 3000);
    } catch {
      setQlStatus('Network error');
    }
  };

  // Theme color handlers

  const handleThemeColorPick = (theme, varName, value) => {
    if (theme === 'light') setLightColors(prev => ({ ...prev, [varName]: value }));
    else setDarkColors(prev => ({ ...prev, [varName]: value }));
    setThemeHexDrafts(prev => ({ ...prev, [`${theme}_${varName}`]: value }));
  };

  const handleThemeHexType = (theme, varName, rawValue) => {
    let value = rawValue.trim();
    if (value && !value.startsWith('#')) value = '#' + value;
    setThemeHexDrafts(prev => ({ ...prev, [`${theme}_${varName}`]: value }));
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      const lower = value.toLowerCase();
      if (theme === 'light') setLightColors(prev => ({ ...prev, [varName]: lower }));
      else setDarkColors(prev => ({ ...prev, [varName]: lower }));
    }
  };

  const handleThemeHexBlur = (theme, varName) => {
    const draft = themeHexDrafts[`${theme}_${varName}`] || '';
    const expanded = /^#[0-9a-fA-F]{3}$/.test(draft)
      ? '#' + draft.slice(1).split('').map(c => c + c).join('')
      : draft;
    const currentColors = theme === 'light' ? lightColors : darkColors;
    if (/^#[0-9a-fA-F]{6}$/.test(expanded)) {
      const lower = expanded.toLowerCase();
      if (theme === 'light') setLightColors(prev => ({ ...prev, [varName]: lower }));
      else setDarkColors(prev => ({ ...prev, [varName]: lower }));
      setThemeHexDrafts(prev => ({ ...prev, [`${theme}_${varName}`]: lower }));
    } else {
      setThemeHexDrafts(prev => ({ ...prev, [`${theme}_${varName}`]: currentColors[varName] }));
    }
  };

  const handleSaveThemeColors = () => {
    localStorage.setItem('themeColors_light', JSON.stringify(lightColors));
    localStorage.setItem('themeColors_dark', JSON.stringify(darkColors));
    setColorStatus('Theme colors saved!');
    setTimeout(() => setColorStatus(''), 3000);
  };

  const handleResetThemeColors = () => {
    const newLight = buildDefaultColors('light');
    const newDark = buildDefaultColors('dark');
    setLightColors(newLight);
    setDarkColors(newDark);
    setThemeHexDrafts(buildHexDrafts(newLight, newDark));
    localStorage.removeItem('themeColors_light');
    localStorage.removeItem('themeColors_dark');
    setColorStatus('Theme colors reset to defaults!');
    setTimeout(() => setColorStatus(''), 3000);
  };

  const handleSaveHeaderSettings = () => {
    localStorage.setItem('siteTitle', headerTitle);
    localStorage.setItem('siteTagline', headerTagline);
    window.dispatchEvent(new Event('siteSettingsChanged'));
    setHeaderStatus('Header settings saved!');
    setTimeout(() => setHeaderStatus(''), 3000);
  };

  const handleResetHeaderSettings = () => {
    setHeaderTitle('TerraTalk');
    setHeaderTagline('Your world. Your voice.');
    localStorage.removeItem('siteTitle');
    localStorage.removeItem('siteTagline');
    window.dispatchEvent(new Event('siteSettingsChanged'));
    setHeaderStatus('Header settings reset to defaults!');
    setTimeout(() => setHeaderStatus(''), 3000);
  };

  const handleSaveServerInfo = () => {
    localStorage.setItem('serverAddress', serverAddress);
    localStorage.setItem('serverVersions', JSON.stringify(serverVersions));
    localStorage.setItem('serverOnline', String(serverOnline));
    window.dispatchEvent(new Event('siteSettingsChanged'));
    setServerInfoStatus('Server info saved!');
    setTimeout(() => setServerInfoStatus(''), 3000);
  };

  const handleResetServerInfo = () => {
    setServerAddress('play.yourserver.net');
    setServerVersions(['Java 1.21.4', 'Bedrock 1.21.x']);
    setServerOnline(true);
    localStorage.removeItem('serverAddress');
    localStorage.removeItem('serverVersions');
    localStorage.removeItem('serverOnline');
    window.dispatchEvent(new Event('siteSettingsChanged'));
    setServerInfoStatus('Server info reset to defaults!');
    setTimeout(() => setServerInfoStatus(''), 3000);
  };

  const handleAddVersionTag = () => {
    const tag = newVersionTag.trim();
    if (!tag || serverVersions.includes(tag)) return;
    setServerVersions(prev => [...prev, tag]);
    setNewVersionTag('');
  };

  const handleRemoveVersionTag = (tag) => {
    setServerVersions(prev => prev.filter(v => v !== tag));
  };

  async function handleLogoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
    setLogoStatus(null);
    setLogoUploading(true);

    try {
      const form = new FormData();
      form.append('logo', file);

      const res = await fetch('http://localhost:3001/api/admin/logo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed. Try again.');

      const logoUrl = `http://localhost:3001/logos/${data.logo_path}`;
      localStorage.setItem('siteLogoUrl', logoUrl);
      window.dispatchEvent(new Event('siteSettingsChanged'));
      setCurrentLogoUrl(logoUrl);
      setLogoPreview(null);
      URL.revokeObjectURL(localUrl);
      setLogoStatus({ type: 'ok', text: 'Logo updated.' });
    } catch (err) {
      setLogoPreview(null);
      URL.revokeObjectURL(localUrl);
      setLogoStatus({ type: 'error', text: err.message });
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }

  const handleToggleLogoHidden = () => {
    const next = !logoHidden;
    setLogoHidden(next);
    if (next) {
      localStorage.setItem('logoHidden', 'true');
    } else {
      localStorage.removeItem('logoHidden');
    }
    window.dispatchEvent(new Event('siteSettingsChanged'));
  };

  const handleRemoveLogo = () => {
    localStorage.removeItem('siteLogoUrl');
    window.dispatchEvent(new Event('siteSettingsChanged'));
    setCurrentLogoUrl(null);
    setLogoPreview(null);
    setLogoStatus({ type: 'ok', text: 'Logo removed.' });
  };


  if (user.username == 'admin') {

      return (
        <div className="page-content">

                  <div className="admin-card">
                    <div className="admin-header">

                        <h1 className="general-heading">Forum Settings</h1>
                        <hr></hr>
                        <br></br>
                        <h3>
                          <b>This page is for owners / administrators to manage various features of the forum site.</b>
                        </h3>
                        <br></br>
                        <p>For Developers, this is the page where you will want your additional functions on settings to appear
                        </p>
                        <br></br>
                        <hr></hr>
                        <br></br>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button type="button" className="tag-btn" onClick={() => document.getElementById('section-server').scrollIntoView({ behavior: 'smooth' })}>Server Info</button>
                          <button type="button" className="tag-btn" onClick={() => document.getElementById('section-header').scrollIntoView({ behavior: 'smooth' })}>Header Settings</button>
                          <button type="button" className="tag-btn" onClick={() => document.getElementById('section-categories').scrollIntoView({ behavior: 'smooth' })}>Categories &amp; Topics</button>
                          <button type="button" className="tag-btn" onClick={() => document.getElementById('section-quicklinks').scrollIntoView({ behavior: 'smooth' })}>Quicklinks </button>
                          <button type="button" className="tag-btn" onClick={() => document.getElementById('section-ban').scrollIntoView({ behavior: 'smooth' })}>Ban Users</button>
                          <button type="button" className="tag-btn" onClick={() => document.getElementById('section-theme').scrollIntoView({ behavior: 'smooth' })}>Theme Colors</button>
                        </div>
                        <br></br>
                    </div>
                  </div>

                  <div id="section-server" className="admin-card">
                    <div className="admin-content">
                        <h2><b> Server Info </b></h2>
                        <br></br>
                        <p> Customize the server address, version tags, and online status shown in the sidebar. </p>
                        <br></br>
                        <hr></hr>
                        <br></br>

                        <div className="form-group">
                          <label htmlFor="serverAddress">Server Address</label>
                          <input
                            type="text"
                            id="serverAddress"
                            value={serverAddress}
                            onChange={e => setServerAddress(e.target.value)}
                            placeholder="play.yourserver.net"
                          />
                        </div>

                        <div className="form-group">
                          <label>Version Tags</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                            {serverVersions.map(tag => (
                              <span key={tag} className="version-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVersionTag(tag)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: 1, fontSize: '0.85rem', color: 'inherit', opacity: 0.7 }}
                                  aria-label={`Remove ${tag}`}
                                >×</button>
                              </span>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              value={newVersionTag}
                              onChange={e => setNewVersionTag(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddVersionTag())}
                              placeholder="e.g. Java 1.21.4"
                            />
                            <button type="button" className="btn" onClick={handleAddVersionTag}>Add</button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Server Status</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <span className={`status-dot ${serverOnline ? 'online' : 'offline'}`} style={{ flexShrink: 0 }}></span>
                            <span>{serverOnline ? 'Online' : 'Offline'}</span>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => setServerOnline(prev => !prev)}
                            >
                              Set {serverOnline ? 'Offline' : 'Online'}
                            </button>
                          </div>
                        </div>

                        <button type="button" className="btn" onClick={handleSaveServerInfo}>Save Server Info</button>
                        <br></br>
                        <br></br>
                        <button type="button" className="btn" onClick={handleResetServerInfo}>Restore Defaults</button>
                        {serverInfoStatus && <p className="form-status">{serverInfoStatus}</p>}
                    </div>
                  </div>

                  <div id="section-header" className="admin-card">
                    <div className="admin-content">
                        <h2><b> Header Settings </b></h2>
                        <br></br>
                        <p> Customize the site title and tagline shown in the header. Changes are applied immediately and saved across sessions. </p>
                        <br></br>
                        <hr></hr>
                        <br></br>

                        <div className="form-group">
                          <label htmlFor="siteTitle">Site Title</label>
                          <input
                            type="text"
                            id="siteTitle"
                            value={headerTitle}
                            onChange={e => setHeaderTitle(e.target.value)}
                            placeholder="TerraTalk"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="siteTagline">Site Tagline</label>
                          <input
                            type="text"
                            id="siteTagline"
                            value={headerTagline}
                            onChange={e => setHeaderTagline(e.target.value)}
                            placeholder="Your world. Your voice."
                          />
                        </div>

                        <button type="button" className="btn" onClick={handleSaveHeaderSettings}>Save Header Settings</button>
                        <br></br>
                        <br></br>
                        <button type="button" className="btn" onClick={handleResetHeaderSettings}>Restore Defaults</button>
                        {headerStatus && <p className="form-status">{headerStatus}</p>}

                        <br></br>
                        <hr></hr>
                        <br></br>

                        <p><b>Site Logo</b></p>
                        <br></br>
                        <p>Upload an image to replace the "YOUR LOGO" placeholder in the header.</p>
                        <br></br>

                        {(logoPreview || currentLogoUrl) && (
                          <div style={{ marginBottom: '1rem' }}>
                            <img
                              src={logoPreview || currentLogoUrl}
                              alt="Current site logo"
                              style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }}
                            />
                          </div>
                        )}

                        <input
                          type="file"
                          ref={logoFileInputRef}
                          accept="image/png, image/jpeg, image/webp, image/gif"
                          onChange={handleLogoFileChange}
                          style={{ display: 'none' }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => logoFileInputRef.current?.click()}
                            disabled={logoUploading}
                          >
                            {logoUploading ? 'Uploading…' : 'Upload Logo'}
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={handleRemoveLogo}
                            disabled={logoUploading || !currentLogoUrl}
                          >
                            Remove Logo
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={handleToggleLogoHidden}
                          >
                            {logoHidden ? 'Show Logo' : 'Hide Logo'}
                          </button>
                        </div>
                        {logoStatus && (
                          <p className="form-status" style={{ color: logoStatus.type === 'error' ? '#c0392b' : undefined }}>
                            {logoStatus.text}
                          </p>
                        )}
                    </div>
                  </div>

                  <div id="section-categories" className="admin-card">
                    <div className="admin-content">
                        <h2><b> Add / Remove Categories </b></h2>
                        <br></br>
                        <p> Categories are the Green Section Names on the Home Page (ie.. INFORMATION, GAMEPLAY, COMMUNITY).
                          From here you are able to add / remove categories. If you choose to remove a category on the backend, be sure to remove any rows under it in other tables
                          (topics, threads, posts) </p>
                        <br></br>
                        <p> + Add Categories </p>

                        <form id="addcat-form" onSubmit={handleSubmit} noValidate>

                          <div className="form-group">
                              <label htmlFor="catname">Category Name</label>
                              <input type="text" id="catname" name="catname" value= {catform.catname}
                                  placeholder="Enter the Category Name" autoComplete="catname" onChange={handleChange} required />
                          </div>

                          <div className="form-group">
                              <label htmlFor="catdesc">Category Description</label>
                              <input type="text" id="catdesc" name="catdesc" value={catform.catdesc}
                                  placeholder="Enter the Category Description" autoComplete="catdesc" onChange={handleChange} required />
                          </div>

                          <div className="form-group" id="hidden">
                              <label htmlFor="catauthor"></label>
                              <input type="number" id="catauthor" name="catauthor" value={catform.catauthor}
                                  placeholder="Enter Author ID" autoComplete="catauthor" required />
                          </div>

                          <button type="submit" className="btn">Add Category</button>
                          {status && <p className="form-status">{status}</p>}

                        </form>

                        <br></br>
                        <p> - Remove Categories </p>
                        <br></br>
                        <hr></hr>
                        <br></br>
                        <h2><b> Add / Remove Topics </b></h2>
                        <br></br>
                        <p> Topics are the white Sections assigned to a category on the Home Page (ie.. Announcements, Rules & Guidelines, General Discussion, etc...).
                          From here you are able to add / remove topics. If you choose to remove a topic on the backend, be sure to remove any rows under it in other tables
                          (threads, posts)
                        </p>
                        <br></br>
                        <p> + Add Topics </p>

                        <form id="addtop-form" onSubmit={handleSubmit} noValidate>

                          <div className="form-group">
                              <label htmlFor="topname">Topic Name</label>
                              <input type="text" id="topname" name="topname" value= {topform.topname}
                                  placeholder="Enter the Topic Name" autoComplete="topname" onChange={handleChange} required />
                          </div>

                          <div className="form-group">
                              <label htmlFor="catdesc">Topic Description</label>
                              <input type="text" id="topdesc" name="topdesc" value={topform.topdesc}
                                  placeholder="Enter the Topic Description" autoComplete="topdesc" onChange={handleChange} required />
                          </div>

                          <div className="form-group">
                              <label htmlFor="topcat">Category</label>
                              <select id="topcat" name="topcat" value={topform.topcat}
                                  onChange={handleChange} required>
                                <option value="" disabled>
                                  {categories.length ? "Choose a category" : "No categories yet"}
                                </option>
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>{capitalize(cat.name)}</option>
                                ))}
                              </select>
                          </div>

                          <div className="form-group">
                              <label htmlFor="topicon">Icon</label>
                              <select id="topicon" name="topicon" value={topform.topicon}
                                  onChange={handleChange} required>
                                <option value="" disabled>
                                  {categories.length ? "Choose an icon" : "No icon yet"}
                                </option>
                                <option key="a" value="💬">💬</option>
                                <option key="b" value="🔧">🔧</option>
                                <option key="c" value="🔌">🔌</option>
                                <option key="d" value="🏗️">🏗️</option>
                                <option key="e" value="👋">👋</option>
                                <option key="f" value="💼">💼</option>
                                <option key="g" value="📢">📢</option>
                                <option key="h" value="📋">📋</option>
                              </select>
                          </div>

                          <div className="form-group">
                              <label htmlFor="topcolor">Accent Color</label>
                              <div className="color-row">
                                <input type="color" id="topcolor" name="topcolor" value={topform.topcolor}
                                    onChange={handleColorPick} />
                                <input type="text" id="topcolor-hex" name="topcolor-hex" value={hexDraft}
                                    onChange={handleHexType} onBlur={handleHexBlur}
                                    placeholder="#4CAF50" maxLength={7} spellCheck={false}
                                    aria-label="Accent color hex code" />
                              </div>
                          </div>

                          <div className="form-group" id="hidden">
                              <label htmlFor="topauthor"></label>
                              <input type="number" id="topauthor" name="topauthor" value={topform.topauthor}
                                  placeholder="Enter Author ID" autoComplete="topauthor" required />
                          </div>

                          <button type="submit" className="btn">Add Topic</button>
                          {status && <p className="form-status">{status}</p>}

                        </form>

                        <br></br>
                        <p> - Remove Topics </p>
                        <br></br>
                        <hr></hr>
                        <br></br>


                        <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>
                  </div>

                  <div id="section-quicklinks" className="admin-card">
                    <div className="admin-content">
                        <h2><b> Quicklinks </b></h2>
                        <br></br>
                        <p> Add / Remove Quicklinks shown in the sidebar on the Home Page. </p>
                        <br></br>
                        <hr></hr>
                        <br></br>

                        <p> + Add Quicklink </p>

                        <form id="addql-form" onSubmit={handleAddQuicklink} noValidate>

                          <div className="form-group">
                            <label htmlFor="qltitle">Title</label>
                            <input type="text" id="qltitle" name="qltitle" value={qlform.qltitle}
                              placeholder="Enter quicklink title" onChange={handleChange} required />
                          </div>

                          <div className="form-group">
                            <label htmlFor="qlicon">Icon</label>
                            <select id="qlicon" name="qlicon" value={qlform.qlicon} onChange={handleChange} required>
                              <option value="📋">📋</option>
                              <option value="🗺️">🗺️</option>
                              <option value="🛍️">🛍️</option>
                              <option value="📊">📊</option>
                              <option value="🎫">🎫</option>
                              <option value="💬">💬</option>
                              <option value="🔧">🔧</option>
                              <option value="🔌">🔌</option>
                              <option value="🏗️">🏗️</option>
                              <option value="👋">👋</option>
                              <option value="💼">💼</option>
                              <option value="📢">📢</option>
                              <option value="🌐">🌐</option>
                              <option value="🏆">🏆</option>
                              <option value="⚙️">⚙️</option>
                              <option value="📌">📌</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor="qllink">Link URL</label>
                            <input type="text" id="qllink" name="qllink" value={qlform.qllink}
                              placeholder="https://..." onChange={handleChange} />
                          </div>

                          <button type="submit" className="btn">Add Quicklink</button>
                          {qlStatus && <p className="form-status">{qlStatus}</p>}

                        </form>

                        <br></br>
                        <p> - Remove Quicklinks </p>
                        <br></br>
                        <hr></hr>
                        <br></br>

                        {quicklinks.length === 0 ? (
                          <p>No quicklinks yet.</p>
                        ) : (
                          <ul className="quick-links">
                            {quicklinks.map(ql => (
                              <li key={ql.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <p>{ql.icon} {ql.title}</p>
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() => handleDeleteQuicklink(ql.id)}
                                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                                >Remove</button>
                              </li>
                            ))}
                          </ul>
                        )}

                        <br></br>
                        <hr></hr>
                        <br></br>
                        
                        <button type="button" className="btn" onClick={handleRestoreDefaultQuicklinks}>Restore Defaults</button>
                        {qlStatus && <p className="form-status">{qlStatus}</p>}
                        <br></br>
                        <hr></hr>
                        <br></br>

                        <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>
                  </div>

                  <div id="section-ban" className="admin-card">
                    <div className="admin-content">
                        <h2><b> Ban Users from Forum</b></h2>
                        <br></br>
                        <p> Here you will be able to ban Specific Users from Interacting on the Forums </p>
                        <br></br>
                        <hr></hr>
                        <br></br>

                        <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>
                  </div>

                  <div id="section-theme" className="admin-card">
                    <div className="admin-content">
                        <h2><b> Theme Colors </b></h2>
                        <br></br>
                        <p> Customize the color variables used throughout the site for both Light and Dark modes.
                          Changes are previewed live as you adjust colors. Click Save to persist your changes across sessions,
                          or Reset to restore the original defaults. </p>
                        <br></br>
                        <hr></hr>
                        <br></br>

                        <div className="color-row" style={{ gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <button
                            type="button"
                            className="btn"
                            style={{ opacity: activeThemeTab === 'light' ? 1 : 0.45 }}
                            onClick={() => setActiveThemeTab('light')}
                          >Light Mode</button>
                          <button
                            type="button"
                            className="btn"
                            style={{ opacity: activeThemeTab === 'dark' ? 1 : 0.45 }}
                            onClick={() => setActiveThemeTab('dark')}
                          >Dark Mode</button>
                        </div>

                        {Object.entries(COLOR_VARS).map(([groupName, vars]) => (
                          <div key={groupName}>
                            <p><b>{groupName}</b></p>
                            <br></br>
                            {vars.map(({ var: varName, label }) => (
                              <div className="form-group" key={varName}>
                                <label>{label}</label>
                                <div className="color-row">
                                  <input
                                    type="color"
                                    value={activeThemeTab === 'light' ? lightColors[varName] : darkColors[varName]}
                                    onChange={e => handleThemeColorPick(activeThemeTab, varName, e.target.value)}
                                  />
                                  <input
                                    type="text"
                                    value={themeHexDrafts[`${activeThemeTab}_${varName}`] || ''}
                                    onChange={e => handleThemeHexType(activeThemeTab, varName, e.target.value)}
                                    onBlur={() => handleThemeHexBlur(activeThemeTab, varName)}
                                    placeholder="#000000"
                                    maxLength={7}
                                    spellCheck={false}
                                  />
                                </div>
                              </div>
                            ))}
                            <br></br>
                          </div>
                        ))}

                        <div className="color-row" style={{ gap: '0.75rem' }}>
                          <button type="button" className="btn" onClick={handleSaveThemeColors}>Save Theme Colors</button>
                          <br></br>
                          <button type="button" className="btn" onClick={handleResetThemeColors}>Reset to Defaults</button>
                          <br></br>
                          <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
                        </div>
                        {colorStatus && <p className="form-status">{colorStatus}</p>}
                    </div>
                  </div>


            </div>
      )
  } else {
    return (
        <div className="page-content">

                  <div className="auth-container">
                    <div className="policy-card">

                      <h1 className="general-heading">Unauthorized User - Page Not Permitted</h1>
                      <hr></hr>
                      <br></br>


                      <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>

                    </div>
                  </div>

            </div>
      )

  }
}
