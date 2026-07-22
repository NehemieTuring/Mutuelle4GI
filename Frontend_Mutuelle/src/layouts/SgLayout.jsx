import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { getSession } from '../services/auth'
import {
  IconBadge,
  IconHeart,
  IconLoan,
  IconLogout,
  IconOutflow,
  IconPiggy,
  IconUsers,
} from '../components/NavIcons'

function occupantLabel(session) {
  const poste = session?.user
  const membre = poste?.membre
  if (membre) {
    return [membre.prenom, membre.nom].filter(Boolean).join(' ')
  }
  return poste?.login || 'Secrétaire général'
}

export default function SgLayout() {
  const session = getSession()
  const navigate = useNavigate()

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  return (
    <div className="bureau-shell">
      <aside className="bureau-sidebar" aria-label="Navigation secrétariat">
        <div className="bureau-sidebar-brand">
          <span className="bureau-sidebar-title">Mutuelle ENSPY</span>
          <span className="bureau-sidebar-role">Secrétaire général</span>
        </div>

        <nav className="bureau-sidebar-nav">
          <NavLink
            to="/sg/membres"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconUsers size={20} />
            </span>
            <span>Membres</span>
          </NavLink>

          <div className="bureau-nav-group">
            <span className="bureau-nav-group-label">Historiques</span>
            <NavLink
              to="/sg/epargnes"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Épargnes
            </NavLink>
            <NavLink
              to="/sg/inscriptions"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Inscriptions
            </NavLink>
            <NavLink
              to="/sg/solidarites"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Solidarités
            </NavLink>
            <NavLink
              to="/sg/emprunts"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Emprunts
            </NavLink>
          </div>

          <div className="bureau-nav-group">
            <span className="bureau-nav-group-label">Sorties</span>
            <NavLink
              to="/sg/sorties/en-attente"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              À valider
            </NavLink>
            <NavLink
              to="/sg/sorties/toutes"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Toutes
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
          to="/sg/membres"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconUsers />
          <span>Membres</span>
        </NavLink>
        <NavLink
          to="/sg/epargnes"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconPiggy />
          <span>Épargnes</span>
        </NavLink>
        <NavLink
          to="/sg/inscriptions"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconBadge />
          <span>Inscriptions</span>
        </NavLink>
        <NavLink
          to="/sg/solidarites"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconHeart />
          <span>Solidarités</span>
        </NavLink>
        <NavLink
          to="/sg/emprunts"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconLoan />
          <span>Emprunts</span>
        </NavLink>
        <NavLink
          to="/sg/sorties/en-attente"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconOutflow />
          <span>Sorties</span>
        </NavLink>
        <button type="button" className="bureau-bottom-item" onClick={handleLogout}>
          <IconLogout />
          <span>Quitter</span>
        </button>
      </nav>
    </div>
  )
}
