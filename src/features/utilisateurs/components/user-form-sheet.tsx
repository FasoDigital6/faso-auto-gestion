"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Slider } from "@/components/ui/slider";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { createUserAction, updateUserAction } from "@/server/actions/user-actions";
import { createUserSchema, type CreateUserInput } from "@/domain/schemas/user-schema";
import type { Utilisateur } from "@/domain/types/utilisateur";
import { ALL_MODULES, ALL_ACTIONS, ALL_SITES, ALL_SPECIALES, MODULE_LABELS, ACTION_LABELS, SITE_LABELS, SPECIALE_LABELS, MODELES_ACCES } from "@/domain/permissions/permissions";

type Props = { user: Utilisateur | null; onClose: () => void; onSaved: (uid: string) => Promise<void> };

export function UserFormSheet({ user, onClose, onSaved }: Props) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.input<typeof createUserSchema>, unknown, CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: user ? { ...user } : { nom: "", prenom: "", email: "", telephone: "", poste: "", role: "user", ...MODELES_ACCES.vendeur.acces },
  });
  const role = form.watch("role");
  const droits = form.watch("droits") ?? [];
  const sites = form.watch("sites") ?? [];
  const speciales = form.watch("speciales") ?? [];
  const busy = form.formState.isSubmitting;

  async function submit(values: CreateUserInput) {
    setError(null);
    try {
      const result = user ? await updateUserAction(user.id, values) : await createUserAction(values);
      if ("error" in result) { setError(result.error); return; }
      if (result.warning) toast.warning(result.warning);
      else toast.success(user ? "Utilisateur enregistré." : "Utilisateur créé. Invitation envoyée.");
      await onSaved(result.userId);
      onClose();
    } catch { setError("L'enregistrement a échoué. Réessayez."); }
  }

  return (
    <Slider isOpen onClose={() => { if (!busy) onClose(); }} title={user ? "Modifier l’utilisateur" : "Nouvel utilisateur"}
      description="Identité, sites et droits d’accès. Les changements de droits demandent une nouvelle connexion."
      size="sm:max-w-2xl">
      <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
        <fieldset disabled={busy} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6">
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-ink">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {([ ["prenom", "Prénom"], ["nom", "Nom"], ["email", "Email"], ["telephone", "Téléphone"], ["poste", "Poste"] ] as const).map(([name, label]) => (
              <Field key={name}>
                <FieldLabel htmlFor={`user-${name}`}>{label}{["prenom", "nom", "email"].includes(name) ? " *" : ""}</FieldLabel>
                <Input id={`user-${name}`} type={name === "email" ? "email" : name === "telephone" ? "tel" : "text"}
                  {...form.register(name)} aria-invalid={!!form.formState.errors[name]}
                  aria-describedby={form.formState.errors[name] ? `error-${name}` : undefined} />
                <FieldError id={`error-${name}`} errors={[form.formState.errors[name]]} />
              </Field>
            ))}
          </div>
          <Field>
            <FieldLabel htmlFor="user-role">Rôle</FieldLabel>
            <Controller control={form.control} name="role" render={({ field }) => (
              <Combobox id="user-role" options={[{ value: "user", label: "Employé" }, { value: "admin", label: "Administrateur" }]}
                value={field.value} onValueChange={field.onChange} />
            )} />
          </Field>
          {role === "admin" ? <p className="rounded-md bg-muted p-4 text-sm">Accès à tous les modules, aux deux sites et à l’administration.</p> : <>
            <fieldset className="space-y-3">
              <legend className="mb-3 font-semibold">Modèle de départ</legend>
              <div className="flex flex-wrap gap-2">
                {Object.entries(MODELES_ACCES).map(([key, model]) => (
                  <Button key={key} type="button" variant="outline" size="sm" onClick={() => {
                    form.setValue("droits", [...model.acces.droits], { shouldDirty: true });
                    form.setValue("sites", [...model.acces.sites], { shouldDirty: true });
                    form.setValue("speciales", [], { shouldDirty: true });
                  }}>{model.libelle}</Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Appliquer un modèle remplace les droits ci-dessous. Vous pouvez ensuite les ajuster.</p>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-semibold">Sites accessibles</legend>
              <div className="flex gap-6">{ALL_SITES.map((site) => (
                <label key={site} className="flex min-h-11 cursor-pointer items-center gap-2">
                  <Checkbox aria-label={SITE_LABELS[site]} checked={sites.includes(site)} onCheckedChange={(checked) =>
                    form.setValue("sites", checked ? [...sites, site] : sites.filter((s) => s !== site), { shouldDirty: true })} />
                  {SITE_LABELS[site]}
                </label>
              ))}</div>
            </fieldset>
            <div>
              <h2 className="mb-3 font-semibold">Droits par module</h2>
              <p className="mb-3 text-sm text-muted-foreground">Créer, modifier ou supprimer donne aussi accès à la lecture.</p>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr><th className="p-3 text-left">Module</th>{ALL_ACTIONS.map((action) => <th key={action} className="p-2 text-center">{ACTION_LABELS[action]}</th>)}</tr></thead>
                  <tbody>{ALL_MODULES.map((module) => <tr key={module} className="border-t">
                    <th scope="row" className="p-3 text-left font-medium">{MODULE_LABELS[module]}</th>
                    {ALL_ACTIONS.map((action) => {
                      const key = `${module}:${action}`;
                      const implied = action === "voir" && droits.some((d) => d.startsWith(`${module}:`) && d !== key);
                      return <td key={key} className="p-2 text-center"><Checkbox
                        aria-label={`${MODULE_LABELS[module]} : ${ACTION_LABELS[action]}`}
                        checked={implied || droits.includes(key)} disabled={implied}
                        onCheckedChange={(checked) => form.setValue("droits", checked ? [...droits, key] : droits.filter((d) => d !== key), { shouldDirty: true })} /></td>;
                    })}
                  </tr>)}</tbody>
                </table>
              </div>
            </div>
            <fieldset className="space-y-2">
              <legend className="mb-3 font-semibold">Permissions spéciales</legend>
              {ALL_SPECIALES.map((speciale) => <label key={speciale} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm">
                <Checkbox aria-label={SPECIALE_LABELS[speciale]} checked={speciales.includes(speciale)} onCheckedChange={(checked) =>
                  form.setValue("speciales", checked ? [...speciales, speciale] : speciales.filter((s) => s !== speciale), { shouldDirty: true })} />
                {SPECIALE_LABELS[speciale]}
              </label>)}
            </fieldset>
          </>}
        </fieldset>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-card p-4">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : user ? "Enregistrer" : "Créer l’utilisateur"}</Button>
        </div>
      </form>
    </Slider>
  );
}
