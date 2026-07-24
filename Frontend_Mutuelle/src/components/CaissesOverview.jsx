function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

/**
 * Affiche les soldes des trois caisses mutuelle.
 * @param {{ parametres: object | null, loading?: boolean, error?: string }} props
 */
export default function CaissesOverview({ parametres, loading, error }) {
  if (loading) {
    return <div className="sg-empty">Chargement des caisses…</div>
  }
  if (error) {
    return (
      <div className="inline-error" role="alert">
        {error}
      </div>
    )
  }
  if (!parametres) {
    return <div className="sg-empty">Aucune donnée de caisse.</div>
  }

  const items = [
    {
      id: 'inscriptions',
      label: 'Caisse inscriptions',
      value: parametres.caisseInscriptions,
    },
    {
      id: 'solidarites',
      label: 'Caisse solidarités',
      value: parametres.caisseSolidarites,
    },
    {
      id: 'epargnes',
      label: 'Caisse épargnes',
      value: parametres.caisseEpargnes,
    },
  ]

  return (
    <ul className="caisses-grid">
      {items.map((item) => (
        <li key={item.id} className="caisse-tile">
          <span className="caisse-tile-label">{item.label}</span>
          <p className="caisse-tile-value">{formatMoney(item.value)}</p>
        </li>
      ))}
    </ul>
  )
}
