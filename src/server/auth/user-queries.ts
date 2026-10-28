import { userData } from "@/domain/types/session";
import { dbAdmin } from "@/server/firebase/admin";
import { USERS_COLLECTION_NAME } from "@/domain/collections";

export const getUserDataById = async (userId: string) => {
  const userCollections = dbAdmin.collection(USERS_COLLECTION_NAME);
  const userSnapshot = await userCollections.doc(userId).get();
  const data = userSnapshot.data();
  const userData: userData = {
    id: userSnapshot.id,
    email: data?.email || "",
    name: data?.name || "",
    nom: data?.nom,
    prenom: data?.prenom,
    telephone: data?.telephone,
    poste: data?.poste,
    photoUrl: data?.photoUrl,
    role: data?.role || "user",
    // Droits omis : `getCurrentUser` fusionne ces données par-dessus les claims,
    // qui restent la seule source de vérité des droits.
    disabled: data?.disabled || false,
    createdAt: data?.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate().toISOString()) : undefined,
  };
  return userData;
};

