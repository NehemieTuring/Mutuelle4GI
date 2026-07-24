import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

const emptyForm = {
  montantInscription: '',
  montantSolidarite: '',
  tauxInteretEmprunts: '',
  montantPenaliteRetard: '',
  facteurEmprunt: '',
  dureeMaximaleEmprunt: '',
}

function toForm(params) {
  if (!params) return emptyForm
  return {
    montantInscription: String(params.montantInscription ?? ''),
    montantSolidarite: String(params.montantSolidarite ?? ''),
    tauxInteretEmprunts: String(params.tauxInteretEmprunts ?? ''),
    montantPenaliteRetard: String(params.montantPenaliteRetard ?? ''),
    facteurEmprunt: String(params.facteurEmprunt ?? ''),
    dureeMaximaleEmprunt: String(params.dureeMaximaleEmprunt ?? ''),
  }
}

export default function SgParametres() {
  const [parametres, setParametres] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getParametres()
      setParametres(data)
      setForm(toForm(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccessMsg('')
    setSubmitting(true)
    try {
      const payload = {
        ...parametres,
        montantInscription: Number(form.montantInscription),
        montantSolidarite: Number(form.montantSolidarite),
        tauxInteretEmprunts: Number(form.tauxInteretEmprunts),
        montantPenaliteRetard: Number(form.montantPenaliteRetard),
        facteurEmprunt: Number(form.facteurEmprunt),
        dureeMaximaleEmprunt: Number(form.dureeMaximaleEmprunt),
      }
      const updated = await api.updateParametres(payload)
      setParametres(updated)
      setForm(toForm(updated))
      setSuccessMsg('Paramètres enregistrés.')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Configuration</p>
          <h1 className="sg-page-title">Paramètres</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={load}>
          Actualiser
        </button>
      </header>

      {successMsg ? (
        <div className="inline-success" role="status">
          {successMsg}
          <button type="button" className="inline-dismiss" onClick={() => setSuccessMsg('')}>
            OK
          </button>
        </div>
      ) : null}

      <h3 className="membre-dash-section-title">Soldes des caisses</h3>
      <p className="sheet-hint" style={{ marginBottom: 12 }}>
        Les caisses évoluent via les versements et sorties — lecture seule ici.
      </p>
      <CaissesOverview parametres={parametres} loading={loading} error={error} />

      <h3 className="membre-dash-section-title" style={{ marginTop: 28 }}>
        Règles générales
      </h3>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : error ? null : (
        <form className="params-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="p-inscription">
              Montant inscription ({formatMoney(form.montantInscription)})
            </label>
            <input
              id="p-inscription"
              className="form-control form-control-light"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.montantInscription}
              onChange={handleChange('montantInscription')}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-solidarite">
              Montant solidarité
            </label>
            <input
              id="p-solidarite"
              className="form-control form-control-light"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.montantSolidarite}
              onChange={handleChange('montantSolidarite')}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-taux">
              Taux d’intérêt emprunts (ex. 0.03 = 3 %)
            </label>
            <input
              id="p-taux"
              className="form-control form-control-light"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={form.tauxInteretEmprunts}
              onChange={handleChange('tauxInteretEmprunts')}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-penalite">
              Pénalité de retard
            </label>
            <input
              id="p-penalite"
              className="form-control form-control-light"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.montantPenaliteRetard}
              onChange={handleChange('montantPenaliteRetard')}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-facteur">
              Facteur d’emprunt (max = épargne × facteur)
            </label>
            <input
              id="p-facteur"
              className="form-control form-control-light"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.facteurEmprunt}
              onChange={handleChange('facteurEmprunt')}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-duree">
              Durée max. emprunt (mois)
            </label>
            <input
              id="p-duree"
              className="form-control form-control-light"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.dureeMaximaleEmprunt}
              onChange={handleChange('dureeMaximaleEmprunt')}
              required
              disabled={submitting}
            />
          </div>

          {formError ? (
            <div className="form-error form-error-light" role="alert">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-accent btn-block btn-touch"
            disabled={submitting}
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer les paramètres'}
          </button>
        </form>
      )}
    </div>
  )
}
