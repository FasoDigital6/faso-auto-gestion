export async function logout() {
  const headers: Record<string, string> = {};

  await fetch("/api/logout", {
    method: "GET",
    headers,
  });
}
