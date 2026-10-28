"use client";

import { Gauge } from "lucide-react";

import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/patterns/etats/empty-state";
import { useAuth } from "@/data/session/auth-context";
import { sitesDe } from "@/domain/permissions/has-permission";
import { SITE_LABELS, getRoleLabel } from "@/domain/permissions/permissions";

export default function TableauDeBordPage() {
  const user = useAuth();
  const prenom = user?.displayName?.split(" ")[0];
  const sites = sitesDe(user).map((site) => SITE_LABELS[site]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={prenom ? `Bonjour, ${prenom}` : "Tableau de bord"}
        description={`${getRoleLabel(user?.role)} · ${sites.length ? sites.join(" et ") : "aucun site attribué"}`}
      />
      <EmptyState
        icon={Gauge}
        title="Les indicateurs arrivent avec les modules"
        description="Achats, ventes, stock au Canada et en Guinée, conteneurs en mer et créances s'afficheront ici dès que les véhicules, les clients et les paiements seront saisis."
      />
    </div>
  );
}
