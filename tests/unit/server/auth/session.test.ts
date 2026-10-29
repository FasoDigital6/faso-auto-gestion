import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ tokens: vi.fn(), verify: vi.fn(), profile: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn().mockResolvedValue({}) }));
vi.mock("next-firebase-auth-edge", () => ({ getTokens: mocks.tokens }));
vi.mock("@/server/auth/config", () => ({ authConfig: {} }));
vi.mock("@/server/firebase/admin", () => ({
  authAdmin: { verifyIdToken: mocks.verify },
  dbAdmin: { collection: () => ({ doc: () => ({ get: mocks.profile }) }) },
}));

import { getVerifiedSession, requireAdmin } from "@/server/auth/session";

describe("session vérifiée", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.tokens.mockResolvedValue({ token: "jwt" });
    mocks.verify.mockResolvedValue({ uid: "admin", role: "admin", accessVersion: "v1" });
    mocks.profile.mockResolvedValue({ data: () => ({ disabled: false, accessVersion: "v1" }) });
  });

  it("vérifie la révocation avant d'autoriser une action admin", async () => {
    expect(await requireAdmin()).toBe("admin");
    expect(mocks.verify).toHaveBeenCalledWith("jwt", true);
  });
  it("refuse un ancien jeton même s'il est encore valide cryptographiquement", async () => {
    mocks.profile.mockResolvedValue({ data: () => ({ disabled: false, accessVersion: "v2" }) });
    expect(await getVerifiedSession()).toBeNull();
    await expect(requireAdmin()).rejects.toThrow("Accès refusé");
  });
  it("refuse immédiatement un compte désactivé", async () => {
    mocks.profile.mockResolvedValue({ data: () => ({ disabled: true, accessVersion: "v1" }) });
    expect(await getVerifiedSession()).toBeNull();
  });
  it("refuse une fiche supprimée ou une création inachevée", async () => {
    mocks.profile.mockResolvedValue({ data: () => undefined });
    expect(await getVerifiedSession()).toBeNull();
    mocks.profile.mockResolvedValue({ data: () => ({ disabled: false, statut: "creation", accessVersion: "v1" }) });
    expect(await getVerifiedSession()).toBeNull();
  });
  it("refuse les jetons révoqués ou les comptes Firebase désactivés", async () => {
    for (const code of ["auth/id-token-revoked", "auth/user-disabled"]) {
      mocks.verify.mockRejectedValue({ code });
      expect(await getVerifiedSession()).toBeNull();
    }
  });
  it("ne transforme pas une panne Firestore en session anonyme", async () => {
    mocks.profile.mockRejectedValue(new Error("Firestore indisponible"));
    await expect(getVerifiedSession()).rejects.toThrow("Firestore indisponible");
  });
  it("ne lit pas le rôle de la fiche Firestore", async () => {
    mocks.verify.mockResolvedValue({ uid: "employe", role: "user", accessVersion: "v1" });
    mocks.profile.mockResolvedValue({ data: () => ({ role: "admin", disabled: false, accessVersion: "v1" }) });
    await expect(requireAdmin()).rejects.toThrow("Accès refusé");
  });
  it("refuse une session absente", async () => {
    mocks.tokens.mockResolvedValue(null);
    expect(await getVerifiedSession()).toBeNull();
    expect(mocks.verify).not.toHaveBeenCalled();
  });
});
