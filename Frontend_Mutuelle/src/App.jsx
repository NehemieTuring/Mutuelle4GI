import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  MembreOnboardingGate,
  RedirectIfAuth,
  RequireAuth,
  RequireMembre,
  RequireSecretaireGeneral,
  RequireTresorier,
} from './components/AuthGate'
import SgLayout from './layouts/SgLayout'
import TrLayout from './layouts/TrLayout'
import MembreLayout from './layouts/MembreLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Espace from './pages/Espace'
import SgMembres from './pages/sg/Membres'
import {
  SgEpargnes,
  SgInscriptions,
  SgSolidarites,
} from './pages/sg/Historiques'
import SgEmprunts from './pages/sg/Emprunts'
import SgSorties from './pages/sg/Sorties'
import ActiverCompte from './pages/membre/ActiverCompte'
import PayerInscription from './pages/membre/PayerInscription'
import MembreAccueil from './pages/membre/Accueil'
import MembreEpargne from './pages/membre/Epargne'
import MembreAide from './pages/membre/Aide'
import MembreEmprunt from './pages/membre/Emprunt'
import MembreRetrait from './pages/membre/Retrait'
import TrVersements from './pages/tr/Versements'
import TrSorties from './pages/tr/Sorties'
import TrRemboursements from './pages/tr/Remboursements'

function App() {
  return (
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
            <Route path="epargnes" element={<SgEpargnes />} />
            <Route path="inscriptions" element={<SgInscriptions />} />
            <Route path="solidarites" element={<SgSolidarites />} />
            <Route path="emprunts" element={<SgEmprunts />} />
            <Route path="sorties/:sousOnglet" element={<SgSorties />} />
            <Route path="sorties" element={<Navigate to="en-attente" replace />} />
          </Route>
        </Route>
        <Route element={<RequireTresorier />}>
          <Route path="/tr" element={<TrLayout />}>
            <Route index element={<Navigate to="versements/en-attente" replace />} />
            <Route path="versements/:sousOnglet" element={<TrVersements />} />
            <Route
              path="versements"
              element={<Navigate to="en-attente" replace />}
            />
            <Route path="sorties/:sousOnglet" element={<TrSorties />} />
            <Route path="sorties" element={<Navigate to="en-attente" replace />} />
            <Route path="remboursements" element={<TrRemboursements />} />
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
              <Route index element={<MembreAccueil />} />
              <Route path="epargne" element={<MembreEpargne />} />
              <Route path="retrait" element={<MembreRetrait />} />
              <Route path="aide" element={<MembreAide />} />
              <Route path="emprunt" element={<MembreEmprunt />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
