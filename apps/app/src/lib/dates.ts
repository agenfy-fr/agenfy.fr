/**
 * Converts a local Europe/Paris date ("YYYY-MM-DD") and time ("HH:MM") to an
 * ISO UTC timestamp, handling daylight saving time. null on invalid input.
 */
export function parisDateTime(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const naive = new Date(`${date}T${time}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;
  const offset = parisOffsetMs(naive);
  // Re-evaluate the offset at the corrected instant (DST boundaries).
  const firstGuess = new Date(naive.getTime() - offset);
  return new Date(naive.getTime() - parisOffsetMs(firstGuess)).toISOString();
}

function parisOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asParis = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
  return asParis - Math.floor(instant.getTime() / 60000) * 60000;
}

/** ISO timestamp `hours` hours before now. */
export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}
