"use server";

import { dbAdmin } from "@/server/firebase/admin";
import { requireAdmin } from "@/server/auth/session";
import { PARAMETRES_COLLECTION_NAME } from "@/domain/collections";
import { PARAMETRES_INITIAUX, parametresSchema, type Parametres, type ParametresInput } from "@/domain/schemas/parametres-schema";

const ref = () => dbAdmin.collection(PARAMETRES_COLLECTION_NAME).doc("general");

export async function getParametresAction(): Promise<{ courant: Parametres; historique: Parametres[] }> {
  await requireAdmin();
  const [doc, historique] = await Promise.all([
    ref().get(), ref().collection("historique").orderBy("revision", "desc").limit(20).get(),
  ]);
  return {
    courant: doc.exists ? doc.data() as Parametres : PARAMETRES_INITIAUX,
    historique: historique.docs.map((doc) => doc.data() as Parametres),
  };
}

export async function saveParametresAction(input: ParametresInput): Promise<{ error: string } | { success: true }> {
  try {
    const uid = await requireAdmin();
    const result = parametresSchema.safeParse(input);
    if (!result.success) return { error: result.error.issues[0].message };
    await dbAdmin.runTransaction(async (tx) => {
      const doc = await tx.get(ref());
      if ((doc.data()?.revision ?? 0) !== result.data.revision) {
        throw new Error("Ces paramètres ont changé. Rechargez la page avant d'enregistrer.");
      }
      const data = { ...result.data, revision: result.data.revision + 1,
        updatedAt: new Date().toISOString(), updatedBy: uid };
      tx.set(ref(), data);
      tx.create(ref().collection("historique").doc(), data);
    });
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible d'enregistrer les paramètres." };
  }
}
