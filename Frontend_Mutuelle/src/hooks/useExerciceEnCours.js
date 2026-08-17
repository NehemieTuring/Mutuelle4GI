import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

/**
 * Charge l'exercice « en cours » (null si aucun).
 * @param {{ pollMs?: number }} [options]
 */
export function useExerciceEnCours(options = {}) {
  const { pollMs = 0 } = options
  const [exercice, setExercice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await api.getExerciceEnCours()
      setExercice(data)
      setError('')
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Exercice indisponible')
      setExercice(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      await refresh()
      if (!alive) return
    })()
    return () => {
      alive = false
    }
  }, [refresh])

  useEffect(() => {
    if (!pollMs) return undefined
    const id = window.setInterval(refresh, pollMs)
    return () => window.clearInterval(id)
  }, [pollMs, refresh])

  return {
    exercice,
    exerciceActif: !!exercice,
    loading,
    error,
    refresh,
  }
}
