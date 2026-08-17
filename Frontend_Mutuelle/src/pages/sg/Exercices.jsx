import { useCallback, useEffect, useState } from 'react'
import { useMutuelleRefresh, useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { api } from '../../services/api'
import StatutBadge from '../../components/StatutBadge'
import { ExerciceStatusChip } from '../../components/ExerciceBanner'

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
  const [exerciceEnCours, setExerciceEnCours] = useState(null)
  const [historique, setHistorique] = useState([])
  const [lastOperation, setLastOperation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [courant, liste, horlogeData] = await Promise.all([
        api.getExerciceEnCours(),
        api.getExercices(),
        api.getSimulationHorloge(),
      ])
      setExerciceEnCours(courant)
      setHistorique(Array.isArray(liste) ? liste : [])
      setHorloge(horlogeData)
      if (horlogeData?.dateActuelle) {
        setSimDate(String(horlogeData.dateActuelle).slice(0, 16))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useMutuelleRefreshListener(loadAll, 'exercices')

  const runAction = async (key, fn, successMsg) => {
    setBusy(key)
    setError('')
    setToast('')
    try {
      const result = await fn()
      setLastOperation(result)
      setToast(successMsg)
      await loadAll()
      window.dispatchEvent(new CustomEvent('exercice-change'))
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

  const hasExerciceOuvert = !!exerciceEnCours

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Comptabilité</p>
          <h1 className="sg-page-title">Exercices</h1>
        </div>
        <ExerciceStatusChip exercice={exerciceEnCours} loading={loading} />
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
        <h3 className="membre-dash-section-title">Exercice en cours</h3>
        <p className="sheet-hint">
          Un seul exercice « en cours » à la fois. À l’ouverture, les dettes
          d’inscription et de solidarité sont recalculées pour chaque membre. Les
          versements, sorties et remboursements ne sont possibles que pendant un
          exercice ouvert.
        </p>

        {loading ? (
          <p className="sheet-hint">Chargement…</p>
        ) : hasExerciceOuvert ? (
          <div className="exercice-result exercice-result-active">
            <p>
              <strong>Statut :</strong>{' '}
              <StatutBadge type="exercice" statut={exerciceEnCours.statut} />
            </p>
            <p>
              <strong>Ouverture :</strong> {formatDate(exerciceEnCours.dateOuverture)}
            </p>
            <p className="sheet-hint exercice-active-hint">
              Toutes les opérations de la mutuelle sont rattachées à cet exercice.
            </p>
          </div>
        ) : (
          <div className="exercice-result exercice-result-empty">
            <p>
              <strong>Aucun exercice ouvert.</strong> Ouvrez un exercice pour
              permettre les opérations financières.
            </p>
          </div>
        )}

        <div className="action-stack">
          <button
            type="button"
            className="btn btn-accent btn-block btn-touch"
            disabled={!!busy || hasExerciceOuvert}
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
            disabled={!!busy || hasExerciceOuvert}
            onClick={() =>
              runAction(
                'force',
                () => api.ouvrirExerciceForce(),
                'Exercice ouvert en mode forcé (prêts non remboursés ignorés).',
              )
            }
          >
            {busy === 'force' ? 'Ouverture…' : 'Ouvrir (forcé)'}
          </button>
          <button
            type="button"
            className="btn btn-ghost-dark btn-block btn-touch"
            disabled={!!busy || !hasExerciceOuvert}
            onClick={() =>
              runAction(
                'cloturer',
                () => api.cloturerExercice(),
                'Exercice clôturé. Les opérations sont suspendues.',
              )
            }
          >
            {busy === 'cloturer' ? 'Clôture…' : 'Clôturer l’exercice'}
          </button>
        </div>

        {!hasExerciceOuvert ? (
          <p className="sheet-hint">
            L’ouverture forcée ignore les prêts non remboursés mais applique la
            même procédure de calcul des dettes.
          </p>
        ) : (
          <p className="sheet-hint">
            La clôture est refusée s’il reste des prêts non remboursés.
          </p>
        )}

        {lastOperation?.exercice || lastOperation?.partInscription != null ? (
          <div className="exercice-result">
            <p>
              <strong>Dernière ouverture</strong>
            </p>
            {lastOperation.exercice ? (
              <>
                <p>
                  Statut : <StatutBadge type="exercice" statut={lastOperation.exercice.statut} />
                </p>
                <p>Ouverture : {formatDate(lastOperation.exercice.dateOuverture)}</p>
                <p>Part inscription : {formatMoney(lastOperation.partInscription)}</p>
                <p>Part solidarité : {formatMoney(lastOperation.partSolidarite)}</p>
              </>
            ) : null}
          </div>
        ) : lastOperation?.statut ? (
          <div className="exercice-result">
            <p>
              <strong>Dernière clôture</strong>
            </p>
            <p>
              Statut : <StatutBadge type="exercice" statut={lastOperation.statut} />
            </p>
            <p>Fermeture : {formatDate(lastOperation.dateFermeture)}</p>
          </div>
        ) : null}
      </section>

      <section className="exercice-section">
        <h3 className="membre-dash-section-title">Historique</h3>
        {historique.length === 0 ? (
          <p className="sheet-hint">Aucun exercice enregistré.</p>
        ) : (
          <ul className="exercice-history-list">
            {historique.map((ex) => (
              <li key={ex.id} className="exercice-history-item">
                <div className="exercice-history-head">
                  <StatutBadge type="exercice" statut={ex.statut} />
                  <span className="exercice-history-dates">
                    {formatDate(ex.dateOuverture)}
                    {ex.dateFermeture ? ` → ${formatDate(ex.dateFermeture)}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
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
