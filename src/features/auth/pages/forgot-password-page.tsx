"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth_client } from "@/data/firebase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@/components/ui/field";

const formSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
});

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await sendPasswordResetEmail(auth_client, values.email);
            setSuccess("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
            form.reset();
        } catch (err: unknown) {
            console.error("Reset password error:", err);
            // For security reasons, we might want to show success even if it fails,
            // but for better UX in this internal app, we'll show a generic error.
            setError("Une erreur est survenue lors de l'envoi de l'email.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthShell>
            <div className="space-y-2">
                <h1 className="font-serif text-3xl font-semibold tracking-tight">Mot de passe oublié</h1>
                <p className="text-muted-foreground">
                    Entrez votre email : nous vous envoyons un lien pour choisir un nouveau mot de passe.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive-ink">
                        {error}
                    </div>
                )}

                {success && (
                    <div role="status" className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-success-ink">
                        {success}
                    </div>
                )}

                <FieldGroup>
                    <Controller
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="email" className="text-sm font-semibold">
                                    Email
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="email"
                                    placeholder="Votre adresse email"
                                    type="email"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Envoi en cours…" : "Envoyer le lien"}
                </Button>

                <p>
                    <Link href="/login" className="font-semibold text-brand-ink hover:underline">
                        Retour à la connexion
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}
