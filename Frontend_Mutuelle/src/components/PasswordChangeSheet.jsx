import { useEffect, useState } from 'react'

/**
 * Changement de mot de passe en 2 étapes :
 * 1. saisie de l'ancien mot de passe pour déverrouiller
 * 2. saisie du nouveau mot de passe
 */
export default function PasswordChangeSheet({
  open,
  onClose,
  onSubmit,
  submitting = false,
  error = '',
  title = 'Changer le mot de passe',
}) {
  const [step, setStep] = useState('unlock')
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!open) return
    setStep('unlock')
    setAncien('')
    setNouveau('')
    setConfirm('')
    setLocalError('')
  }, [open])

  if (!open) return null

  const close = () => {
    if (submitting) return
    onClose()
  }

  const handleUnlock = (e) => {
    e.preventDefault()
    setLocalError('')
    if (!ancien.trim()) {
      setLocalError('Saisissez votre mot de passe actuel.')
      return
    }
    setStep('change')
  }

  const handleChange = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (nouveau.length < 8) {
      setLocalError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (nouveau !== confirm) {
      setLocalError('Les mots de passe ne correspondent pas.')
      return
    }
    await onSubmit({ ancien, nouveau })
  }

  const displayError = localError || error

  return (
    <div className="sheet-overlay" role="presentation" onClick={close}>
      <div
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwd-change-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header">
          <h2 id="pwd-change-title">{title}</h2>
          <button
            type="button"
            className="sheet-close btn-touch"
            onClick={close}
            aria-label="Fermer"
          >
            ✕
          </button>
        </header>

        {step === 'unlock' ? (
          <form className="sheet-form" onSubmit={handleUnlock}>
            <p className="sheet-hint">
              Pour accéder au changement de mot de passe, saisissez d’abord votre mot de
              passe actuel.
            </p>
            <div className="form-group">
              <label className="form-label form-label-dark" htmlFor="pwd-ancien">
                Mot de passe actuel
              </label>
              <input
                id="pwd-ancien"
                className="form-control form-control-light"
                type="password"
                autoComplete="current-password"
                value={ancien}
                onChange={(e) => setAncien(e.target.value)}
                required
                autoFocus
              />
            </div>
            {displayError ? (
              <div className="form-error form-error-light" role="alert">
                {displayError}
              </div>
            ) : null}
            <button type="submit" className="btn btn-accent btn-block btn-touch">
              Continuer
            </button>
          </form>
        ) : (
          <form className="sheet-form" onSubmit={handleChange}>
            <p className="sheet-hint">Choisissez un nouveau mot de passe (8 caractères min.).</p>
            <div className="form-group">
              <label className="form-label form-label-dark" htmlFor="pwd-nouveau">
                Nouveau mot de passe
              </label>
              <input
                id="pwd-nouveau"
                className="form-control form-control-light"
                type="password"
                autoComplete="new-password"
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-dark" htmlFor="pwd-confirm">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="pwd-confirm"
                className="form-control form-control-light"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
              />
            </div>
            {displayError ? (
              <div className="form-error form-error-light" role="alert">
                {displayError}
              </div>
            ) : null}
            <button
              type="submit"
              className="btn btn-accent btn-block btn-touch"
              disabled={submitting}
            >
              {submitting ? 'Modification…' : 'Enregistrer le mot de passe'}
            </button>
            <button
              type="button"
              className="btn btn-ghost-dark btn-block btn-touch"
              onClick={() => {
                setStep('unlock')
                setLocalError('')
              }}
              disabled={submitting}
            >
              Retour
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
