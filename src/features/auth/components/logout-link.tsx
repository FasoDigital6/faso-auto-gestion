"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { logout } from "@/data/session/logout";

/**
 * Lien de déconnexion. Ne PAS utiliser `<Link href="/api/logout">` : cette
 * route est interceptée par next-firebase-auth-edge, qui vide le cookie et
 * répond avec un JSON brut ({"success":true}) sans jamais rediriger — une
 * navigation directe dessus affiche donc ce JSON à l'écran.
 */
export function LogoutLink({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    window.location.href = "/login";
  };

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className={className}>
      {loading && <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />}
      Se déconnecter
    </button>
  );
}
