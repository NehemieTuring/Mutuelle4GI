import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  MembreOnboardingGate,
  RedirectIfAuth,
  RequireAuth,
  RequireCommissaire,
  RequireMembre,
  RequirePresident,
  RequireSecretaireGeneral,
  RequireTresorier,
} from './components/AuthGate'
import SgLayout from './layouts/SgLayout'
import TrLayout from './layouts/TrLayout'
import MembreLayout from './layouts/MembreLayout'
import PresidentLayout from './layouts/PresidentLayout'
import CommissaireLayout from './layouts/CommissaireLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Espace from './pages/Espace'
import SgMembres from './pages/sg/Membres'
import SgCaisses from './pages/sg/Caisses'
import {
  SgEpargnes,
  SgInscriptions,
  SgSolidarites,
} from './pages/sg/Historiques'
import SgEmprunts from './pages/sg/Emprunts'
import SgSorties from './pages/sg/Sorties'
import SgParametres from './pages/sg/Parametres'
import SgExercices from './pages/sg/Exercices'
import ActiverCompte from './pages/membre/ActiverCompte'
import PayerInscription from './pages/membre/PayerInscription'
import MembreEpargne from './pages/membre/Epargne'
import MembreAide from './pages/membre/Aide'
import MembreEmprunt from './pages/membre/Emprunt'
import MembreRetrait from './pages/membre/Retrait'
import MembreMonCompte from './pages/membre/MonCompte'
import TrVersements from './pages/tr/Versements'
import TrSorties from './pages/tr/Sorties'
import TrRemboursements from './pages/tr/Remboursements'
import TrCaisses from './pages/tr/Caisses'
import TrFlux from './pages/tr/Flux'
import PresidentAccueil from './pages/president/Accueil'
import PresidentCaisses from './pages/president/Caisses'
import PresidentMembres from './pages/president/Membres'
import PresidentEmprunts from './pages/president/Emprunts'
import PresidentFlux from './pages/president/Flux'
import CommissaireAccueil from './pages/commissaire/Accueil'
import CommissaireCaisses from './pages/commissaire/Caisses'
import CommissaireFlux from './pages/commissaire/Flux'
import CommissaireMembres from './pages/commissaire/Membres'
import CommissaireVersements from './pages/commissaire/Versements'
import CommissaireSorties from './pages/commissaire/Sorties'
import CommissaireEmprunts from './pages/commissaire/Emprunts'
import MutuelleRefreshProvider from './components/MutuelleRefreshProvider'
import BureauMonCompte from './pages/bureau/MonCompte'

function App() {
  return (
    <MutuelleRefreshProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/connexion"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />
        <Route element={<RequireAuth />}>
          <Route path="/espace" element={<Espace />} />
        </Route>
        <Route element={<RequireSecretaireGeneral />}>
          <Route path="/sg" element={<SgLayout />}>
            <Route index element={<Navigate to="membres" replace />} />
            <Route path="membres" element={<SgMembres />} />
            <Route path="caisses" element={<SgCaisses />} />
            <Route path="epargnes" element={<SgEpargnes />} />
            <Route path="inscriptions" element={<SgInscriptions />} />
            <Route path="solidarites" element={<SgSolidarites />} />
            <Route path="emprunts" element={<SgEmprunts />} />
            <Route path="sorties/:sousOnglet" element={<SgSorties />} />
            <Route path="sorties" element={<Navigate to="en-attente" replace />} />
            <Route path="parametres" element={<SgParametres />} />
            <Route path="exercices" element={<SgExercices />} />
            <Route path="compte" element={<BureauMonCompte />} />
          </Route>
        </Route>
        <Route element={<RequireTresorier />}>
          <Route path="/tr" element={<TrLayout />}>
            <Route index element={<Navigate to="caisses" replace />} />
            <Route path="caisses" element={<TrCaisses />} />
            <Route path="flux" element={<TrFlux />} />
            <Route path="versements/:sousOnglet" element={<TrVersements />} />
            <Route
              path="versements"
              element={<Navigate to="en-attente" replace />}
            />
            <Route path="sorties/:sousOnglet" element={<TrSorties />} />
            <Route path="sorties" element={<Navigate to="en-attente" replace />} />
            <Route path="remboursements" element={<TrRemboursements />} />
            <Route path="compte" element={<BureauMonCompte />} />
          </Route>
        </Route>
        <Route element={<RequirePresident />}>
          <Route path="/president" element={<PresidentLayout />}>
            <Route index element={<PresidentAccueil />} />
            <Route path="caisses" element={<PresidentCaisses />} />
            <Route path="membres" element={<PresidentMembres />} />
            <Route path="flux" element={<PresidentFlux />} />
            <Route path="epargnes" element={<SgEpargnes />} />
            <Route path="inscriptions" element={<SgInscriptions />} />
            <Route path="solidarites" element={<SgSolidarites />} />
            <Route path="emprunts" element={<PresidentEmprunts />} />
            <Route path="sorties" element={<CommissaireSorties />} />
            <Route path="compte" element={<BureauMonCompte />} />
          </Route>
        </Route>
        <Route element={<RequireCommissaire />}>
          <Route path="/commissaire" element={<CommissaireLayout />}>
            <Route index element={<CommissaireAccueil />} />
            <Route path="caisses" element={<CommissaireCaisses />} />
            <Route path="membres" element={<CommissaireMembres />} />
            <Route path="flux" element={<CommissaireFlux />} />
            <Route path="epargnes" element={<SgEpargnes />} />
            <Route path="inscriptions" element={<SgInscriptions />} />
            <Route path="solidarites" element={<SgSolidarites />} />
            <Route path="emprunts" element={<CommissaireEmprunts />} />
            <Route path="sorties" element={<CommissaireSorties />} />
            <Route path="versements" element={<CommissaireVersements />} />
            <Route path="compte" element={<BureauMonCompte />} />
          </Route>
        </Route>
        <Route element={<RequireMembre />}>
          <Route element={<MembreOnboardingGate step="activer" />}>
            <Route path="/membre/activer" element={<ActiverCompte />} />
          </Route>
          <Route element={<MembreOnboardingGate step="inscription" />}>
            <Route path="/membre/inscription" element={<PayerInscription />} />
          </Route>
          <Route element={<MembreOnboardingGate step="home" />}>
            <Route path="/membre" element={<MembreLayout />}>
              <Route index element={<Navigate to="epargne" replace />} />
              <Route path="epargne" element={<MembreEpargne />} />
              <Route path="retrait" element={<MembreRetrait />} />
              <Route path="aide" element={<MembreAide />} />
              <Route path="emprunt" element={<MembreEmprunt />} />
              <Route path="compte" element={<MembreMonCompte />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </MutuelleRefreshProvider>
  )
}

export default App
