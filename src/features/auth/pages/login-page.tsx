"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/server/actions/auth-actions";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

const formSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  /* Added showPassword state for password visibility toggle */
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAction(values);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground">Entrez vos identifiants pour retrouver votre espace.</p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-ink px-4 py-3">
            {error}
          </div>
        )}

        <FieldGroup>
          {/* Email Field */}
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id="email"
                  placeholder="Votre adresse email"
                  type="email"
                  
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Password Field */}
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Mot de passe
                </FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    className="pr-11"
                    aria-invalid={fieldState.invalid}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked: boolean) =>
                setRememberMe(checked)
              }
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium cursor-pointer"
            >
              Se souvenir de moi
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-brand-ink hover:text-brand-ink/90 transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={isLoading}
        >
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">© 2026 Sacko-Green Inc. · Conçu par FasoDigital</p>
    </AuthShell>
  );
}
