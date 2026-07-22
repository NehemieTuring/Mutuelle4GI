import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { getSession } from '../services/auth'
import { IconClock, IconList, IconLogout, IconOutflow, IconLoan } from '../components/NavIcons'

function occupantLabel(session) {
  const poste = session?.user
  const membre = poste?.membre
  if (membre) {
    return [membre.prenom, membre.nom].filter(Boolean).join(' ')
  }
  return poste?.login || 'Trésorier'
}

export default function TrLayout() {
  const session = getSession()
  const navigate = useNavigate()

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  return (
    <div className="bureau-shell">
      <aside className="bureau-sidebar" aria-label="Navigation trésorerie">
        <div className="bureau-sidebar-brand">
          <span className="bureau-sidebar-title">Mutuelle ENSPY</span>
          <span className="bureau-sidebar-role">Trésorier</span>
        </div>

        <nav className="bureau-sidebar-nav">
          <div className="bureau-nav-group">
            <span className="bureau-nav-group-label">Versements</span>
            <NavLink
              to="/tr/versements/en-attente"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              En attente
            </NavLink>
            <NavLink
              to="/tr/versements/tous"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Tous les versements
            </NavLink>
          </div>

          <div className="bureau-nav-group">
            <span className="bureau-nav-group-label">Sorties</span>
            <NavLink
              to="/tr/sorties/en-attente"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              En attente
            </NavLink>
            <NavLink
              to="/tr/sorties/toutes"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Toutes les sorties
            </NavLink>
          </div>

          <div className="bureau-nav-group">
            <span className="bureau-nav-group-label">Remboursements</span>
            <NavLink
              to="/tr/remboursements"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              En attente
            </NavLink>
          </div>
        </nav>

        <div className="bureau-sidebar-footer">
          <p className="bureau-user-name">{occupantLabel(session)}</p>
          <button
            type="button"
            className="btn btn-ghost-dark btn-touch"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="bureau-main">
        <Outlet />
      </div>

      <nav className="bureau-bottom-nav bureau-bottom-nav-scroll" aria-label="Navigation mobile">
        <NavLink
          to="/tr/versements/en-attente"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconClock />
          <span>Vers. attente</span>
        </NavLink>
        <NavLink
          to="/tr/versements/tous"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconList />
          <span>Versements</span>
        </NavLink>
        <NavLink
          to="/tr/sorties/en-attente"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconOutflow />
          <span>Sort. attente</span>
        </NavLink>
        <NavLink
          to="/tr/sorties/toutes"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconList />
          <span>Sorties</span>
        </NavLink>
        <NavLink
          to="/tr/remboursements"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconLoan />
          <span>Rembours.</span>
        </NavLink>
        <button type="button" className="bureau-bottom-item" onClick={handleLogout}>
          <IconLogout />
          <span>Quitter</span>
        </button>
      </nav>
    </div>
  )
}
