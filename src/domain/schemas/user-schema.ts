import { z } from "zod";

import {
  ALL_ACTIONS,
  ALL_MODULES,
  ALL_SITES,
  ALL_SPECIALES,
} from "@/domain/permissions/permissions";

// Chaînes vides du formulaire → undefined.
const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

const DROITS_VALIDES = new Set(
  ALL_MODULES.flatMap((module) => ALL_ACTIONS.map((action) => `${module}:${action}`))
);

const droitsSchema = z
  .array(z.string().refine((d) => DROITS_VALIDES.has(d), "Droit inconnu"))
  .optional();
const specialesSchema = z.array(z.enum(ALL_SPECIALES)).optional();
const sitesSchema = z.array(z.enum(ALL_SITES)).optional();

export const createUserSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: emptyStringToUndefined,
  poste: emptyStringToUndefined,
  role: z.enum(["admin", "user"]).default("user"),
  droits: droitsSchema,
  speciales: specialesSchema,
  sites: sitesSchema,
});

export const updateUserSchema = createUserSchema.partial().extend({
  disabled: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
