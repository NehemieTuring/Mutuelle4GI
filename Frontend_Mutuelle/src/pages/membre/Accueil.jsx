import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { api } from '../../services/api'
import { getSession, updateMembreSession } from '../../services/auth'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function etatLabel(etat) {
  if (etat === 'a jour') return 'À jour'
  if (etat === 'non a jour') return 'Non à jour'
  if (etat === 'Inactif') return 'Inactif'
  return etat || '—'
}

export default function MembreAccueil() {
  const navigate = useNavigate()
  const { membre: ctxMembre, setMembre: setCtxMembre } = useOutletContext() || {}
  const session = getSession()

  const [membre, setMembre] = useState(ctxMembre || session?.user)
  const [solde, setSolde] = useState(null)
  const [loading, setLoading] = useState(Boolean(session?.user?.id))
  const [error, setError] = useState('')

  useEffect(() => {
    const id = session?.user?.id
    if (!id) {
      return
    }
    let alive = true
    ;(async () => {
      try {
        const [fresh, soldeTotal] = await Promise.all([
          api.getMembre(id),
          api.getSoldeTotal(id).catch(() => null),
        ])
        if (!alive) return
        setMembre(fresh)
        updateMembreSession(fresh)
        setCtxMembre?.(fresh)
        setSolde(soldeTotal)
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Chargement impossible')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [session?.user?.id, setCtxMembre])

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  const name = [membre?.prenom, membre?.nom].filter(Boolean).join(' ')
  const epargne = solde?.epargne ?? membre?.epargne ?? 0
  const interet = solde?.interet ?? membre?.interet ?? 0
  const soldeTotal = solde?.soldeTotal ?? Number(epargne) + Number(interet)

  return (
    <div className="membre-page">
      <header className="membre-page-header">
        <div>
          <p className="membre-dash-eyebrow">Mutuelle ENSPY</p>
          <h1 className="membre-dash-title">Tableau de bord</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={handleLogout}>
          Quitter
        </button>
      </header>

      {loading ? (
        <p className="membre-dash-muted">Chargement…</p>
      ) : error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : (
        <>
          <section className="membre-dash-intro">
            <p className="membre-dash-hello">Bonjour</p>
            <h2 className="membre-dash-name">{name || membre?.couriel}</h2>
            <p className="membre-dash-muted">{membre?.couriel}</p>
          </section>

          <section className="membre-dash-actions" aria-label="Actions rapides">
            <h3 className="membre-dash-section-title">Actions rapides</h3>
            <div className="membre-quick-grid">
              <button
                type="button"
                className="btn btn-primary btn-touch"
                onClick={() => navigate('/membre/epargne', { state: { openEpargne: true } })}
              >
                Épargner
              </button>
              <button
                type="button"
                className="btn btn-primary btn-touch"
                onClick={() => navigate('/membre/retrait')}
              >
                Effectuer un retrait
              </button>
              <button
                type="button"
                className="btn btn-primary btn-touch"
                onClick={() => navigate('/membre/aide')}
              >
                Demander une aide
              </button>
              <button
                type="button"
                className="btn btn-primary btn-touch"
                onClick={() => navigate('/membre/emprunt')}
              >
                Demander un emprunt
              </button>
            </div>
          </section>

          <section className="membre-dash-status" aria-label="Statut du compte">
            <div className="membre-dash-status-row">
              <span>Statut mutuelle</span>
              <strong>{etatLabel(membre?.etat)}</strong>
            </div>
            <div className="membre-dash-status-row">
              <span>Inscription</span>
              <strong>{membre?.inscriptionPayee ? 'Payée' : 'Non payée'}</strong>
            </div>
            <div className="membre-dash-status-row">
              <span>Solidarité</span>
              <strong>{membre?.solidaritePayee ? 'À jour' : 'Non soldée'}</strong>
            </div>
            <div className="membre-dash-status-row">
              <span>Compte</span>
              <strong>{membre?.compteVerifie ? 'Vérifié' : 'Non vérifié'}</strong>
            </div>
          </section>

          <section className="membre-dash-metrics" aria-label="Aperçu financier">
            <h3 className="membre-dash-section-title">Aperçu financier</h3>
            <ul className="membre-dash-list">
              <li className="membre-dash-item">
                <div>
                  <p className="membre-dash-item-label">Épargne</p>
                  <p className="membre-dash-item-hint">Capital placé</p>
                </div>
                <p className="membre-dash-item-value">{formatMoney(epargne)}</p>
              </li>
              <li className="membre-dash-item">
                <div>
                  <p className="membre-dash-item-label">Intérêts cumulés</p>
                  <p className="membre-dash-item-hint">Liés à votre épargne</p>
                </div>
                <p className="membre-dash-item-value">{formatMoney(interet)}</p>
              </li>
              <li className="membre-dash-item">
                <div>
                  <p className="membre-dash-item-label">Solde total</p>
                  <p className="membre-dash-item-hint">Épargne + intérêts</p>
                </div>
                <p className="membre-dash-item-value">{formatMoney(soldeTotal)}</p>
              </li>
              <li className="membre-dash-item">
                <div>
                  <p className="membre-dash-item-label">Dettes d’emprunt</p>
                  <p className="membre-dash-item-hint">Capital restant dû</p>
                </div>
                <p className="membre-dash-item-value">{formatMoney(membre?.dette)}</p>
              </li>
              <li className="membre-dash-item">
                <div>
                  <p className="membre-dash-item-label">Dette solidarité</p>
                  <p className="membre-dash-item-hint">Reste à verser</p>
                </div>
                <p className="membre-dash-item-value">
                  {formatMoney(membre?.detteSolidarite)}
                </p>
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
