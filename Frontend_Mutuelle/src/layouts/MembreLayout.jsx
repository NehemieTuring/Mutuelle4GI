import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../services/api'
import { getSession, updateMembreSession } from '../services/auth'
import {
  IconHelp,
  IconHome,
  IconLoan,
  IconPiggy,
  IconWithdraw,
} from '../components/NavIcons'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function MembreLayout() {
  const session = getSession()
  const [membre, setMembre] = useState(session?.user)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sheetError, setSheetError] = useState('')
  const [toast, setToast] = useState('')

  const refreshMembre = async () => {
    const id = getSession()?.user?.id
    if (!id) return null
    const fresh = await api.getMembre(id)
    setMembre(fresh)
    updateMembreSession(fresh)
    return fresh
  }

  useEffect(() => {
    const id = session?.user?.id
    if (!id) return
    let alive = true
    ;(async () => {
      try {
        const fresh = await api.getMembre(id)
        if (!alive) return
        setMembre(fresh)
        updateMembreSession(fresh)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      alive = false
    }
  }, [session?.user?.id])

  useEffect(() => {
    const onAuth = () => setMembre(getSession()?.user)
    window.addEventListener('auth-change', onAuth)
    return () => window.removeEventListener('auth-change', onAuth)
  }, [])

  const solidariteNonSoldee =
    !membre?.solidaritePayee || Number(membre?.detteSolidarite) > 0
  const resteSolidarite = Number(membre?.detteSolidarite) || 0

  const openSolidarite = () => {
    setSheetError('')
    setAmount(String(resteSolidarite || ''))
    setSheetOpen(true)
  }

  const closeSheet = () => {
    if (submitting) return
    setSheetOpen(false)
  }

  const handlePaySolidarite = async (e) => {
    e.preventDefault()
    setSheetError('')
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setSheetError('Indiquez un montant valide supérieur à 0.')
      return
    }
    if (value > resteSolidarite) {
      setSheetError(
        `Le montant ne peut pas dépasser votre dette (${formatMoney(resteSolidarite)}).`,
      )
      return
    }
    setSubmitting(true)
    try {
      await api.demanderSolidarite(membre.id, value)
      setSheetOpen(false)
      setToast('Demande de solidarité envoyée. Validation trésorier en attente.')
      await refreshMembre()
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Paiement impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="membre-shell">
      {solidariteNonSoldee ? (
        <div className="membre-solidarite-banner membre-solidarite-banner-sticky" role="status">
          <p className="membre-solidarite-banner-title">Solidarité non soldée</p>
          <p className="membre-solidarite-banner-text">
            Vous n’avez pas encore soldé votre cotisation de solidarité. Il vous
            reste <strong>{formatMoney(resteSolidarite)}</strong> à payer pour
            être à jour.
          </p>
          <button
            type="button"
            className="btn btn-solidarite btn-touch"
            onClick={openSolidarite}
          >
            Payer ma solidarité
          </button>
        </div>
      ) : null}

      {toast ? (
        <div className="membre-shell-toast inline-success" role="status">
          {toast}
          <button type="button" className="inline-dismiss" onClick={() => setToast('')}>
            OK
          </button>
        </div>
      ) : null}

      <div className="membre-shell-content">
        <Outlet
          context={{
            membre,
            setMembre,
            refreshMembre,
            resteSolidarite,
            solidariteNonSoldee,
            openSolidarite,
          }}
        />
      </div>

      <nav className="membre-bottom-nav" aria-label="Navigation membre">
        <NavLink
          to="/membre"
          end
          className={({ isActive }) =>
            `membre-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconHome />
          <span>Accueil</span>
        </NavLink>
        <NavLink
          to="/membre/epargne"
          className={({ isActive }) =>
            `membre-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconPiggy />
          <span>Épargne</span>
        </NavLink>
        <NavLink
          to="/membre/retrait"
          className={({ isActive }) =>
            `membre-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconWithdraw />
          <span>Retrait</span>
        </NavLink>
        <NavLink
          to="/membre/aide"
          className={({ isActive }) =>
            `membre-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconHelp />
          <span>Aide</span>
        </NavLink>
        <NavLink
          to="/membre/emprunt"
          className={({ isActive }) =>
            `membre-bottom-item ${isActive ? 'is-active' : ''}`
          }
        >
          <IconLoan />
          <span>Emprunt</span>
        </NavLink>
      </nav>

      {sheetOpen ? (
        <div className="sheet-overlay" role="presentation" onClick={closeSheet}>
          <div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pay-solidarite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <header className="sheet-header">
              <h2 id="pay-solidarite-title">Payer ma solidarité</h2>
              <button type="button" className="sheet-close btn-touch" onClick={closeSheet}>
                ✕
              </button>
            </header>
            <form className="sheet-form" onSubmit={handlePaySolidarite}>
              <p className="sheet-hint">
                Maximum : <strong>{formatMoney(resteSolidarite)}</strong>. Validation
                par le trésorier.
              </p>
              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="sol-montant">
                  Montant (XAF)
                </label>
                <input
                  id="sol-montant"
                  className="form-control form-control-light"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={resteSolidarite}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              {sheetError ? (
                <div className="form-error form-error-light" role="alert">
                  {sheetError}
                </div>
              ) : null}
              <button
                type="submit"
                className="btn btn-accent btn-block btn-touch"
                disabled={submitting}
              >
                {submitting ? 'Envoi…' : 'Confirmer le paiement'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
