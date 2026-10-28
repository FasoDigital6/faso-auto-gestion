"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/data/session/auth-context";
import { useParametres } from "@/data/queries/use-administration";
import { ParametresForm } from "../components/parametres-form";

export default function ParametresPage() {
  const user = useAuth();
  const query = useParametres();
  if (user?.role !== "admin") return <p role="alert">Accès réservé aux administrateurs.</p>;
  return <div className="max-w-5xl space-y-6">
    <PageHeader title="Paramètres" description="Taux de change, taxes et identité de Sacko-Vert Inc." />
    {query.isPending ? <p role="status">Chargement des paramètres…</p> : query.isError ?
      <div role="alert" className="space-y-3"><p>{query.error.message}</p><Button variant="outline" onClick={() => query.refetch()}>Réessayer</Button></div> : <>
        <ParametresForm key={query.data.courant.revision} courant={query.data.courant} onSaved={() => query.refetch()} />
        <section aria-labelledby="historique-title" className="space-y-4">
          <div><h2 id="historique-title" className="font-serif text-xl font-semibold">Historique des paramètres</h2>
            <p className="text-sm text-muted-foreground">Les 20 dernières versions. Chaque enregistrement conserve une copie datée des taux, des taxes et de l’identité.</p></div>
          {!query.data.historique.length ? <p className="rounded-lg border p-6 text-sm text-muted-foreground">Aucun enregistrement pour le moment.</p> :
            <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
              <thead className="bg-muted"><tr>{["Version", "Date (Montréal)", "1 CAD en USD", "1 CAD en GNF", "TPS / TVQ"].map((title) => <th className="p-3 text-left" key={title}>{title}</th>)}</tr></thead>
              <tbody>{query.data.historique.map((version) => <tr className="border-t" key={version.revision}>
                <td className="p-3">{version.revision}</td>
                <td className="p-3 whitespace-nowrap">{version.updatedAt ? new Date(version.updatedAt).toLocaleString("fr-CA", { timeZone: "America/Toronto" }) : "—"}</td>
                <td className="p-3">{version.taux?.USD.toLocaleString("fr-CA", { maximumFractionDigits: 6 })}</td>
                <td className="p-3">{version.taux?.GNF.toLocaleString("fr-CA", { maximumFractionDigits: 6 })}</td>
                <td className="p-3 whitespace-nowrap">{version.taxes.tps.toLocaleString("fr-CA")} % / {version.taxes.tvq.toLocaleString("fr-CA")} %</td>
              </tr>)}</tbody>
            </table></div>}
        </section>
      </>}
  </div>;
}
