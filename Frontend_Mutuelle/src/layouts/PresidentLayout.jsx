import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { api } from '../services/api'
import { getSession } from '../services/auth'
import ExerciceBanner from '../components/ExerciceBanner'
import BureauNavGroup from '../components/bureau/BureauNavGroup'
import { useMutuelleRefreshListener } from '../hooks/useMutuelleRefresh'
import { useExerciceEnCours } from '../hooks/useExerciceEnCours'
import {
  IconBadge,
  IconHeart,
  IconHome,
  IconFlux,
  IconList,
  IconLoan,
  IconLogout,
  IconOutflow,
  IconPiggy,
  IconUser,
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
            to="/president/flux"
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
            label="Historiques"
            icon={<IconList size={20} />}
            pathPrefixes={[
              '/president/epargnes',
              '/president/inscriptions',
              '/president/solidarites',
              '/president/emprunts',
              '/president/sorties',
            ]}
          >
            <NavLink
              to="/president/epargnes"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Épargnes
            </NavLink>
            <NavLink
              to="/president/inscriptions"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Inscriptions
            </NavLink>
            <NavLink
              to="/president/solidarites"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Solidarités
            </NavLink>
            <NavLink
              to="/president/emprunts"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Emprunts
            </NavLink>
            <NavLink
              to="/president/sorties"
              className={({ isActive }) =>
                `bureau-nav-item bureau-nav-sub ${isActive ? 'is-active' : ''}`
              }
            >
              Sorties
            </NavLink>
          </BureauNavGroup>

          <NavLink
            to="/president/compte"
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
          to="/president/flux"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconFlux />
          <span>Flux</span>
        </NavLink>
        <NavLink
          to="/president/epargnes"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconPiggy />
          <span>Épargnes</span>
        </NavLink>
        <NavLink
          to="/president/inscriptions"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconBadge />
          <span>Inscr.</span>
        </NavLink>
        <NavLink
          to="/president/solidarites"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconHeart />
          <span>Solid.</span>
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
        <NavLink
          to="/president/sorties"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconOutflow />
          <span>Sorties</span>
        </NavLink>
        <NavLink
          to="/president/compte"
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
