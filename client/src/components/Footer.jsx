import { useState, useEffect } from 'react'

const DEFAULT_FOOTER_LINKS = [
  { label: 'Terms', url: 'terms' },
  { label: 'Privacy', url: 'home' },
  { label: 'Contact', url: 'home' },
  { label: 'Discord', url: 'home' },
];

function loadFooterLinks() {
  try { return JSON.parse(localStorage.getItem('footerLinks')) || DEFAULT_FOOTER_LINKS; }
  catch { return DEFAULT_FOOTER_LINKS; }
}

export default function Footer({ onNavigate }) {
  const [siteTitle, setSiteTitle] = useState(() => localStorage.getItem('siteTitle') || 'TerraTalk');
  const [footerLinks, setFooterLinks] = useState(loadFooterLinks);

  useEffect(() => {
    const update = () => {
      setSiteTitle(localStorage.getItem('siteTitle') || 'TerraTalk');
      setFooterLinks(loadFooterLinks());
    };
    window.addEventListener('siteSettingsChanged', update);
    return () => window.removeEventListener('siteSettingsChanged', update);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="footer-brand">{siteTitle}</span>
          <span className="footer-copy">© 2026 All rights reserved.</span>
        </div>
        <div className="footer-links">
          {footerLinks.map((link, i) => (
            <button
              key={i}
              className="footer-link"
              onClick={() => link.url.startsWith('http') ? window.open(link.url, '_blank') : onNavigate(link.url)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
