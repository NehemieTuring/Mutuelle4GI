import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { api } from '../services/api'
import { getSession } from '../services/auth'
import ExerciceBanner, { ExerciceStatusChip } from '../components/ExerciceBanner'
import BureauNavGroup from '../components/bureau/BureauNavGroup'
import { useMutuelleRefreshListener } from '../hooks/useMutuelleRefresh'
import { useExerciceEnCours } from '../hooks/useExerciceEnCours'
import {
  IconBadge,
  IconCalendar,
  IconHeart,
  IconList,
  IconLoan,
  IconLogout,
  IconOutflow,
  IconPiggy,
  IconSettings,
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
  return poste?.login || 'Secrétaire général'
}

export default function SgLayout() {
  const session = getSession()
  const navigate = useNavigate()
  const location = useLocation()
  const { exercice, exerciceActif, loading, refresh } = useExerciceEnCours()
  const onExercicesPage = location.pathname.startsWith('/sg/exercices')

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

          <NavLink
            to="/sg/caisses"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconVault size={20} />
            </span>
            <span>Caisses</span>
          </NavLink>

          <BureauNavGroup
            label="Historiques"
            icon={<IconList size={20} />}
            pathPrefixes={[
              '/sg/epargnes',
              '/sg/inscriptions',
              '/sg/solidarites',
              '/sg/emprunts',
            ]}
          >
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
          </BureauNavGroup>

          <BureauNavGroup
            label="Sorties"
            icon={<IconOutflow size={20} />}
            pathPrefixes={['/sg/sorties']}
          >
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
          </BureauNavGroup>

          <NavLink
            to="/sg/parametres"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconSettings size={20} />
            </span>
            <span>Paramètres</span>
          </NavLink>

          <NavLink
            to="/sg/exercices"
            className={({ isActive }) =>
              `bureau-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="bureau-nav-icon">
              <IconCalendar size={20} />
            </span>
            <span>Exercices</span>
          </NavLink>

          <NavLink
            to="/sg/compte"
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
        {!onExercicesPage ? (
          <ExerciceBanner
            exercice={exercice}
            loading={loading}
            sgLink="/sg/exercices"
            className="bureau-exercice-banner"
          />
        ) : (
          <div className="bureau-exercice-chip-wrap">
            <ExerciceStatusChip exercice={exercice} loading={loading} />
          </div>
        )}
        <Outlet context={{ exercice, exerciceActif, exerciceLoading: loading }} />
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
          to="/sg/caisses"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconVault />
          <span>Caisses</span>
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
        <NavLink
          to="/sg/parametres"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconSettings />
          <span>Params</span>
        </NavLink>
        <NavLink
          to="/sg/exercices"
          className={({ isActive }) =>
            `bureau-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconCalendar />
          <span>Exercices</span>
        </NavLink>
        <NavLink
          to="/sg/compte"
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
