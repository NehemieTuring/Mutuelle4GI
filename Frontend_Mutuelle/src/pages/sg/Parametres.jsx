import { useEffect, useState } from 'react'
import { useMutuelleRefresh } from '../../hooks/useMutuelleRefresh'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function posteLabel(intitule) {
  const map = {
    PRESIDENT: 'Président',
    SECRETAIRE_GENERAL: 'Secrétaire général',
    TRESORIER: 'Trésorier',
    COMMISSAIRE_AUX_COMPTES: 'Commissaire aux comptes',
  }
  return map[intitule] || intitule
}

function membreOptionLabel(m) {
  return [m.prenom, m.nom].filter(Boolean).join(' ') || m.couriel
}

function numberValue(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const emptyForm = {
  montantInscription: '',
  mensualiteRenflouement: '',
  nbMoisRenflouement: '',
  complementRenflouement: '',
  forfaitRenflouement: '',
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
    mensualiteRenflouement: String(params.mensualiteRenflouement ?? '45000'),
    nbMoisRenflouement: String(params.nbMoisRenflouement ?? '12'),
    complementRenflouement: String(params.complementRenflouement ?? '60000'),
    forfaitRenflouement: String(params.forfaitRenflouement ?? '150000'),
    montantSolidarite: String(params.montantSolidarite ?? ''),
    tauxInteretEmprunts: String(params.tauxInteretEmprunts ?? ''),
    montantPenaliteRetard: String(params.montantPenaliteRetard ?? ''),
    facteurEmprunt: String(params.facteurEmprunt ?? ''),
    dureeMaximaleEmprunt: String(params.dureeMaximaleEmprunt ?? ''),
  }
}

function montantRenflouement(form) {
  const mensuel = numberValue(form.mensualiteRenflouement)
  const mois = numberValue(form.nbMoisRenflouement, 12)
  const complement = numberValue(form.complementRenflouement)
  const forfait = numberValue(form.forfaitRenflouement)
  return mensuel * mois + complement + forfait
}

export default function SgParametres() {
  const [parametres, setParametres] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [aides, setAides] = useState([])
  const [postes, setPostes] = useState([])
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [aideForm, setAideForm] = useState({ id: null, typeAide: '', montant: '' })
  const [aideBusy, setAideBusy] = useState(false)
  const [posteBusy, setPosteBusy] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [params, aidesData, postesData, membresData] = await Promise.all([
        api.getParametres(),
        api.getAidesParametres(),
        api.getPostes(),
        api.getMembres(),
      ])
      setParametres(params)
      setForm(toForm(params))
      setAides(Array.isArray(aidesData) ? aidesData : [])
      setPostes(Array.isArray(postesData) ? postesData : [])
      setMembres(Array.isArray(membresData) ? membresData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useMutuelleRefresh(load, 'parametres')


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
        mensualiteRenflouement: Number(form.mensualiteRenflouement),
        nbMoisRenflouement: Number(form.nbMoisRenflouement),
        complementRenflouement: Number(form.complementRenflouement),
        forfaitRenflouement: Number(form.forfaitRenflouement),
        montantSolidarite: Number(form.montantSolidarite),
        tauxInteretEmprunts: Number(form.tauxInteretEmprunts),
        montantPenaliteRetard: Number(form.montantPenaliteRetard),
        facteurEmprunt: Number(form.facteurEmprunt),
        dureeMaximaleEmprunt: Number(form.dureeMaximaleEmprunt),
      }
      const updated = await api.updateParametres(payload)
      setParametres(updated)
      setForm(toForm(updated))
      setSuccessMsg('Paramètres généraux enregistrés.')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAideForm = () => setAideForm({ id: null, typeAide: '', montant: '' })

  const handleSaveAide = async (e) => {
    e.preventDefault()
    setAideBusy(true)
    setFormError('')
    try {
      const payload = {
        typeAide: aideForm.typeAide.trim().toLowerCase(),
        montant: Number(aideForm.montant),
      }
      if (aideForm.id) {
        await api.updateAideParametre(aideForm.id, payload)
        setSuccessMsg('Type d’aide mis à jour.')
      } else {
        await api.createAideParametre(payload)
        setSuccessMsg('Type d’aide ajouté.')
      }
      resetAideForm()
      const list = await api.getAidesParametres()
      setAides(Array.isArray(list) ? list : [])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Aide impossible à enregistrer')
    } finally {
      setAideBusy(false)
    }
  }

  const handleDeleteAide = async (id) => {
    setAideBusy(true)
    setFormError('')
    try {
      await api.deleteAideParametre(id)
      setSuccessMsg('Type d’aide supprimé.')
      if (aideForm.id === id) resetAideForm()
      const list = await api.getAidesParametres()
      setAides(Array.isArray(list) ? list : [])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Suppression impossible')
    } finally {
      setAideBusy(false)
    }
  }

  const handleChangeOccupant = async (poste, membreId) => {
    if (!membreId || poste.membre?.id === membreId) return
    setPosteBusy(poste.id)
    setFormError('')
    try {
      await api.updatePoste(poste.id, {
        ...poste,
        membre: { id: membreId },
      })
      setSuccessMsg(`${posteLabel(poste.intitule)} mis à jour.`)
      const list = await api.getPostes()
      setPostes(Array.isArray(list) ? list : [])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Changement de poste impossible')
    } finally {
      setPosteBusy('')
    }
  }

  const reglesResume = [
    {
      label: 'Renflouement inscription',
      value: formatMoney(montantRenflouement(form)),
      hint: `(${numberValue(form.mensualiteRenflouement).toLocaleString('fr-FR')} × ${numberValue(form.nbMoisRenflouement, 12)}) + ${numberValue(form.complementRenflouement).toLocaleString('fr-FR')} + ${numberValue(form.forfaitRenflouement).toLocaleString('fr-FR')}`,
    },
    {
      label: 'Solidarité',
      value: formatMoney(form.montantSolidarite),
      hint: 'Cible caisse = montant × total membres',
    },
    {
      label: 'Taux prêt',
      value: `${Math.round(numberValue(form.tauxInteretEmprunts) * 1000) / 10} %`,
      hint: 'Appliqué lors des emprunts',
    },
    {
      label: 'Facteur',
      value: `× ${numberValue(form.facteurEmprunt, 1)}`,
      hint: 'Épargne × facteur = plafond prêt',
    },
  ]

  return (
    <div className="sg-page settings-shell">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Configuration</p>
          <h1 className="sg-page-title">Paramètres</h1>
          <p className="sheet-hint settings-page-intro">
            Gérez les règles métier, les types d’aides et les occupants du bureau.
          </p>
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

      {formError ? (
        <div className="inline-error" role="alert">
          {formError}
        </div>
      ) : null}

      <div className="settings-hero-grid">
        {reglesResume.map((item) => (
          <article key={item.label} className="settings-kpi-card">
            <span className="settings-kpi-label">{item.label}</span>
            <p className="settings-kpi-value">{item.value}</p>
            <p className="settings-kpi-hint">{item.hint}</p>
          </article>
        ))}
      </div>

      <div className="settings-grid">
        <section className="settings-card settings-card-wide">
          <header className="settings-card-header">
            <div>
              <h3 className="membre-dash-section-title">Soldes des caisses</h3>
              <p className="sheet-hint settings-inline-help">
                Les caisses évoluent via les versements et sorties. Elles sont en lecture seule ici.
              </p>
            </div>
          </header>
          <CaissesOverview parametres={parametres} loading={loading} error={error} />
        </section>

        <section className="settings-card settings-card-wide">
          <header className="settings-card-header">
            <div>
              <h3 className="membre-dash-section-title">Règles générales</h3>
              <p className="sheet-hint settings-inline-help">
                Paramètres utilisés pour les inscriptions, solidarités, emprunts et pénalités.
              </p>
            </div>
          </header>

          {loading ? (
            <div className="sg-empty">Chargement…</div>
          ) : error ? null : (
            <form className="params-form settings-form" onSubmit={handleSubmit}>
              <div className="settings-form-grid">
                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-inscription">
                    Montant d’inscription (XAF)
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
                  <p className="sheet-hint">Référence nominale. Le renflouement à l’ouverture d’exercice utilise la formule ci-dessous.</p>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-mensualite">
                    Mensualité de renflouement (XAF)
                  </label>
                  <input
                    id="p-mensualite"
                    className="form-control form-control-light"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.mensualiteRenflouement}
                    onChange={handleChange('mensualiteRenflouement')}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-nb-mois">
                    Nombre de mois
                  </label>
                  <input
                    id="p-nb-mois"
                    className="form-control form-control-light"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="24"
                    step="1"
                    value={form.nbMoisRenflouement}
                    onChange={handleChange('nbMoisRenflouement')}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-complement">
                    Complément de renflouement (XAF)
                  </label>
                  <input
                    id="p-complement"
                    className="form-control form-control-light"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.complementRenflouement}
                    onChange={handleChange('complementRenflouement')}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-forfait">
                    Forfait de renflouement (XAF)
                  </label>
                  <input
                    id="p-forfait"
                    className="form-control form-control-light"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.forfaitRenflouement}
                    onChange={handleChange('forfaitRenflouement')}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group settings-form-span-2">
                  <p className="sheet-hint">
                    Total à répartir entre les membres actifs à l’ouverture d’exercice :{' '}
                    <strong>{formatMoney(montantRenflouement(form))}</strong>
                    {' '}
                    = ({formatMoney(form.mensualiteRenflouement)} × {numberValue(form.nbMoisRenflouement, 12)})
                    {' + '}{formatMoney(form.complementRenflouement)}
                    {' + '}{formatMoney(form.forfaitRenflouement)}.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-solidarite">
                    Montant de solidarité (XAF)
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
                  <p className="sheet-hint">
                    À l’ouverture : (montant × total membres − solde caisse) ÷ membres actifs.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-taux">
                    Taux d’intérêt des emprunts
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
                  <p className="sheet-hint">Ex. `0.03` = 3 %</p>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-penalite">
                    Pénalité de retard (XAF)
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
                  <label className="form-label form-label-dark" htmlFor="p-facteur">
                    Facteur d’emprunt
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
                  <p className="sheet-hint">Plafond = épargne × facteur</p>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="p-duree">
                    Durée maximale d’un emprunt (mois)
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
              </div>

              <button
                type="submit"
                className="btn btn-accent btn-touch settings-save-btn"
                disabled={submitting}
              >
                {submitting ? 'Enregistrement…' : 'Enregistrer les paramètres'}
              </button>
            </form>
          )}
        </section>

        <section className="settings-card">
          <header className="settings-card-header">
            <div>
              <h3 className="membre-dash-section-title">Types d’aides</h3>
              <p className="sheet-hint settings-inline-help">
                Montants de référence utilisés pour les demandes d’assistance.
              </p>
            </div>
          </header>

          <div className="settings-stack">
            <ul className="membre-list settings-compact-list">
              {aides.map((a) => (
                <li key={a.id} className="membre-card">
                  <div className="membre-card-top">
                    <div className="membre-card-info">
                      <h2 className="membre-card-name">{a.typeAide}</h2>
                      <p className="membre-card-mail">{formatMoney(a.montant)}</p>
                    </div>
                  </div>
                  <div className="action-row">
                    <button
                      type="button"
                      className="btn btn-primary btn-touch"
                      disabled={aideBusy}
                      onClick={() =>
                        setAideForm({
                          id: a.id,
                          typeAide: a.typeAide,
                          montant: String(a.montant),
                        })
                      }
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost-dark btn-touch"
                      disabled={aideBusy}
                      onClick={() => handleDeleteAide(a.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <form className="params-form settings-subform" onSubmit={handleSaveAide}>
              <h4 className="flux-group-title">
                {aideForm.id ? 'Modifier une aide' : 'Ajouter une aide'}
              </h4>
              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="aide-type">
                  Type d’aide
                </label>
                <input
                  id="aide-type"
                  className="form-control form-control-light"
                  value={aideForm.typeAide}
                  onChange={(e) =>
                    setAideForm((f) => ({ ...f, typeAide: e.target.value }))
                  }
                  required
                  disabled={aideBusy}
                  placeholder="ex. naissance"
                />
              </div>
              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="aide-montant">
                  Montant (XAF)
                </label>
                <input
                  id="aide-montant"
                  className="form-control form-control-light"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={aideForm.montant}
                  onChange={(e) =>
                    setAideForm((f) => ({ ...f, montant: e.target.value }))
                  }
                  required
                  disabled={aideBusy}
                />
              </div>
              <div className="action-row">
                <button
                  type="submit"
                  className="btn btn-accent btn-touch"
                  disabled={aideBusy}
                >
                  {aideBusy ? '…' : aideForm.id ? 'Enregistrer' : 'Ajouter'}
                </button>
                {aideForm.id ? (
                  <button
                    type="button"
                    className="btn btn-ghost-dark btn-touch"
                    onClick={resetAideForm}
                    disabled={aideBusy}
                  >
                    Annuler
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card-header">
            <div>
              <h3 className="membre-dash-section-title">Occupants des postes</h3>
              <p className="sheet-hint settings-inline-help">
                Choisissez le membre qui occupe chaque poste du bureau.
              </p>
            </div>
          </header>

          <ul className="membre-list settings-compact-list">
            {postes.map((p) => (
              <li key={p.id} className="membre-card">
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{posteLabel(p.intitule)}</h2>
                  <p className="membre-card-mail">{p.login}</p>
                </div>
                <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                  <label className="form-label form-label-dark" htmlFor={`poste-${p.id}`}>
                    Occupant
                  </label>
                  <select
                    id={`poste-${p.id}`}
                    className="form-control form-control-light"
                    value={p.membre?.id || ''}
                    disabled={posteBusy === p.id}
                    onChange={(e) => handleChangeOccupant(p, e.target.value)}
                  >
                    <option value="">— Choisir —</option>
                    {membres.map((m) => (
                      <option key={m.id} value={m.id}>
                        {membreOptionLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
