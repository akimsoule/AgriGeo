import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="empty-state">
      <title>Page introuvable — AgriGeo</title>
      <h2>Page introuvable</h2>
      <p>La page demandée n’existe pas ou a été déplacée.</p>
      <Button asChild>
        <Link to="/">Retour à l’accueil</Link>
      </Button>
    </div>
  );
}
