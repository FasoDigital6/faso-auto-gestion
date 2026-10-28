"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PdfDownloadOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (includeSignatureImages: boolean) => void;
  action?: "download" | "print" | "email";
  /** Le tenant a configuré au moins un cachet ou une signature — sinon la
   * question n'a pas de sens, on ne la propose pas. */
  hasSignatureAssets?: boolean;
}

export function PdfDownloadOptionsDialog({
  open,
  onOpenChange,
  onConfirm,
  action = "download",
  hasSignatureAssets = true,
}: PdfDownloadOptionsDialogProps) {
  const titleMap = {
    download: "Télécharger le PDF",
    print: "Imprimer le PDF",
    email: "Envoyer par email",
  };
  const title = titleMap[action];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {hasSignatureAssets
              ? "Choisissez si le document doit inclure le cachet et la signature."
              : "Confirmez pour continuer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
          {hasSignatureAssets && (
            <AlertDialogAction
              onClick={() => onConfirm(true)}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Avec cachet et signature
            </AlertDialogAction>
          )}
          <AlertDialogAction
            onClick={() => onConfirm(false)}
            className={
              hasSignatureAssets
                ? "border border-border bg-background text-foreground hover:bg-muted"
                : "bg-brand text-brand-foreground hover:bg-brand/90"
            }
          >
            {hasSignatureAssets ? "Sans cachet ni signature" : "Confirmer"}
          </AlertDialogAction>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
