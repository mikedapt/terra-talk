import { useState, useEffect } from 'react'

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="footer-brand">TerraTalk</span>
          <span className="footer-copy">© 2026 All rights reserved.</span>
        </div>
        <div className="footer-links">
          <button className="footer-link" onClick={() => onNavigate('terms')}>Terms</button>
          <button className="footer-link" onClick={() => onNavigate('home')}>Privacy</button>
          <button className="footer-link" onClick={() => onNavigate('home')}>Contact</button>
          <button className="footer-link" onClick={() => onNavigate('home')}>Discord</button>
        </div>
      </div>
    </footer>
  )
}
