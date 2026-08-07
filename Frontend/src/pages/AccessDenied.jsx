import { Link } from 'react-router-dom'

export default function AccessDenied() {
  return (
    <main>
      <h1>Accès refusé</h1>

      <p>Vous n’avez pas la permission d’accéder à cette page.</p>

      <Link to="/dashboard">
        Retour au tableau de bord
      </Link>
    </main>
  )
}