import { useCallback, useEffect, useState } from 'react'
import { useMutuelleRefresh, useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { api } from '../../services/api'
import StatutBadge from '../../components/StatutBadge'

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

function membreName(membre) {
  if (!membre) return '—'
  return [membre.prenom, membre.nom].filter(Boolean).join(' ') || membre.couriel || '—'
}

export default function CommissaireEmprunts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getTousPrets()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [])

  useMutuelleRefresh(load, 'prets')

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Contrôle</p>
          <h1 className="sg-page-title">Emprunts</h1>
        </div>
      </header>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading ? 'Chargement…' : `${items.length} emprunt(s)`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="sg-empty">Aucun emprunt.</div>
      ) : (
        <ul className="membre-list">
          {items.map((p) => (
            <li key={p.id} className="membre-card">
              <div className="membre-card-top">
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{membreName(p.membre)}</h2>
                  <p className="membre-card-mail">{formatDate(p.datePret)}</p>
                </div>
                <StatutBadge type="pret" statut={p.statut} />
              </div>
              <div className="versement-amount">{formatMoney(p.montant)}</div>
              <div className="membre-card-meta">
                <span>À rembourser : {formatMoney(p.montantARembourser)}</span>
                <span>Échéance : {formatDate(p.dateEcheance)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
