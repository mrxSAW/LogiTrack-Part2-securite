import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main>
      <h1>Page introuvable</h1>

      <p>La page demandée n’existe pas.</p>

      <Link to="/dashboard">
        Retour au tableau de bord
      </Link>
    </main>
  )
}