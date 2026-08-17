/** Classes badge partagées */
export const BADGE = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  info: 'badge badge-info',
  neutral: 'badge badge-neutral',
  accent: 'badge badge-accent',
  pending: 'badge badge-pending',
}

function fallback(statut) {
  return { label: statut || '—', badge: BADGE.neutral }
}

/** @returns {{ label: string, badge: string }} */
export function getVersementStatut(statut) {
  const map = {
    en_attente: { label: 'En attente', badge: BADGE.pending },
    accepte: { label: 'Validé', badge: BADGE.success },
    refuse: { label: 'Refusé', badge: BADGE.danger },
  }
  return map[statut] || fallback(statut)
}

/** @returns {{ label: string, badge: string }} */
export function getSortieStatut(statut) {
  const map = {
    en_attente_secretaire_general: {
      label: 'Attente SG',
      badge: BADGE.info,
    },
    en_attente_tresorier: {
      label: 'Attente trésorier',
      badge: BADGE.pending,
    },
    accepte_par_sg_accepte_par_tr: {
      label: 'Validée (SG+TR)',
      badge: BADGE.accent,
    },
    accepte_par_sg_refuse_par_tr: {
      label: 'Refusée (TR)',
      badge: BADGE.danger,
    },
    refuse_par_sg_refuse_par_tr: {
      label: 'Refusée (SG)',
      badge: BADGE.danger,
    },
    refuse_par_sg_accepte_par_tr: {
      label: 'Refusée (SG)',
      badge: BADGE.danger,
    },
    recue_par_membre: {
      label: 'Reçue par le membre',
      badge: BADGE.success,
    },
  }
  return map[statut] || fallback(statut)
}

/** @returns {{ label: string, badge: string }} */
export function getRemboursementStatut(statut) {
  const map = {
    en_attente_tr: { label: 'Attente trésorier', badge: BADGE.pending },
    valide_tr: { label: 'Validé', badge: BADGE.success },
    refuse_tr: { label: 'Refusé', badge: BADGE.danger },
  }
  return map[statut] || fallback(statut)
}

/** @returns {{ label: string, badge: string }} */
export function getPretStatut(statut, { echu = false } = {}) {
  if (statut === 'rembourse') {
    return { label: 'Remboursé', badge: BADGE.success }
  }
  if (echu) {
    return { label: 'Échéance dépassée', badge: BADGE.danger }
  }
  if (statut === 'non rembourse') {
    return { label: 'Non remboursé', badge: BADGE.warning }
  }
  return fallback(statut)
}

/** @returns {{ label: string, badge: string }} */
export function getMembreEtatStatut(etat) {
  const map = {
    'a jour': { label: 'À jour', badge: BADGE.success },
    'non a jour': { label: 'Non à jour', badge: BADGE.warning },
    Inactif: { label: 'Inactif', badge: BADGE.danger },
  }
  return map[etat] || fallback(etat)
}

/** @returns {{ label: string, badge: string }} */
export function getExerciceStatut(statut) {
  const map = {
    'en cours': { label: 'En cours', badge: BADGE.accent },
    ferme: { label: 'Clôturé', badge: BADGE.neutral },
  }
  return map[statut] || fallback(statut)
}

/** @param {'versement'|'sortie'|'remboursement'|'pret'|'membre'|'exercice'} type */
export function getStatutMeta(type, statut, options = {}) {
  switch (type) {
    case 'versement':
      return getVersementStatut(statut)
    case 'sortie':
      return getSortieStatut(statut)
    case 'remboursement':
      return getRemboursementStatut(statut)
    case 'pret':
      return getPretStatut(statut, options)
    case 'membre':
      return getMembreEtatStatut(statut)
    case 'exercice':
      return getExerciceStatut(statut)
    default:
      return fallback(statut)
  }
}
