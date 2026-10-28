"use client";

import { useEffect, useState } from "react";
import { FileText, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TYPES_ACCEPTES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const TAILLE_MAX = 10 * 1024 * 1024;

interface PreuveUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titre: string;
  description: string;
  /** Libellé du bouton de validation. */
  action?: string;
  /** Message d'avertissement affiché au-dessus de la zone de dépôt (remplacement). */
  avertissement?: string;
  /** Envoie le fichier ; l'erreur levée est affichée telle quelle. */
  onTeleverser: (fichier: File) => Promise<void>;
}

/**
 * Dépôt d'un justificatif (PDF, JPEG, PNG, 10 Mo max) : choix du fichier, aperçu,
 * validation. Partagé par toutes les preuves (BDL, BDC, contrat).
 */
export function PreuveUploadDialog({
  open,
  onOpenChange,
  titre,
  description,
  action = "Téléverser",
  avertissement,
  onTeleverser,
}: PreuveUploadDialogProps) {
  const [fichier, setFichier] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (!open) {
      setFichier(null);
      setApercu(null);
    }
  }, [open]);

  const choisir = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!TYPES_ACCEPTES.includes(f.type)) {
      toast.error("Type de fichier non supporté. Utilisez JPEG, PNG ou PDF.");
      return;
    }
    if (f.size > TAILLE_MAX) {
      toast.error("Le fichier est trop volumineux. Taille maximale : 10 Mo.");
      return;
    }
    setFichier(f);
    if (f.type.startsWith("image/")) {
      const lecteur = new FileReader();
      lecteur.onloadend = () => setApercu(lecteur.result as string);
      lecteur.readAsDataURL(f);
    } else {
      setApercu(null);
    }
  };

  const valider = async () => {
    if (!fichier) return;
    setEnCours(true);
    try {
      await onTeleverser(fichier);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors du téléversement:", error);
      toast.error(`Erreur lors du téléversement : ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !enCours && onOpenChange(o)}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {avertissement && (
          <p role="note" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-ink">
            {avertissement}
          </p>
        )}

        {!fichier ? (
          <label
            htmlFor="preuve-fichier"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring"
          >
            <Upload className="mb-3 size-10 text-muted-foreground" />
            <span className="font-medium">Choisir un fichier</span>
            <span className="mt-1 text-sm text-muted-foreground">PDF, JPEG ou PNG, 10 Mo maximum</span>
            <input id="preuve-fichier" type="file" accept={TYPES_ACCEPTES.join(",")} onChange={choisir} className="sr-only" />
          </label>
        ) : (
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {fichier.type === "application/pdf" ? (
                  <FileText className="size-8 shrink-0 text-destructive-ink" />
                ) : (
                  <ImageIcon className="size-8 shrink-0 text-info-ink" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{fichier.name}</p>
                  <p className="text-sm text-muted-foreground">{(fichier.size / 1024 / 1024).toFixed(2)} Mo</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Retirer le fichier" onClick={() => setFichier(null)} disabled={enCours}>
                <X />
              </Button>
            </div>
            {apercu && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={apercu} alt="Aperçu du fichier choisi" className="mt-3 h-48 w-full rounded border object-contain" />
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enCours}>
            Annuler
          </Button>
          <Button onClick={valider} disabled={!fichier || enCours}>
            {enCours && <Loader2 className="animate-spin" />}
            {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
