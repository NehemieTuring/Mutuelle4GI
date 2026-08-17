import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { api } from '../services/api'
import { getSession } from '../services/auth'
import ExerciceBanner from '../components/ExerciceBanner'
import BureauNavGroup from '../components/bureau/BureauNavGroup'
import { useMutuelleRefreshListener } from '../hooks/useMutuelleRefresh'
import { useExerciceEnCours } from '../hooks/useExerciceEnCours'
import {
  IconClock,
  IconFlux,
  IconLogout,
  IconOutflow,
  IconRepay,
  IconUser,
  IconVault,
} from '../components/NavIcons'

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
  const { exercice, exerciceActif, loading, refresh } = useExerciceEnCours()

  useMutuelleRefreshListener(refresh, 'exercices')
  useEffect(() => {
    const onChange = () => refresh()
    window.addEventListener('exercice-change', onChange)
    return () => window.removeEventListener('exercice-change', onChange)
  }, [refresh])

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
          <NavLink
            to="/tr/caisses"
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
            to="/tr/flux"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconFlux size={20} />
            </span>
            <span>Flux financiers</span>
          </NavLink>

          <BureauNavGroup
            label="Versements"
            icon={<IconClock size={20} />}
            pathPrefixes={['/tr/versements']}
          >
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
          </BureauNavGroup>

          <BureauNavGroup
            label="Sorties"
            icon={<IconOutflow size={20} />}
            pathPrefixes={['/tr/sorties']}
          >
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
          </BureauNavGroup>

          <NavLink
            to="/tr/remboursements"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconRepay size={20} />
            </span>
            <span>Remboursements</span>
          </NavLink>

          <NavLink
            to="/tr/compte"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconUser size={20} />
            </span>
            <span>Mon compte</span>
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
        <ExerciceBanner
          exercice={exercice}
          loading={loading}
          sgLink={null}
          className="bureau-exercice-banner"
        />
        <Outlet context={{ exercice, exerciceActif, exerciceLoading: loading }} />
      </div>

      <nav className="bureau-bottom-nav bureau-bottom-nav-scroll" aria-label="Navigation mobile">
        <NavLink
          to="/tr/caisses"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconVault />
          <span>Caisses</span>
        </NavLink>
        <NavLink
          to="/tr/flux"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconFlux />
          <span>Flux</span>
        </NavLink>
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
          to="/tr/sorties/en-attente"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconOutflow />
          <span>Sort. attente</span>
        </NavLink>
        <NavLink
          to="/tr/remboursements"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconRepay />
          <span>Rembours.</span>
        </NavLink>
        <NavLink
          to="/tr/compte"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconUser />
          <span>Compte</span>
        </NavLink>
        <button type="button" className="bureau-bottom-item" onClick={handleLogout}>
          <IconLogout />
          <span>Quitter</span>
        </button>
      </nav>
    </div>
  )
}
