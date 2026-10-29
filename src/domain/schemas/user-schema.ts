import { z } from "zod";

import {
  ALL_ACTIONS,
  ALL_MODULES,
  ALL_SITES,
  ALL_SPECIALES,
} from "@/domain/permissions/permissions";

// Les chaînes vides sont conservées pour permettre de vider un champ.
const optionalText = z.string().trim().max(200).optional();

const DROITS_VALIDES = new Set(
  ALL_MODULES.flatMap((module) => ALL_ACTIONS.map((action) => `${module}:${action}`))
);

const droitsSchema = z
  .array(z.string().refine((d) => DROITS_VALIDES.has(d), "Droit inconnu"))
  .optional();
const specialesSchema = z.array(z.enum(ALL_SPECIALES)).optional();
const sitesSchema = z.array(z.enum(ALL_SITES)).optional();
const telephoneSchema = z.string().trim().refine(
  (value) => value === "" || /^\+[1-9]\d{7,14}$/.test(value),
  "Utilisez le format international, par exemple +15145551234",
).optional();

export const createUserSchema = z.object({
  nom: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  prenom: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").max(100),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  telephone: telephoneSchema,
  poste: optionalText,
  role: z.enum(["admin", "user"]).default("user"),
  droits: droitsSchema,
  speciales: specialesSchema,
  sites: sitesSchema,
});

export const updateUserSchema = createUserSchema.partial().extend({
  // Zod 4 applique aussi le default dans un objet partiel : une modification
  // d'état ne doit jamais changer implicitement le rôle d'un administrateur.
  role: z.enum(["admin", "user"]).optional(),
  disabled: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
