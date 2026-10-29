"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/data/session/auth-context";
import { useUtilisateurs } from "@/data/queries/use-administration";
import { getRoleLabel, SITE_LABELS, type Site } from "@/domain/permissions/permissions";
import { MAX_UTILISATEURS, type Utilisateur } from "@/domain/types/utilisateur";
import { updateUserAction, resendInvitationAction } from "@/server/actions/user-actions";
import { UserFormSheet } from "../components/user-form-sheet";

export default function UtilisateursPage() {
  const session = useAuth();
  const router = useRouter();
  const query = useUtilisateurs();
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<Utilisateur | "new" | null>(null);
  const [confirmation, setConfirmation] = useState<Utilisateur | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const users = query.data ?? [];
  const filtered = users.filter((u) => `${u.prenom} ${u.nom} ${u.email}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")));

  async function saved(uid: string) {
    if (uid === session?.uid) { router.push("/login"); router.refresh(); }
    else await query.refetch();
  }

  async function toggle() {
    if (!confirmation) return;
    setPending(true); setError(null);
    try {
      const result = await updateUserAction(confirmation.id, { disabled: !confirmation.disabled });
      if ("error" in result) { setError(result.error); return; }
      toast.success(confirmation.disabled ? "Compte réactivé." : "Compte désactivé.");
      await saved(confirmation.id);
      setConfirmation(null);
    } catch { setError("La modification a échoué. Réessayez."); }
    finally { setPending(false); }
  }

  if (session?.role !== "admin") return <p role="alert">Accès réservé aux administrateurs.</p>;
  return <div className="space-y-6">
    <PageHeader title="Utilisateurs" description="Les comptes de votre équipe et leurs droits au Canada et en Guinée."
      action={<Button disabled={query.isPending || query.isError || users.length >= MAX_UTILISATEURS} onClick={() => setEditor("new")}><Plus /> Nouvel utilisateur</Button>} />
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="size-4" /> {users.length} / {MAX_UTILISATEURS} comptes, comptes désactivés inclus</div>
      <Input className="sm:max-w-xs" aria-label="Rechercher un utilisateur" placeholder="Rechercher un nom ou un email" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    {query.isPending ? <p role="status">Chargement des utilisateurs…</p> : query.isError ?
      <div role="alert" className="space-y-3"><p>{query.error.message}</p><Button variant="outline" onClick={() => query.refetch()}>Réessayer</Button></div> :
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <caption className="sr-only">Comptes de l’équipe Sacko-Green</caption>
          <thead className="bg-muted"><tr>{["Utilisateur", "Rôle et sites", "État", "Actions"].map((label) => <th key={label} className="p-4 text-left font-medium">{label}</th>)}</tr></thead>
          <tbody>{filtered.map((user) => <tr key={user.id} className="border-t">
            <td className="p-4"><div className="font-semibold">{user.prenom} {user.nom}{user.id === session.uid && <span className="ml-2 font-normal text-muted-foreground">(vous)</span>}</div><div className="text-muted-foreground">{user.email}</div>{user.poste && <div className="text-muted-foreground">{user.poste}</div>}</td>
            <td className="p-4"><div>{getRoleLabel(user.role)}</div><div className="text-muted-foreground">{user.role === "admin" ? "Canada · Guinée" : user.sites?.map((site) => SITE_LABELS[site as Site]).join(" · ")}</div></td>
            <td className="p-4"><Badge variant="outline">{user.statut === "creation" ? "Création en cours" : user.disabled ? "Désactivé" : "Actif"}</Badge>{user.invitationEnvoyee === false && <p className="mt-1 text-xs text-muted-foreground">Invitation à envoyer</p>}</td>
            <td className="p-4"><div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={user.statut === "creation"} onClick={() => setEditor(user)} aria-label={`Modifier ${user.prenom} ${user.nom}`}>Modifier</Button>
              <Button variant="ghost" size="sm" disabled={user.statut === "creation"} onClick={() => { setConfirmation(user); setError(null); }} aria-label={`${user.disabled ? "Réactiver" : "Désactiver"} ${user.prenom} ${user.nom}`}>{user.disabled ? "Réactiver" : "Désactiver"}</Button>
              {!user.disabled && user.invitationEnvoyee === false && <Button size="sm" variant="ghost" disabled={pending} onClick={async () => {
                setPending(true);
                try {
                  const result = await resendInvitationAction(user.id);
                  if ("error" in result) toast.error(result.error);
                  else { toast.success("Invitation envoyée."); await query.refetch(); }
                } catch { toast.error("L’envoi a échoué."); } finally { setPending(false); }
              }}>Renvoyer l’invitation</Button>}
            </div></td>
          </tr>)}</tbody>
        </table>
        {!filtered.length && <p className="p-8 text-center text-muted-foreground">Aucun utilisateur ne correspond à votre recherche.</p>}
      </div>}
    {editor && <UserFormSheet user={editor === "new" ? null : editor} onClose={() => setEditor(null)} onSaved={saved} />}
    <Dialog open={!!confirmation} onOpenChange={(open) => { if (!open && !pending) setConfirmation(null); }}>
      <DialogContent size="sm">
        <DialogHeader><DialogTitle>{confirmation?.disabled ? "Réactiver" : "Désactiver"} ce compte ?</DialogTitle>
          <DialogDescription>{confirmation?.prenom} {confirmation?.nom} — {confirmation?.disabled ? "L’employé pourra à nouveau se connecter." : "Ses accès seront bloqués, y compris pour sa session actuelle."}</DialogDescription></DialogHeader>
        {error && <p role="alert" className="text-sm text-destructive-ink">{error}</p>}
        <DialogFooter><Button variant="outline" disabled={pending} onClick={() => setConfirmation(null)}>Annuler</Button><Button disabled={pending} onClick={toggle}>{pending ? "Enregistrement…" : "Confirmer"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
