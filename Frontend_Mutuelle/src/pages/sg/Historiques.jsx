import SgHistoriqueVersements from './HistoriqueVersements'

export function SgEpargnes() {
  return <SgHistoriqueVersements raison="epargne" />
}

export function SgInscriptions() {
  return <SgHistoriqueVersements raison="inscription" />
}

export function SgSolidarites() {
  return <SgHistoriqueVersements raison="solidarite" />
}
