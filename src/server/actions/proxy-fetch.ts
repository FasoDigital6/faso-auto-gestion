"use server";

const ALLOWED_HOSTS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
];

export async function fetchFileAsBase64(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { success: false, error: "URL invalide" };
  }

  if (parsed.protocol !== "https:") {
    return { success: false, error: "Protocole non autorisé" };
  }

  if (!ALLOWED_HOSTS.some((h) => parsed.hostname === h)) {
    return { success: false, error: "Hôte non autorisé" };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: "Impossible de récupérer le fichier" };
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return { base64, contentType, success: true };
  } catch (error) {
    console.error("Error in fetchFileAsBase64 server action:", error);
    return { success: false, error: "Erreur lors du proxy fetch" };
  }
}
