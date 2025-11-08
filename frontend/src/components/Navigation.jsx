import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h2>Hummingbird</h2>
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/spider" 
            className={`nav-link ${location.pathname === '/spider' ? 'active' : ''}`}
          >
            Spider Plot
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

