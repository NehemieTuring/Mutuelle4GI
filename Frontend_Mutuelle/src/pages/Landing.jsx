import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero-mutuelle.png'

const SERVICES = [
  {
    name: 'Épargne collective',
    desc: 'Constituez une épargne sécurisée et suivez vos soldes au fil des sessions.',
  },
  {
    name: 'Prêts entre membres',
    desc: 'Accédez à des avances à taux maîtrisé, remboursables selon les règles de la mutuelle.',
  },
  {
    name: 'Caisse de solidarité',
    desc: 'Cotisez ensemble pour soutenir les membres lors des moments difficiles.',
  },
  {
    name: 'Assistances',
    desc: 'Déposez une demande d’aide ; le bureau examine et valide chaque dossier.',
  },
]

function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          observer.unobserve(node)
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}

export default function Landing() {
  const missionRef = useReveal()
  const servicesRef = useReveal()
  const ctaRef = useReveal()

  return (
    <div className="landing">
      <nav className="landing-nav" aria-label="Navigation principale">
        <a href="#top" className="nav-brand">
          Mutuelle ENSPY
        </a>
        <div className="nav-actions">
          <a href="#services" className="nav-link">
            Services
          </a>
          <Link to="/connexion" className="btn btn-accent btn-touch">
            Se connecter
          </Link>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-media" aria-hidden="true">
          <img
            src={heroImage}
            alt="Membres de la mutuelle réunis pour une session de cotisation et d’épargne collective"
            width={1536}
            height={1024}
            fetchPriority="high"
          />
          <div className="hero-scrim" />
        </div>

        <div className="hero-content">
          <h1 className="hero-brand">
            Mutuelle <span>ENSPY</span>
          </h1>
          <p className="hero-headline">
            L’épargne et la solidarité au service de la communauté polytechnicienne.
          </p>
          <p className="hero-lead">
            Une mutuelle gérée pour et par les membres — transparente, accessible,
            tournée vers l’entraide.
          </p>
          <div className="hero-ctas">
            <Link to="/connexion" className="btn btn-accent btn-lg btn-touch">
              Accéder à mon espace
            </Link>
            <a href="#mission" className="btn btn-ghost btn-lg">
              Découvrir la mutuelle
            </a>
          </div>
        </div>
      </header>

      <section className="section section-mission" id="mission">
        <div className="section-inner mission-grid reveal" ref={missionRef}>
          <div>
            <span className="section-label">Notre mission</span>
            <h2 className="section-title">
              Une mutuelle conçue pour l’ENSPY
            </h2>
            <p className="section-lead">
              Soutenir les adhérents dans la durée : épargner, emprunter, et
              répondre aux urgences grâce à une caisse commune.
            </p>
          </div>
          <p className="mission-aside">
            Exercices comptables, sessions, cotisations et assistances — tout est
            suivi dans une console claire, pour un bureau et des membres alignés.
          </p>
        </div>
      </section>

      <section className="section section-services" id="services">
        <div className="section-inner reveal" ref={servicesRef}>
          <span className="section-label">Ce que nous offrons</span>
          <h2 className="section-title">Quatre piliers, une même confiance</h2>
          <p className="section-lead">
            Des mécanismes simples, des règles partagées, un suivi des flux en
            temps réel.
          </p>

          <ul className="services-list">
            {SERVICES.map((service, index) => (
              <li className="service-item" key={service.name}>
                <span className="service-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-desc">{service.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-cta" id="connexion">
        <div className="cta-inner reveal" ref={ctaRef}>
          <h2 className="cta-title">Prêt à rejoindre ou gérer la mutuelle ?</h2>
          <p className="cta-lead">
            Connectez-vous pour consulter vos soldes, vos opérations et le suivi
            des sessions.
          </p>
          <Link to="/connexion" className="btn btn-accent btn-lg btn-touch">
            Se connecter
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <span className="footer-brand">Mutuelle ENSPY</span>
        <span>École Nationale Supérieure Polytechnique de Yaoundé</span>
      </footer>
    </div>
  )
}
