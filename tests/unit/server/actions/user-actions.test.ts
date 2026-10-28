import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const userDoc = { id: "cible", update: vi.fn(), delete: vi.fn() };
  const users = { kind: "users", doc: () => userDoc };
  const lock = { kind: "lock" };
  const tx = { get: vi.fn(), set: vi.fn(), create: vi.fn() };
  return { userDoc, users, lock, tx, getUser: vi.fn(), createUser: vi.fn(), updateUser: vi.fn(),
    setClaims: vi.fn(), revoke: vi.fn(), requireAdmin: vi.fn(), sendEmail: vi.fn(), events: [] as string[] };
});
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/server/auth/config", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({ sendPasswordResetEmail: mocks.sendEmail }));
vi.mock("@/server/firebase/admin", () => ({
  authAdmin: { getUser: mocks.getUser, createUser: mocks.createUser, updateUser: mocks.updateUser,
    setCustomUserClaims: mocks.setClaims, revokeRefreshTokens: mocks.revoke },
  dbAdmin: {
    collection: (name: string) => name === "users" ? mocks.users : { doc: () => mocks.lock },
    runTransaction: (fn: (tx: typeof mocks.tx) => Promise<unknown>) => fn(mocks.tx),
  },
}));

import { createUserAction, updateUserAction } from "@/server/actions/user-actions";

const profile = { email: "test@sacko.test", nom: "Test", prenom: "Équipe", role: "user", sites: ["CA"],
  droits: ["VEHICULES:voir"], speciales: [], disabled: false, accessVersion: "v2", statut: "actif" };

describe("sérialisation des comptes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.events.length = 0;
    mocks.requireAdmin.mockResolvedValue("admin");
    mocks.getUser.mockResolvedValue({ uid: "cible", customClaims: { role: "user", accessVersion: "v1" } });
    mocks.tx.get.mockImplementation(async (ref) => ref === mocks.lock ? {} : {
      size: 1, docs: [{ id: "cible", data: () => ({ ...profile }) }],
    });
    mocks.userDoc.update.mockImplementation(async (data) => {
      if (data.statut === "actif") mocks.events.push("profil publié");
    });
    mocks.updateUser.mockImplementation(async (_uid, data) => {
      if (data.disabled === false) mocks.events.push("Auth activé");
    });
  });

  it("conserve la version transactionnelle lors d'un patch d'identité après un changement de droits", async () => {
    // Auth aurait fourni v1 avant une modification concurrente ; Firestore porte déjà v2.
    expect(await updateUserAction("cible", { poste: "Responsable" })).toMatchObject({ success: true });
    expect(mocks.tx.set).toHaveBeenCalledWith(mocks.userDoc,
      expect.objectContaining({ accessVersion: "v2", droits: ["VEHICULES:voir"] }), { merge: true });
    expect(mocks.setClaims).not.toHaveBeenCalled();
  });

  it.each([
    { mutationEnCours: "promotion-en-cours", statut: "actif" },
    { statut: "creation" },
  ])("ne compte pas un futur admin encore inaccessible : %j", async (pending) => {
    mocks.tx.get.mockImplementation(async (ref) => ref === mocks.lock ? {} : {
      size: 2, docs: [
        { id: "cible", data: () => ({ ...profile, role: "admin" }) },
        { id: "autre", data: () => ({ ...profile, role: "admin", ...pending }) },
      ],
    });
    expect(await updateUserAction("cible", { disabled: true })).toMatchObject({
      error: "Le dernier administrateur actif ne peut pas être désactivé ni devenir employé.",
    });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("active Auth avant de publier le nouveau compte administrateur", async () => {
    mocks.tx.get.mockImplementation(async (ref) => ref === mocks.lock ? {} : { size: 0, docs: [] });
    expect(await createUserAction({ nom: "Admin", prenom: "Équipe", email: "nouveau@sacko.test", role: "admin" }))
      .toMatchObject({ success: true });
    expect(mocks.events).toEqual(["Auth activé", "profil publié"]);
  });
});
