// "2026-01-12" -> "12 janvier 2026". Formatted in UTC so server and client never disagree.
export function formatDateFr(isoDate: string): string {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
