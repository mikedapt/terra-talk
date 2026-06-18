import { useState} from 'react'
import Header from './components/Header'
import ForumHome from './components/ForumHome'
import ForumLogin from './components/ForumLogin'
import ForumRegister from './components/ForumRegister'
import TermsOfService from './components/TermsOfService'
import CategoryView from './components/CategoryView'
import ThreadView from './components/ThreadView'
import Footer from './components/Footer'
import './styles.css'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [view, setView] = useState({ page: 'home' })

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
      {view.page === 'terms' && <TermsOfService onNavigate={navigate} />}
      {view.page === 'category' && <CategoryView category={view.category} onNavigate={navigate} />}
      {view.page === 'thread' && <ThreadView thread={view.thread} category={view.category} onNavigate={navigate} />}

      <Footer />
    </div>
  )
}
