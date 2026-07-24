import { useEffect, useState } from 'react'
import { api } from '../../services/api'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SgExercices() {
  const [horloge, setHorloge] = useState(null)
  const [simDate, setSimDate] = useState('')
  const [lastExercice, setLastExercice] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const loadHorloge = async () => {
    try {
      const data = await api.getSimulationHorloge()
      setHorloge(data)
      if (data?.dateActuelle) {
        const raw = String(data.dateActuelle).slice(0, 16)
        setSimDate(raw)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Horloge indisponible')
    }
  }

  useEffect(() => {
    loadHorloge()
  }, [])

  const runAction = async (key, fn, successMsg) => {
    setBusy(key)
    setError('')
    setToast('')
    try {
      const result = await fn()
      if (result?.exercice || result?.id) {
        setLastExercice(result)
      }
      setToast(successMsg)
      await loadHorloge()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible')
    } finally {
      setBusy('')
    }
  }

  const toIsoLocal = (value) => {
    if (!value) return ''
    return value.length === 16 ? `${value}:00` : value
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Comptabilité</p>
          <h1 className="sg-page-title">Exercices</h1>
        </div>
      </header>

      {toast ? (
        <div className="inline-success" role="status">
          {toast}
          <button type="button" className="inline-dismiss" onClick={() => setToast('')}>
            OK
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="exercice-section">
        <h3 className="membre-dash-section-title">Gestion de l’exercice</h3>
        <p className="sheet-hint">
          Un seul exercice « en cours » à la fois. Les versements et sorties
          exigent un exercice ouvert. La clôture est refusée s’il reste des prêts
          non remboursés.
        </p>
        <div className="action-stack">
          <button
            type="button"
            className="btn btn-accent btn-block btn-touch"
            disabled={!!busy}
            onClick={() =>
              runAction(
                'ouvrir',
                () => api.ouvrirExercice(),
                'Exercice ouvert. Dettes inscription/solidarité recalculées.',
              )
            }
          >
            {busy === 'ouvrir' ? 'Ouverture…' : 'Ouvrir un exercice'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-block btn-touch"
            disabled={!!busy}
            onClick={() =>
              runAction(
                'force',
                () => api.ouvrirExerciceForce(),
                'Exercice ouvert en mode forcé.',
              )
            }
          >
            {busy === 'force' ? 'Ouverture…' : 'Ouvrir (forcé)'}
          </button>
          <button
            type="button"
            className="btn btn-ghost-dark btn-block btn-touch"
            disabled={!!busy}
            onClick={() =>
              runAction(
                'cloturer',
                () => api.cloturerExercice(),
                'Exercice clôturé.',
              )
            }
          >
            {busy === 'cloturer' ? 'Clôture…' : 'Clôturer l’exercice'}
          </button>
        </div>

        {lastExercice ? (
          <div className="exercice-result">
            <p>
              <strong>Dernière opération</strong>
            </p>
            {lastExercice.exercice ? (
              <>
                <p>Statut : {lastExercice.exercice.statut || '—'}</p>
                <p>Ouverture : {formatDate(lastExercice.exercice.dateOuverture)}</p>
                <p>
                  Part inscription : {formatMoney(lastExercice.partInscription)}
                </p>
                <p>
                  Part solidarité : {formatMoney(lastExercice.partSolidarite)}
                </p>
              </>
            ) : (
              <>
                <p>Statut : {lastExercice.statut || '—'}</p>
                <p>Ouverture : {formatDate(lastExercice.dateOuverture)}</p>
                <p>Fermeture : {formatDate(lastExercice.dateFermeture)}</p>
              </>
            )}
          </div>
        ) : null}
      </section>

      <section className="exercice-section">
        <h3 className="membre-dash-section-title">Échéances de prêts</h3>
        <p className="sheet-hint">
          Déclenche la vérification manuelle des prêts échus (notifications logs
          Président, SG et membre).
        </p>
        <button
          type="button"
          className="btn btn-primary btn-block btn-touch"
          disabled={!!busy}
          onClick={() =>
            runAction(
              'echeances',
              () => api.verifierEcheancesPrets(),
              'Vérification des échéances effectuée.',
            )
          }
        >
          {busy === 'echeances' ? 'Vérification…' : 'Vérifier les échéances'}
        </button>
      </section>

      <section className="exercice-section">
        <h3 className="membre-dash-section-title">Simulation d’horloge</h3>
        <p className="sheet-hint">
          Avance la date système pour tester échéances et pénalités. Horloge
          actuelle :{' '}
          <strong>
            {horloge
              ? `${formatDate(horloge.dateActuelle)}${horloge.simulee ? ' (simulée)' : ''}`
              : '…'}
          </strong>
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor="sim-date">
            Date simulée
          </label>
          <input
            id="sim-date"
            className="form-control form-control-light"
            type="datetime-local"
            value={simDate}
            onChange={(e) => setSimDate(e.target.value)}
            disabled={!!busy}
          />
        </div>
        <div className="action-stack">
          <button
            type="button"
            className="btn btn-accent btn-block btn-touch"
            disabled={!!busy || !simDate}
            onClick={() =>
              runAction(
                'sim',
                () => api.setSimulationHorloge(toIsoLocal(simDate)),
                'Horloge simulée activée.',
              )
            }
          >
            {busy === 'sim' ? 'Application…' : 'Appliquer la date'}
          </button>
          <button
            type="button"
            className="btn btn-ghost-dark btn-block btn-touch"
            disabled={!!busy}
            onClick={() =>
              runAction(
                'reset',
                () => api.resetSimulationHorloge(),
                'Horloge réelle rétablie.',
              )
            }
          >
            {busy === 'reset' ? 'Réinitialisation…' : 'Réinitialiser l’horloge'}
          </button>
        </div>
      </section>
    </div>
  )
}
