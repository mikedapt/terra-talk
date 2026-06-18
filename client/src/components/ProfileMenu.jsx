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