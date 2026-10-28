import { ShieldX } from "lucide-react";
import { LogoutLink } from "@/features/auth/components/logout-link";

export const metadata = {
  title: "Accès refusé | Sacko-Green Gestion",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive-ink" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Accès refusé</h1>
          <p className="text-sm text-muted-foreground">
            Votre compte n&apos;a pas les autorisations nécessaires pour accéder à
            cette page.
          </p>
        </div>
        <LogoutLink className="inline-block text-sm font-medium text-brand-ink hover:underline" />
      </div>
    </div>
  );
}
