import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import Header from './components/Header'
import MemberPage from './components/MemberPage'
import ForumHome from './components/ForumHome'
import ForumLogin from './components/ForumLogin'
import ForumRegister from './components/ForumRegister'
import AdminSettings from './components/AdminSettings'
import ProfileSettings from './components/ProfileSettings'
import ForgotPassword from './components/ForgotPassword'
import PasswordReset from './components/PasswordReset'
import TermsOfService from './components/TermsOfService'
import CategoryView from './components/CategoryView'
import CreateNewThread from './components/CreateNewThread'
import ThreadView from './components/ThreadView'
import SearchPage from './components/SearchPage'
import MemberProfile from './components/MemberProfile'
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
  const { banned } = useAuth();
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

      {banned && (
        <div className="page-content">
          <div className="auth-container">
            <div className="policy-card">
              <h1 className="general-heading">You have been banned from this forum.</h1>
              <hr /><br />
              <p style={{ color: 'var(--text-secondary)' }}>If you believe this is a mistake, please contact an administrator.</p>
            </div>
          </div>
        </div>
      )}

      {!banned && view.page === 'home' && <ForumHome onNavigate={navigate} />}
      {!banned && view.page === 'login' && <ForumLogin onNavigate={navigate} />}
      {!banned && view.page === 'register' && <ForumRegister onNavigate={navigate} />}
      {!banned && view.page === 'memberpage' && <MemberPage onNavigate={navigate} />}
      {!banned && view.page === 'adminsettings' && <AdminSettings onNavigate={navigate} />}
      {!banned && view.page === 'profilesettings' && <ProfileSettings onNavigate={navigate} />}
      {!banned && view.page === 'forgotpwd' && <ForgotPassword onNavigate={navigate} />}
      {!banned && view.page === 'reset' && <PasswordReset onNavigate={navigate} />}
      {!banned && view.page === 'terms' && <TermsOfService onNavigate={navigate} />}
      {!banned && view.page === 'topic' && <CategoryView topic={view.topic} onNavigate={navigate} />}
      {!banned && view.page === 'newthread' && <CreateNewThread topic={view.topic} onNavigate={navigate} />}
      {!banned && view.page === 'thread' && <ThreadView thread={view.thread} topic={view.topic} onNavigate={navigate} />}
      {!banned && view.page === 'search' && <SearchPage onNavigate={navigate} />}
      {!banned && view.page === 'memberprofile' && <MemberProfile memberId={view.memberId} onNavigate={navigate} />}

      <Footer onNavigate={navigate} />
    </div>
  )
}
