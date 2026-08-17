import { useEffect, useId, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Groupe de navigation repliable (sous-menus masqués par défaut).
 */
export default function BureauNavGroup({
  label,
  icon = null,
  pathPrefixes = [],
  children,
}) {
  const location = useLocation()
  const panelId = useId()
  const childActive = pathPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  )
  const [open, setOpen] = useState(childActive)

  useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  return (
    <div className={`bureau-nav-group ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className={`bureau-nav-item bureau-nav-toggle ${childActive ? 'has-active-child' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {icon ? <span className="bureau-nav-icon">{icon}</span> : null}
        <span className="bureau-nav-toggle-label">{label}</span>
        <span className="bureau-nav-chevron" aria-hidden="true" />
      </button>
      <div
        id={panelId}
        className="bureau-nav-sublist"
        hidden={!open}
      >
        {children}
      </div>
    </div>
  )
}
