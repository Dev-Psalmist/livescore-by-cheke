/**
 * Temporary API-Football free-plan controls.
 *
 * After upgrading the provider subscription, set FREE_PLAN_TODAY_ONLY to false
 * to restore the existing multi-day fixture calendar and competition window.
 */
export const FREE_PLAN_TODAY_ONLY = true;

/**
 * A 30-minute server-side cache keeps the shared daily fixtures feed well
 * below the 100-request daily free-plan allowance, leaving quota for other
 * features that use separate API-Football endpoints.
 */
export const FOOTBALL_CACHE_SECONDS = 1800;

export function getLagosDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the current Lagos date.");
  }

  return `${year}-${month}-${day}`;
}
