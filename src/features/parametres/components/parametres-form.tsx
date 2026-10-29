"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { parametresSchema, type ParametresInput, type Parametres } from "@/domain/schemas/parametres-schema";
import { saveParametresAction } from "@/server/actions/parametres-actions";

export function ParametresForm({ courant, onSaved }: { courant: Parametres; onSaved: () => Promise<unknown> }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ParametresInput>({ resolver: zodResolver(parametresSchema), defaultValues: {
    ...courant, taux: courant.taux ?? { CAD: 1, USD: Number.NaN, GNF: Number.NaN },
  } });
  const banks = useFieldArray({ control: form.control, name: "entreprise.comptesBancaires" });
  const busy = form.formState.isSubmitting;
  const numericFields = [
    ["taux.USD", "1 CAD en USD", "0.000001"], ["taux.GNF", "1 CAD en GNF", "0.000001"],
    ["taxes.tps", "TPS (%)", "0.001"], ["taxes.tvq", "TVQ (%)", "0.001"],
  ] as const;

  async function submit(data: ParametresInput) {
    setError(null);
    try {
      const result = await saveParametresAction(data);
      if ("error" in result) { setError(result.error); return; }
      toast.success("Paramètres enregistrés et ajoutés à l’historique.");
      await onSaved();
    } catch { setError("L’enregistrement a échoué. Réessayez."); }
  }

  return <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
    <fieldset disabled={busy} className="space-y-6">
      <Card>
        <CardHeader><h2 className="font-serif text-xl font-semibold">Devises et taxes</h2>
          <CardDescription>Le dollar canadien est la base. Chaque opération conservera les taux utilisés à sa date.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          {!courant.taux && <p role="status" className="rounded-md bg-info/10 p-3 text-sm text-info-ink">Renseignez les taux actuels avant le premier enregistrement. Aucun taux de change n’est prérempli.</p>}
          <div className="grid gap-5 sm:grid-cols-2">
            {numericFields.map(([path, label, step]) => {
              const [group, key] = path.split(".");
              const fieldError = group === "taux" ? form.formState.errors.taux?.[key as "USD" | "GNF"] : form.formState.errors.taxes?.[key as "tps" | "tvq"];
              return <Field key={path}><FieldLabel htmlFor={path}>{label}</FieldLabel>
                <Input id={path} type="number" inputMode="decimal" step={step} min={group === "taux" ? step : "0"} max={group === "taxes" ? "100" : undefined}
                  {...form.register(path, { valueAsNumber: true })} aria-invalid={!!fieldError} />
                <FieldError errors={[fieldError]} />
              </Field>;
            })}
          </div>
          <p className="text-sm text-muted-foreground">TPS et TVQ sont réglables séparément. Les taxes resteront décochées par défaut sur les ventes. L’arrondi des prix est fixé par les règles métier.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h2 className="font-serif text-xl font-semibold">Identité de l’entreprise</h2>
          <CardDescription>Coordonnées et mentions utilisées sur les factures, les reçus et les dossiers. Le logo Sacko-Green est déjà intégré.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {([
              ["nom", "Nom légal *"], ["adresse", "Adresse"], ["ville", "Ville et code postal"], ["pays", "Pays"],
              ["telephone", "Téléphone"], ["email", "Email de l’entreprise"], ["numTps", "Numéro de TPS"], ["numTvq", "Numéro de TVQ"],
            ] as const).map(([name, label]) => <Field key={name}>
              <FieldLabel htmlFor={`entreprise-${name}`}>{label}</FieldLabel>
              <Input id={`entreprise-${name}`} type={name === "email" ? "email" : name === "telephone" ? "tel" : "text"}
                {...form.register(`entreprise.${name}`)} aria-invalid={!!form.formState.errors.entreprise?.[name]} />
              <FieldError errors={[form.formState.errors.entreprise?.[name]]} />
            </Field>)}
          </div>
          <p className="text-sm text-muted-foreground">Les numéros d’inscription sont à confirmer avant de les renseigner.</p>
          <Field><FieldLabel htmlFor="pied-de-page">Mention en pied de document</FieldLabel>
            <Textarea id="pied-de-page" {...form.register("entreprise.piedDePage")} />
            <FieldError errors={[form.formState.errors.entreprise?.piedDePage]} />
          </Field>
          <fieldset className="space-y-3">
            <legend className="mb-3 font-semibold">Comptes bancaires</legend>
            {banks.fields.map((field, index) => <div key={field.id} className="grid items-start gap-3 rounded-md border p-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field><FieldLabel htmlFor={`banque-${index}`}>Banque {index + 1}</FieldLabel>
                <Input id={`banque-${index}`} {...form.register(`entreprise.comptesBancaires.${index}.banque`)} />
                <FieldError errors={[form.formState.errors.entreprise?.comptesBancaires?.[index]?.banque]} />
              </Field>
              <Field><FieldLabel htmlFor={`compte-${index}`}>Numéro de compte {index + 1}</FieldLabel>
                <Input id={`compte-${index}`} {...form.register(`entreprise.comptesBancaires.${index}.numero`)} />
                <FieldError errors={[form.formState.errors.entreprise?.comptesBancaires?.[index]?.numero]} />
              </Field>
              <Button type="button" variant="ghost" className="sm:mt-6" aria-label={`Retirer le compte ${index + 1}`} onClick={() => banks.remove(index)}>Retirer</Button>
            </div>)}
            <Button type="button" variant="outline" disabled={banks.fields.length >= 5} onClick={() => banks.append({ banque: "", numero: "" })}>Ajouter un compte bancaire</Button>
          </fieldset>
        </CardContent>
      </Card>
    </fieldset>
    {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-ink">{error}</p>}
    <div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer les paramètres"}</Button></div>
  </form>;
}
