import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { getSession, updateMembreSession } from '../../services/auth'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function PayerInscription() {
  const session = getSession()
  const membre = session?.user
  const navigate = useNavigate()

  const [montant, setMontant] = useState(null)
  const [loadingMontant, setLoadingMontant] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const value = await api.getMontantInscription()
        if (alive) setMontant(value)
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error
              ? err.message
              : 'Impossible de charger le montant d’inscription',
          )
        }
      } finally {
        if (alive) setLoadingMontant(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const handlePay = async () => {
    setError('')
    setSubmitting(true)
    try {
      await api.demanderInscription(membre.id, montant)
      setPending(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Paiement impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefresh = async () => {
    setError('')
    setSubmitting(true)
    try {
      const fresh = await api.getMembre(membre.id)
      updateMembreSession(fresh)
      if (fresh.inscriptionPayee) {
        navigate('/membre', { replace: true })
      } else {
        setError(
          'Votre inscription n’est pas encore validée par le trésorier. Réessayez plus tard.',
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Actualisation impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  return (
    <div className="gate-screen">
      <header className="gate-topbar">
        <span className="gate-brand">Mutuelle ENSPY</span>
        <button type="button" className="gate-logout" onClick={handleLogout}>
          Quitter
        </button>
      </header>

      <div className="gate-body">
        <p className="gate-step">Étape 2 sur 2</p>
        <h1 className="gate-title">Inscription obligatoire</h1>
        <p className="gate-lead">
          Votre compte est activé, mais vous devez régler vos frais d’inscription
          avant d’accéder au système.
        </p>

        <div className="gate-amount-block">
          <span className="gate-amount-label">Montant à payer</span>
          <p className="gate-amount-value">
            {loadingMontant ? '…' : formatMoney(montant)}
          </p>
          {membre?.detteInscription != null ? (
            <p className="gate-amount-hint">
              Dette d’inscription : {formatMoney(membre.detteInscription)}
            </p>
          ) : null}
        </div>

        {pending ? (
          <div className="gate-pending" role="status">
            <p>
              Demande de paiement envoyée. Elle est <strong>en attente</strong> de
              validation par le trésorier.
            </p>
            <p className="gate-pending-sub">
              Dès qu’elle est acceptée, vous pourrez entrer dans votre espace.
            </p>
            <button
              type="button"
              className="btn btn-accent btn-block btn-touch"
              onClick={handleRefresh}
              disabled={submitting}
            >
              {submitting ? 'Vérification…' : 'J’ai payé — actualiser'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-accent btn-block btn-touch"
            onClick={handlePay}
            disabled={loadingMontant || submitting || montant == null}
          >
            {submitting ? 'Envoi…' : 'Payer mon inscription'}
          </button>
        )}

        {error ? (
          <div className="form-error" role="alert" style={{ marginTop: 16 }}>
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
