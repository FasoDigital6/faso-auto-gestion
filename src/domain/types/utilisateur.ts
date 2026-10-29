import type { CreateUserInput } from "@/domain/schemas/user-schema";

export type Utilisateur = CreateUserInput & {
  id: string;
  disabled: boolean;
  createdAt: string;
  invitationEnvoyee?: boolean;
  statut?: "creation" | "actif";
};

export const MAX_UTILISATEURS = 15;
