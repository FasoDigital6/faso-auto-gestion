import { describe, it, expect } from "vitest";
import { PARAMETRES_INITIAUX, parametresSchema } from "@/domain/schemas/parametres-schema";
import { createUserSchema, updateUserSchema } from "@/domain/schemas/user-schema";

describe("paramètres", () => {
  const input = { ...PARAMETRES_INITIAUX, taux: { CAD: 1, USD: 0.72, GNF: 6300 } };
  it("conserve les taux saisis et la précision de la TVQ", () => {
    const result = parametresSchema.parse(input);
    expect(result.taxes).toEqual({ tps: 5, tvq: 9.975 });
    expect(result.taux).toEqual({ CAD: 1, USD: 0.72, GNF: 6300 });
  });
  it("n'invente aucun taux de change au premier démarrage", () => {
    expect(PARAMETRES_INITIAUX.taux).toBeNull();
    expect(parametresSchema.safeParse(PARAMETRES_INITIAUX).success).toBe(false);
  });
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("refuse le taux USD %s", (USD) => {
    expect(parametresSchema.safeParse({ ...input, taux: { ...input.taux, USD } }).success).toBe(false);
  });
  it("fixe CAD à 1 et refuse les taxes hors de 0 à 100 %", () => {
    expect(parametresSchema.safeParse({ ...input, taux: { ...input.taux, CAD: 2 } }).success).toBe(false);
    for (const tps of [-0.01, 100.01]) expect(parametresSchema.safeParse({ ...input, taxes: { ...input.taxes, tps } }).success).toBe(false);
  });
});

describe("formulaire utilisateur", () => {
  it("ne rétrograde pas un administrateur quand on ne modifie que son état", () => {
    expect(updateUserSchema.parse({ disabled: true })).toEqual({ disabled: true });
    expect(updateUserSchema.parse({ poste: "Gestion" })).not.toHaveProperty("role");
  });
  it("normalise l'email et conserve les champs vidés", () => {
    expect(createUserSchema.parse({ nom: " Test ", prenom: " Amadou ", email: " ADMIN@SACKO.TEST ", telephone: "", poste: "" }))
      .toMatchObject({ nom: "Test", prenom: "Amadou", email: "admin@sacko.test", telephone: "", poste: "" });
    expect(updateUserSchema.parse({ telephone: "", poste: "" })).toMatchObject({ telephone: "", poste: "" });
  });
  it("refuse un droit inconnu et un numéro de téléphone incompatible avec Firebase", () => {
    expect(updateUserSchema.safeParse({ droits: ["TOUT:admin"] }).success).toBe(false);
    expect(updateUserSchema.safeParse({ telephone: "514 555 1234" }).success).toBe(false);
    expect(updateUserSchema.safeParse({ telephone: "+15145551234" }).success).toBe(true);
  });
});
