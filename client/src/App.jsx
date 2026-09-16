import { useState, useEffect } from 'react'
import Header from './components/Header'
import ForumHome from './components/ForumHome'
import ForumLogin from './components/ForumLogin'
import ForumRegister from './components/ForumRegister'
import AdminSettings from './components/AdminSettings';
import ProfileSettings from './components/ProfileSettings';
import ForgotPassword from './components/ForgotPassword'
import PasswordReset from './components/PasswordReset'
import TermsOfService from './components/TermsOfService'
import CategoryView from './components/CategoryView'
import CreateNewThread from './components/CreateNewThread'
import ThreadView from './components/ThreadView'
import Footer from './components/Footer'
import './styles.css'

function applyTabSettings() {
  const title = localStorage.getItem('siteTitle') || 'TerraTalk';
  const tagline = localStorage.getItem('siteTagline') || 'Your world. Your voice.';
  document.title = `${title} - ${tagline}`;

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  const logoUrl = localStorage.getItem('siteLogoUrl');
  if (logoUrl) {
    link.href = logoUrl;
  } else {
    link.removeAttribute('href');
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [view, setView] = useState({ page: 'home' })

  useEffect(() => {
    applyTabSettings();
    window.addEventListener('siteSettingsChanged', applyTabSettings);
    return () => window.removeEventListener('siteSettingsChanged', applyTabSettings);
  }, [])

  function navigate(page, data = {}) {
    setView({ page, ...data })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <Header darkMode={darkMode} toggleDark={() => setDarkMode((d) => !d)} onNavigate={navigate} />

      {view.page === 'home' && <ForumHome onNavigate={navigate} />}
      {view.page === 'login' && <ForumLogin onNavigate={navigate} />}
      {view.page === 'register' && <ForumRegister onNavigate={navigate} />}
      {view.page === 'adminsettings' && <AdminSettings onNavigate={navigate} />}
      {view.page === 'profilesettings' && <ProfileSettings onNavigate={navigate} />}
      {view.page === 'forgotpwd' && <ForgotPassword onNavigate={navigate} />}
      {view.page === 'reset' && <PasswordReset onNavigate={navigate} />}
      {view.page === 'terms' && <TermsOfService onNavigate={navigate} />}
      {view.page === 'topic' && <CategoryView topic={view.topic} onNavigate={navigate} />}
      {view.page === 'newthread' && <CreateNewThread topic={view.topic} onNavigate={navigate} />}
      {view.page === 'thread' && <ThreadView thread={view.thread} topic={view.topic} onNavigate={navigate} />}

      <Footer onNavigate={navigate} />
    </div>
  )
}
