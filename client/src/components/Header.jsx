//import ProfileMenu from './ProfileMenu'
import { useAuth } from '../AuthContext';

export default function Header({ darkMode, toggleDark, onNavigate }) {

  const { user, logout } = useAuth();

  function ProfileMenu({ username, onLogout }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="profile-menu">
        <button onClick={() => setOpen(o => !o)}>{username} ▾</button>
        {open && (
          <div className="dropdown">
            <Link to="/settings">Settings</Link>
            <Link to={`/users/${username}`}>Profile</Link>
            <button onClick={onLogout}>Log out</button>
          </div>
        )}
      </div>
    );
 }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          {/* Replace this div with your own <img> tag to add a logo */}
          <div className="logo-slot" onClick={() => onNavigate('home')} title="Click to go home">
            <span className="logo-placeholder-text">YOUR LOGO</span>
          </div>
          <div className="site-title" onClick={() => onNavigate('home')}>
            <span className="site-name">TerraTalk</span>
            <span className="site-tagline">Your world. Your voice.</span>
          </div>
        </div>

        <nav className="header-nav">
          <button className="nav-link" onClick={() => onNavigate('home')}>Home</button>
          <button className="nav-link">Members</button>
          <button className="nav-link">Search</button>
        </nav>

        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleDark}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          {user
            ? <ProfileMenu username={user.username} onLogout={logout} />
            : (
              <>
               <button className="btn-login" onClick={() => onNavigate('login')}>Log In</button>
               <button className="btn-register" onClick={() => onNavigate('register')}>Register</button>
              </>
            )}
        </div>
      </div>
    </header>
  )
}
