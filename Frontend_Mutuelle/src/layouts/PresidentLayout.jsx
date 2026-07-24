import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { getSession } from '../services/auth'
import {
  IconHome,
  IconLoan,
  IconLogout,
  IconUsers,
  IconVault,
} from '../components/NavIcons'

function occupantLabel(session) {
  const poste = session?.user
  const membre = poste?.membre
  if (membre) {
    return [membre.prenom, membre.nom].filter(Boolean).join(' ')
  }
  return poste?.login || 'Président'
}

export default function PresidentLayout() {
  const session = getSession()
  const navigate = useNavigate()

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  return (
    <div className="bureau-shell">
      <aside className="bureau-sidebar" aria-label="Navigation présidence">
        <div className="bureau-sidebar-brand">
          <span className="bureau-sidebar-title">Mutuelle ENSPY</span>
          <span className="bureau-sidebar-role">Président</span>
        </div>

        <nav className="bureau-sidebar-nav">
          <NavLink
            to="/president"
            end
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconHome size={20} />
            </span>
            <span>Vue d’ensemble</span>
          </NavLink>
          <NavLink
            to="/president/caisses"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconVault size={20} />
            </span>
            <span>Caisses</span>
          </NavLink>
          <NavLink
            to="/president/membres"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconUsers size={20} />
            </span>
            <span>Membres</span>
          </NavLink>
          <NavLink
            to="/president/emprunts"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconLoan size={20} />
            </span>
            <span>Emprunts</span>
          </NavLink>
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
          to="/president"
          end
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconHome />
          <span>Accueil</span>
        </NavLink>
        <NavLink
          to="/president/caisses"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconVault />
          <span>Caisses</span>
        </NavLink>
        <NavLink
          to="/president/membres"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconUsers />
          <span>Membres</span>
        </NavLink>
        <NavLink
          to="/president/emprunts"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconLoan />
          <span>Emprunts</span>
        </NavLink>
        <button type="button" className="bureau-bottom-item" onClick={handleLogout}>
          <IconLogout />
          <span>Quitter</span>
        </button>
      </nav>
    </div>
  )
}
