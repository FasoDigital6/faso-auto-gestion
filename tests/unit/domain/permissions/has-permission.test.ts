import { describe, expect, it } from "vitest";

import {
  accedeAuSite,
  aSpeciale,
  isAdmin,
  peut,
  sitesDe,
} from "@/domain/permissions/has-permission";
import { MODELES_ACCES, Module, Speciale } from "@/domain/permissions/permissions";

const admin = { role: "admin" };
const vendeur = { role: "user", ...MODELES_ACCES.vendeur.acces };
const agentGuinee = { role: "user", ...MODELES_ACCES.agentGuinee.acces };

describe("peut", () => {
  it("donne tout à un admin", () => {
    expect(peut(admin, Module.FINANCES, "supprimer")).toBe(true);
  });

  it("applique les droits du modèle Vendeur", () => {
    expect(peut(vendeur, Module.CLIENTS, "creer")).toBe(true);
    expect(peut(vendeur, Module.VEHICULES, "voir")).toBe(true);
    expect(peut(vendeur, Module.VEHICULES, "modifier")).toBe(false);
    expect(peut(vendeur, Module.FINANCES, "voir")).toBe(false);
  });

  it("accorde « voir » dès qu'une autre action est donnée sur le module", () => {
    const user = { role: "user", droits: ["CONTENEURS:modifier"] };
    expect(peut(user, Module.CONTENEURS, "voir")).toBe(true);
    expect(peut(user, Module.CONTENEURS, "supprimer")).toBe(false);
  });

  it("refuse tout sans utilisateur ou sans droits", () => {
    expect(peut(null, Module.TABLEAU_DE_BORD, "voir")).toBe(false);
    expect(peut({ role: "user" }, Module.TABLEAU_DE_BORD, "voir")).toBe(false);
  });
});

describe("aSpeciale", () => {
  it("réserve « voir les coûts » à l'admin dans les modèles de départ (Q21)", () => {
    expect(aSpeciale(admin, Speciale.VOIR_COUTS)).toBe(true);
    expect(aSpeciale(vendeur, Speciale.VOIR_COUTS)).toBe(false);
    expect(aSpeciale(agentGuinee, Speciale.VOIR_COUTS)).toBe(false);
  });

  it("respecte une permission spéciale accordée à un employé", () => {
    const chef = { role: "user", speciales: ["APPROUVER_PLANCHER"] };
    expect(aSpeciale(chef, Speciale.APPROUVER_PLANCHER)).toBe(true);
    expect(aSpeciale(chef, Speciale.ANNULER)).toBe(false);
  });
});

describe("sites", () => {
  it("donne les deux sites à l'admin", () => {
    expect(sitesDe(admin)).toEqual(["CA", "GN"]);
  });

  it("limite chaque modèle à son site", () => {
    expect(accedeAuSite(vendeur, "CA")).toBe(true);
    expect(accedeAuSite(vendeur, "GN")).toBe(false);
    expect(sitesDe(agentGuinee)).toEqual(["GN"]);
  });

  it("ignore un site inconnu", () => {
    expect(sitesDe({ role: "user", sites: ["CA", "FR"] })).toEqual(["CA"]);
  });
});

describe("isAdmin", () => {
  it("ne reconnaît que le rôle admin", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(vendeur)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
