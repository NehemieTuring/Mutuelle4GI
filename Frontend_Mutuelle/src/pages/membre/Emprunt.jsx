import { useEffect, useState } from 'react'
import { useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { useOutletContext } from 'react-router-dom'
import { api } from '../../services/api'
import StatutBadge from '../../components/StatutBadge'
import { getSession } from '../../services/auth'

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
  })
}

/** Demandes d’emprunt encore en cours de validation (pas encore accordées / refusées). */
function isDemandePretEnCours(s) {
  return (
    s?.raison === 'pret' &&
    (s.statut === 'en_attente_secretaire_general' ||
      s.statut === 'en_attente_tresorier')
  )
}

function sortDemandes(list) {
  return [...list].sort(
    (a, b) =>
      new Date(b.dateSortie || 0).getTime() - new Date(a.dateSortie || 0).getTime(),
  )
}

function restePayable(pret, remboursements, detteMembre) {
  const enAttente = (remboursements || [])
    .filter((r) => r.statut === 'en_attente_tr')
    .reduce((sum, r) => sum + Number(r.montant || 0), 0)
  const dette = Number(detteMembre ?? 0)
  // Un seul prêt non remboursé à la fois : la dette membre est le reste dû.
  if (pret?.statut === 'non rembourse') {
    return Math.max(0, dette - enAttente)
  }
  return 0
}

export default function MembreEmprunt() {
  const { membre: ctxMembre, setMembre: setCtxMembre, refreshMembre, exerciceActif } =
    useOutletContext() || {}
  const membreId = getSession()?.user?.id

  const [membre, setMembre] = useState(ctxMembre || getSession()?.user)
  const [demandes, setDemandes] = useState([])
  const [prets, setPrets] = useState([])
  const [remboursementsByPret, setRemboursementsByPret] = useState({})
  const [eligibility, setEligibility] = useState(null)
  const [facteur, setFacteur] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sheetMode, setSheetMode] = useState(null) // 'emprunt' | 'rembourser'
  const [selectedPret, setSelectedPret] = useState(null)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sheetError, setSheetError] = useState('')
  const [toast, setToast] = useState('')

  const eligibilityKnown = eligibility != null
  const isEligible = eligibility?.eligible === true
  const maxPret =
    eligibility?.montantMaximum != null
      ? Number(eligibility.montantMaximum)
      : facteur != null
        ? Number(membre?.epargne || 0) * facteur
        : 0

  const applyPretEligibility = (elig, params) => {
    setEligibility(elig)
    const f = elig?.facteurEmprunt ?? params?.facteurEmprunt ?? null
    if (f != null) setFacteur(Number(f))
  }

  const loadRemboursements = async (pretsList) => {
    const actifs = (pretsList || []).filter((p) => p.statut === 'non rembourse')
    const entries = await Promise.all(
      actifs.map(async (p) => {
        try {
          const list = await api.getRemboursementsPret(p.id)
          return [p.id, Array.isArray(list) ? list : []]
        } catch {
          return [p.id, []]
        }
      }),
    )
    const map = {}
    for (const [id, list] of entries) map[id] = list
    // conserver l’historique déjà chargé pour les prêts soldés
    setRemboursementsByPret((prev) => ({ ...prev, ...map }))
    return map
  }

  const load = async () => {
    if (!membreId) return
    setLoading(true)
    setError('')
    try {
      const [fresh, sorties, pretsList, elig, params] = await Promise.all([
        api.getMembre(membreId),
        api.getSortiesMembre(membreId),
        api.getPretsMembre(membreId),
        api.getEligiblePret(membreId).catch(() => null),
        api.getParametres().catch(() => null),
      ])
      setMembre(fresh)
      setCtxMembre?.(fresh)
      applyPretEligibility(elig, params)
      const demandesPret = sortDemandes(
        (Array.isArray(sorties) ? sorties : []).filter(isDemandePretEnCours),
      )
      setDemandes(demandesPret)
      const list = Array.isArray(pretsList) ? pretsList : []
      setPrets(list)
      await loadRemboursements(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [membreId, setCtxMembre])

  useMutuelleRefreshListener(load, ['membres', 'sorties', 'prets', 'remboursements', 'parametres'])


  const openEmpruntSheet = () => {
    setSheetError('')
    setAmount('')
    setSelectedPret(null)
    setSheetMode('emprunt')
  }

  const openRembourserSheet = (pret) => {
    setSheetError('')
    setAmount('')
    setSelectedPret(pret)
    setSheetMode('rembourser')
  }

  const closeSheet = () => {
    setSheetMode(null)
    setSelectedPret(null)
    setAmount('')
    setSheetError('')
  }

  const handleSubmitEmprunt = async (e) => {
    e.preventDefault()
    setSheetError('')
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setSheetError('Indiquez un montant valide.')
      return
    }
    if (value > maxPret) {
      setSheetError(
        `Le montant dépasse le maximum autorisé (${formatMoney(maxPret)}).`,
      )
      return
    }
    setSubmitting(true)
    try {
      await api.demanderPret(membreId, value)
      closeSheet()
      setToast('Demande d’emprunt envoyée. En attente de validation.')
      await load()
      await refreshMembre?.()
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Demande impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitRemboursement = async (e) => {
    e.preventDefault()
    setSheetError('')
    if (!selectedPret?.id) {
      setSheetError('Aucun prêt sélectionné.')
      return
    }
    const value = Number(amount)
    const max = restePayable(
      selectedPret,
      remboursementsByPret[selectedPret.id],
      membre?.dette,
    )
    if (!Number.isFinite(value) || value <= 0) {
      setSheetError('Indiquez un montant valide.')
      return
    }
    if (value > max) {
      setSheetError(
        `Le montant dépasse le reste à rembourser (${formatMoney(max)}).`,
      )
      return
    }
    setSubmitting(true)
    try {
      await api.demanderRemboursement(selectedPret.id, value)
      closeSheet()
      setToast(
        'Demande de remboursement envoyée. En attente de validation du trésorier.',
      )
      await load()
      await refreshMembre?.()
    } catch (err) {
      setSheetError(
        err instanceof Error ? err.message : 'Remboursement impossible',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const maxRemboursement = selectedPret
    ? restePayable(
        selectedPret,
        remboursementsByPret[selectedPret.id],
        membre?.dette,
      )
    : 0

  return (
    <div className="membre-page">
      <header className="membre-page-header">
        <div>
          <p className="membre-dash-eyebrow">Crédit</p>
          <h1 className="membre-dash-title">Emprunt</h1>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-touch"
          disabled={!exerciceActif}
          onClick={openEmpruntSheet}
        >
          {exerciceActif ? 'Emprunter' : 'Exercice non ouvert'}
        </button>
      </header>

      <div className="membre-summary-block">
        <span className="membre-summary-label">Dette d’emprunt en cours</span>
        <p className="membre-summary-value">{formatMoney(membre?.dette)}</p>
        <p className="membre-dash-muted">
          {facteur != null
            ? `Maximum empruntable (épargne × ${facteur}) : ${formatMoney(maxPret)}`
            : 'Maximum empruntable en cours de calcul…'}
        </p>
      </div>

      {toast ? (
        <div className="inline-success" role="status">
          {toast}
          <button type="button" className="inline-dismiss" onClick={() => setToast('')}>
            OK
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="membre-dash-muted">Chargement…</p>
      ) : error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : (
        <>
          <h3 className="membre-dash-section-title">Demandes en cours</h3>
          {demandes.length === 0 ? (
            <div className="sg-empty" style={{ padding: '24px 16px' }}>
              Aucune demande d’emprunt.
            </div>
          ) : (
            <ul className="membre-list">
              {demandes.map((d) => (
                <li key={d.id} className="membre-card">
                  <div className="membre-card-top">
                    <div className="membre-card-info">
                      <h2 className="membre-card-name">{formatMoney(d.montant)}</h2>
                      <p className="membre-card-mail">{formatDate(d.dateSortie)}</p>
                    </div>
                    <StatutBadge type="sortie" statut={d.statut} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className="membre-dash-section-title" style={{ marginTop: 24 }}>
            Prêts enregistrés
          </h3>
          {prets.length === 0 ? (
            <div className="sg-empty" style={{ padding: '24px 16px' }}>
              Aucun prêt enregistré.
            </div>
          ) : (
            <ul className="membre-list">
              {prets.map((p) => {
                const rembs = remboursementsByPret[p.id] || []
                const enAttente = rembs.filter((r) => r.statut === 'en_attente_tr')
                const payable =
                  p.statut === 'non rembourse'
                    ? restePayable(p, rembs, membre?.dette)
                    : 0
                return (
                  <li key={p.id} className="membre-card">
                    <div className="membre-card-top">
                      <div className="membre-card-info">
                        <h2 className="membre-card-name">{formatMoney(p.montant)}</h2>
                        <p className="membre-card-mail">
                          {formatDate(p.datePret)} · à rembourser{' '}
                          {formatMoney(p.montantARembourser)}
                        </p>
                      </div>
                      <StatutBadge type="pret" statut={p.statut} />
                    </div>
                    <div className="membre-card-meta">
                      <span>Échéance : {formatDate(p.dateEcheance)}</span>
                      {p.statut === 'non rembourse' ? (
                        <span>Reste payable : {formatMoney(payable)}</span>
                      ) : null}
                    </div>
                    {enAttente.length > 0 ? (
                      <p className="membre-dash-muted" style={{ marginTop: 8 }}>
                        {enAttente.length} remboursement
                        {enAttente.length > 1 ? 's' : ''} en attente du trésorier (
                        {formatMoney(
                          enAttente.reduce((s, r) => s + Number(r.montant || 0), 0),
                        )}
                        ).
                      </p>
                    ) : null}
                    {rembs.length > 0 ? (
                      <ul className="membre-card-meta" style={{ flexDirection: 'column', gap: 4 }}>
                        {rembs
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.dateRemboursement || 0) -
                              new Date(a.dateRemboursement || 0),
                          )
                          .map((r) => (
                            <li key={r.id}>
                              {formatMoney(r.montant)} · {formatDate(r.dateRemboursement)} ·{' '}
                              <StatutBadge type="remboursement" statut={r.statut} />
                            </li>
                          ))}
                      </ul>
                    ) : null}
                    {p.statut === 'non rembourse' && payable > 0 ? (
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-touch"
                          disabled={!exerciceActif}
                          onClick={() => openRembourserSheet(p)}
                        >
                          Rembourser
                        </button>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {sheetMode === 'emprunt' ? (
        <div
          className="sheet-overlay"
          role="presentation"
          onClick={() => !submitting && closeSheet()}
        >
          <div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <header className="sheet-header">
              <h2>
                {!eligibilityKnown
                  ? 'Emprunt'
                  : isEligible
                    ? 'Demander un emprunt'
                    : 'Emprunt non disponible'}
              </h2>
              <button
                type="button"
                className="sheet-close btn-touch"
                onClick={closeSheet}
              >
                ✕
              </button>
            </header>
            {!eligibilityKnown ? (
              <div className="sheet-form">
                <p className="sheet-hint">Vérification de l’éligibilité…</p>
              </div>
            ) : !isEligible ? (
              <div className="sheet-form">
                <p className="sheet-hint" role="status">
                  Vous n’êtes pas éligible à un emprunt.
                </p>
                <div className="form-error form-error-light" role="alert">
                  {eligibility?.message ||
                    'Conditions non remplies (inscription, solidarité ou dette en cours).'}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-touch"
                  onClick={closeSheet}
                >
                  Compris
                </button>
              </div>
            ) : (
              <form className="sheet-form" onSubmit={handleSubmitEmprunt}>
                <p className="sheet-hint">
                  Maximum autorisé : <strong>{formatMoney(maxPret)}</strong>
                  {facteur != null ? ` (épargne × ${facteur})` : ''}. Conditions :
                  inscription et solidarité à jour, aucune dette d’emprunt en cours.
                </p>
                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="pret-montant">
                    Montant (XAF)
                  </label>
                  <input
                    id="pret-montant"
                    className="form-control form-control-light"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={maxPret || undefined}
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
                  disabled={submitting || !exerciceActif}
                >
                  {submitting ? 'Envoi…' : 'Soumettre la demande'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {sheetMode === 'rembourser' && selectedPret ? (
        <div
          className="sheet-overlay"
          role="presentation"
          onClick={() => !submitting && closeSheet()}
        >
          <div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <header className="sheet-header">
              <h2>Rembourser le prêt</h2>
              <button
                type="button"
                className="sheet-close btn-touch"
                onClick={closeSheet}
              >
                ✕
              </button>
            </header>
            <form className="sheet-form" onSubmit={handleSubmitRemboursement}>
              <p className="sheet-hint">
                Dette en cours : <strong>{formatMoney(membre?.dette)}</strong>.
                Maximum pour cette demande :{' '}
                <strong>{formatMoney(maxRemboursement)}</strong>. Le trésorier
                validera le paiement ; la dette et la caisse seront mises à jour
                après validation.
              </p>
              <div className="form-group">
                <label
                  className="form-label form-label-dark"
                  htmlFor="remb-montant"
                >
                  Montant à rembourser (XAF)
                </label>
                <input
                  id="remb-montant"
                  className="form-control form-control-light"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={maxRemboursement || undefined}
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
                disabled={submitting || maxRemboursement <= 0 || !exerciceActif}
              >
                {submitting ? 'Envoi…' : 'Soumettre le remboursement'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
