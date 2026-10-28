import { z } from "zod";

const texte = z.string().trim().max(500);
const taux = z.number({ error: "Saisissez un taux valide" }).finite().positive("Le taux doit être supérieur à zéro").max(1e12, "Le taux est trop élevé");

export const parametresSchema = z.object({
  revision: z.number().int().nonnegative(),
  taux: z.object({ CAD: z.literal(1), USD: taux, GNF: taux }),
  taxes: z.object({
    tps: z.number({ error: "Saisissez un pourcentage valide" }).finite().min(0, "Le taux doit être positif").max(100, "Le taux ne peut pas dépasser 100 %"),
    tvq: z.number({ error: "Saisissez un pourcentage valide" }).finite().min(0, "Le taux doit être positif").max(100, "Le taux ne peut pas dépasser 100 %"),
  }),
  entreprise: z.object({
    nom: texte.min(2, "Le nom de l'entreprise est requis"),
    adresse: texte,
    ville: texte,
    pays: texte,
    telephone: texte,
    email: z.union([z.literal(""), z.email()]),
    numTps: texte,
    numTvq: texte,
    piedDePage: texte,
    comptesBancaires: z.array(z.object({ banque: texte.min(1), numero: texte.min(1) })).max(5),
  }),
});

export type ParametresInput = z.infer<typeof parametresSchema>;
export type Parametres = Omit<ParametresInput, "taux"> & {
  taux: ParametresInput["taux"] | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export const PARAMETRES_INITIAUX: Parametres = {
  revision: 0,
  taux: null,
  taxes: { tps: 5, tvq: 9.975 },
  entreprise: {
    nom: "Sacko-Vert Inc.", adresse: "1936, boulevard Saint-Régis",
    ville: "Dorval (Québec) H9P 1H6", pays: "Canada",
    telephone: "", email: "", numTps: "", numTvq: "", piedDePage: "", comptesBancaires: [],
  },
  updatedAt: null,
  updatedBy: null,
};
